/* eslint-disable no-param-reassign */

import i18next from 'i18next';
import { watch } from 'melanke-watchjs';
import _ from 'lodash';
import { string } from 'yup';
import axios from 'axios';
import parse from './parser';
import render from './render';

const checkDublicate = (url, state) => !!state.feeds.find(({ link }) => link === url);

const validate = (url) => {
  let error = '';
  const validateUrl = string().url().isValidSync(url);
  if (!validateUrl) {
    error = 'notValid';
  }
  if (validateUrl) {
    error = '';
  }
  if (url === '') {
    error = 'empty';
  }
  return error;
};

const updateState = (state) => {
  const error = validate(state.input.url);
  state.error = error;
  if (checkDublicate(state.input.url, state)) {
    state.error = 'dublicate';
  }
  state.input.isValid = _.isEqual(error, '');
};

export default () => {
  const state = {
    input: {
      url: '',
      isValid: false,
      process: 'filling',
    },
    error: '',
    activeFeed: '',
    feeds: [],
    itemsList: [],
  };

  i18next.init({
    lng: 'en',
    debug: true,
    resources: {
      en: {
        translation: {
          network: 'Network Problems. Try again!',
          dublicate: 'URL is present in rss flow!',
          notValid: 'Value is not a valid url!',
          empty: 'Input field should not to be empty',
        },
      },
    },
  });

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

  inputUrl.addEventListener('input', (e) => {
    state.input.url = e.target.value;
    updateState(state);
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
    feedbackElement.textContent = i18next.t(state.error);
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
        const data = parse(response.data);
        const newFeed = {
          id: _.uniqueId(),
          name: data.title,
          description: data.description,
          link: state.input.url,
        };
        data.itemsList.forEach((el) => {
          state.itemsList.push({
            id: newFeed.id,
            title: el.titleItem,
            link: el.linkItem,
            pubDate: el.pubDate,
          });
        });
        state.feeds.push(newFeed);
        state.activeFeed = newFeed.id;
        state.input.process = 'finished';
      })
      .catch((error) => {
        state.input.process = 'filling';
        state.error = 'network';
        throw error;
      });
  });

  const updater = () => {
    const promises = state.feeds.map((el) => axios.get(`${corsUrl}${el.link}`));
    Promise.all(promises)
      .then((response) => {
        response.map((el) => {
          const { title, itemsList } = parse(el.data);
          const currentFeed = state.feeds.find((elem) => elem.name === title);
          const currentItems = state.itemsList.filter((elem) => elem.id === currentFeed.id);
          const lastItem = _.max(currentItems.map(({ pubDate }) => pubDate));
          const differenceBy = itemsList.filter((elem) => elem.pubDate > lastItem);
          differenceBy.forEach((elem) => {
            state.itemsList = [{
              id: currentFeed.id,
              title: elem.titleItem,
              link: elem.linkItem,
              pubDate: elem.pubDate,
            }, ...state.itemsList];
          });
          return response;
        });
      })
      .catch((error) => {
        state.error = 'network';
        throw error;
      })
      .finally(() => setTimeout(updater, 5000));
  };
  setTimeout(updater, 5000);

  watch(state, 'itemsList', () => {
    render(state);
  });
};
