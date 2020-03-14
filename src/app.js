import i18next from 'i18next';
import { watch } from 'melanke-watchjs';
import _ from 'lodash';
import { string } from 'yup';
import axios from 'axios';
import resources from './locales';
import parser from './parser';
import render from './render';

export default () => {
  const promise = i18next.init({
    lng: 'en',
    debug: true,
    resources,
  });

  const state = {
    input: {
      url: '',
      isValid: false,
      process: 'filling',
      flows: [],
    },
    error: '',
    content: {
      activeFeed: '',
      feedsList: [],
      itemsList: [],
    },
  };
  const container = document.querySelector('.container');
  const row = document.createElement('div');
  row.classList.add('row');
  const colFeed = document.createElement('div');
  colFeed.classList.add('col-3');
  row.appendChild(colFeed);
  const colItem = document.createElement('div');
  colItem.classList.add('col-9');
  row.appendChild(colItem);
  container.appendChild(row);
  const inputUrl = document.querySelector('.form-control');
  const button = document.querySelector('.btn');
  const form = document.querySelector('.form-groups');
  const corsUrl = 'https://cors-anywhere.herokuapp.com/';

  const validate = (value) => {
    if (value === '') {
      state.input.isValid = false;
      promise.then((t) => { state.error = t('empty'); });
      return;
    }
    if (_.includes(state.input.flows, value)) {
      state.input.isValid = false;
      promise.then((t) => { state.error = t('dublicate'); });
      return;
    }
    const schema = string().url();
    schema.isValid(value)
      .then((data) => {
        if (!data) {
          state.input.isValid = false;
          promise.then((t) => { state.error = t('notValid'); });
        }
        if (data) {
          state.input.isValid = true;
          state.error = '';
          state.input.flows.push(value);
        }
      });
  };

  inputUrl.addEventListener('input', (e) => {
    validate(e.target.value);
  });

  watch(state, 'error', () => {
    const errorElement = inputUrl.nextElementSibling;
    const invalidClass = document.querySelector('.border');
    if (invalidClass) {
      inputUrl.classList.remove('border', 'border-danger');
      errorElement.remove();
    }
    if (state.error === '') {
      return;
    }
    const feedbackElement = document.createElement('div');
    feedbackElement.classList.add('border');
    feedbackElement.textContent = state.error;
    inputUrl.classList.add('border', 'border-danger');
    inputUrl.after(feedbackElement);
  });

  watch(state.input, 'process', () => {
    const { process } = state.input;
    switch (process) {
      case 'filling':
        button.disabled = 'false';
        break;
      case 'sending':
        button.disabled = 'true';
        break;
      case 'finished':
        button.disabled = 'true';
        render(state);
        break;
      default:
        throw new Error(`Unknown state: ${process}`);
    }
  });

  watch(state.input, 'isValid', () => {
    button.disabled = !state.input.isValid;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    state.input.url = value;
    const link = `${corsUrl}${state.input.url}`;
    state.input.process = 'sending';
    axios.get(link)
      .then((response) => {
        const data = parser(response.data);
        const newFeed = {
          id: _.uniqueId(),
          name: data.title,
          description: data.description,
          link: state.input.url,
        };
        data.itemsList.forEach((el) => {
          state.content.itemsList.push({
            id: newFeed.id,
            title: el.titleItem,
            link: el.linkItem,
            pubDate: el.pubDate,
          });
        });
        state.content.feedsList.push(newFeed);
        state.content.activeFeed = newFeed.id;
        state.input.process = 'finished';
        form.reset();
      })
      .catch((error) => {
        state.input.process = 'filling';
        promise.then((t) => { state.error = t('network'); });
        throw error;
      });
  });

  const updater = () => {
    const promises = state.content.feedsList.map((el) => axios.get(`${corsUrl}${el.link}`));
    Promise.all(promises)
      .then((response) => {
        response.map((el) => {
          const { title, itemsList } = parser(el.data);
          const currentFeed = state.content.feedsList.find((elem) => elem.name === title);
          const currentItems = state.content.itemsList.filter((elem) => elem.id === currentFeed.id);
          const lastItem = _.max(currentItems.map(({ pubDate }) => pubDate));
          const newItems = itemsList.filter((elem) => elem.pubDate > lastItem);
          newItems.forEach((elem) => {
            state.content.itemsList = [{
              id: currentFeed.id,
              title: elem.titleItem,
              link: elem.linkItem,
              pubDate: elem.pubDate,
            }, ...state.content.itemsList];
          });
          return response;
        });
      })
      .catch((error) => {
        promise.then((t) => { state.error = t('network'); });
        throw error;
      })
      .finally(() => setTimeout(updater, 5000));
  };
  setTimeout(updater, 5000);

  watch(state.content, 'itemsList', () => {
    render(state);
  });
};
