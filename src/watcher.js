import { watch } from 'melanke-watchjs';
import _ from 'lodash';
import axios from 'axios';
import parser from './parser.js';
import validator from './validator.js';
import render from './render.js';

export default () => {
    const state = {
        input: {
            url: '',
            process: 'filling',
            flows: [],
        },
        error: '',
        isValid: false,
        content: {
            activeFeed: '',
            feedsList: [],
            itemsList: [],
        },
    };
    const point = document.getElementById('point');
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
    point.append(container);
    const inputUrl = document.querySelector('.form-control');
    const button = document.querySelector('.btn');
    const corsUrl = 'https://cors-anywhere.herokuapp.com/';
    inputUrl.addEventListener('input', (e) => {
        state.input.url = e.target.value;
        validator(state, e.target.value);
    });
    watch(state, 'error', () => {
        const errorElement = inputUrl.nextElementSibling;
        const invalidClass = document.querySelector('.border');
        if (invalidClass) {
            inputUrl.classList.remove('border', 'border-danger');
            errorElement.remove();
        }
        if (state.error === '' || state.input.url === '') {
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
                button.classList.remove('disabled');
                break;
            case 'sending':
                button.classList.add('disabled');
                break;
            case 'finished':
                button.classList.remove('disabled');
                render(state);
                break;
            default:
                throw new Error(`Unknown state: ${process}`)
        }
    });

    watch(state, 'isValid', () => {
        if (state.isValid) {
            button.classList.remove('disabled');
        }
        if (!state.isValid) {
            button.classList.add('disabled');
        }
    });

    button.addEventListener('click', (e) => {
        e.preventDefault();
        const link = `${corsUrl}${state.input.url}`;
        state.input.process = 'sending';
        axios.get(link)
            .then((response) => {
                const domParser = new DOMParser();
                const xml = domParser.parseFromString(response.data, 'text/xml');
                return xml;
            })
            .then((xml) => {
                const input = document.querySelector('input');
                const data = parser(xml);
                const newFeed = { id: _.uniqueId(), name: data.title, description: data.description, link: state.input.url };
                data.itemsList.forEach((el) => {
                    state.content.itemsList.push({ id: newFeed.id, title: el.titleItem, link: el.linkItem})
                });
                state.content.feedsList.push(newFeed);
                state.content.activeFeed = newFeed.id;
                state.input.process = 'finished';
                input.value = '';
            })
            .catch((error) => {
                state.input.process = 'filling';
                state.error = 'Network Problems. Try again!';
                return console.log(error);
            })
    });

    const updater = () => {
        const promises = state.content.feedsList.map((el) => axios.get(`${corsUrl}${el.link}`));
        Promise.all(promises)
            .then((response) => {
                const domParser = new DOMParser();
                response.map((el) => {
                    const xml = domParser.parseFromString(el.data, 'text/xml');
                    const { title, itemsList } = parser(xml);
                    const currentFeed = state.content.feedsList.filter((el) => el.name === title);
                    const newItems = [];
                    itemsList.forEach((el) => {
                        newItems.push({ id: currentFeed.id, title: el.titleItem, link: el.linkItem})
                    });
                    _.set(state, state.content.itemsList, newItems);
                    console.log(newItems);
                    console.log(state.content.itemsList);
                });
            })
            .catch((error) => {
                state.error = 'Network Problems. Try again!';
                return console.log(error);
            })
            .finally(() => setTimeout(updater, 5000));
    };
    setTimeout(updater, 5000);

    watch(state.content, 'itemsList', () => {
        render(state);
    });
};