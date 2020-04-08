/* eslint-disable no-param-reassign */

import i18next from 'i18next';
import { watch } from 'melanke-watchjs';
import _ from 'lodash';
import { string } from 'yup';
import axios from 'axios';
import resources from './locales';
import parse from './parser';
import render from './render';

const validate = (url, wasAddedBefore) => {
  let error = null;
  const validateUrl = string()
    .min(1, 'empty')
    .url('notValid')
    .notOneOf(wasAddedBefore, 'duplicate');
  try {
    validateUrl.validateSync(url);
    error = null;
  } catch (err) {
    error = err.message;
  }
  return error;
};

const updateValidationState = (state) => {
  const wasAddedBefore = state.feeds.map((feed) => feed.link);
  const error = validate(state.input.url, wasAddedBefore);
  state.input.error = error;
  state.input.isValid = error === null;
};

export default () => {
  const state = {
    input: {
      error: null,
      url: null,
      isValid: false,
      process: 'filling',
    },
    activeFeed: null,
    feeds: [],
    posts: [],
  };

  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  });

  const inputUrl = document.querySelector('.form-control');
  const button = document.querySelector('.btn');
  const form = document.querySelector('.form-groups');
  const corsUrl = 'https://cors-anywhere.herokuapp.com/';

  inputUrl.addEventListener('input', (e) => {
    state.input.url = e.target.value;
    updateValidationState(state);
  });

  watch(state.input, 'error', () => {
    const errorElement = inputUrl.nextElementSibling;
    const invalidClass = document.querySelector('.border');
    if (invalidClass) {
      inputUrl.classList.remove('border', 'border-danger');
      errorElement.remove();
    }
    if (state.input.error === null) {
      return;
    }
    const feedbackElement = document.createElement('div');
    feedbackElement.classList.add('border');
    feedbackElement.textContent = i18next.t(state.input.error);
    inputUrl.classList.add('border', 'border-danger');
    inputUrl.after(feedbackElement);
  });

  watch(state.input, 'process', () => {
    const { process } = state.input;
    switch (process) {
      case 'filling':
        button.disabled = false;
        break;
      case 'sending':
        button.disabled = true;
        break;
      case 'finished':
        button.disabled = true;
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
          name: data.titleFeed,
          description: data.description,
          link: state.input.url,
        };
        data.posts.forEach((el) => {
          state.posts.push({
            id: newFeed.id,
            title: el.title,
            link: el.link,
            pubDate: el.pubDate,
          });
        });
        state.feeds.push(newFeed);
        state.activeFeed = newFeed.id;
        state.input.process = 'finished';
      })
      .catch((error) => {
        state.input.process = 'filling';
        state.input.error = error.response.status;
        throw error;
      });
  });

  const updater = () => {
    const promises = state.feeds.map((el) => axios.get(`${corsUrl}${el.link}`));
    Promise.all(promises)
      .then((response) => {
        response.map((el) => {
          const { titleFeed, posts } = parse(el.data);
          const currentFeed = state.feeds.find((elem) => elem.name === titleFeed);
          const currentItems = state.posts.filter((elem) => elem.id === currentFeed.id);
          const lastItem = _.max(currentItems.map(({ pubDate }) => pubDate));
          const differenceBy = posts.filter((elem) => elem.pubDate > lastItem);
          differenceBy.forEach((elem) => {
            state.posts = [{
              id: currentFeed.id,
              title: elem.title,
              link: elem.link,
              pubDate: elem.pubDate,
            }, ...state.posts];
          });
          return response;
        });
      })
      .catch((error) => {
        state.input.error = error.response.status;
        throw error;
      })
      .finally(() => setTimeout(updater, 5000));
  };
  setTimeout(updater, 5000);

  watch(state, 'posts', () => {
    render(state);
  });
};
