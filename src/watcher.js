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
            title: '',
            description: '',
            items: '',
            feedsList: [],
        }
    };
    const inputUrl = document.querySelector('.form-control');
    const button = document.querySelector('.btn-primary');
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
                button.classList.add('disabled');
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
                const newFeed = { id: _.uniqueId(), name: data.title, items: data.itemsList};
                state.content.feedsList.push(newFeed);
                state.content.title = data.title;
                state.content.description = data.description;
                state.content.items = data.itemsList;
                state.input.process = 'finished';
                input.value = '';
            })
            .catch((error) => {
                state.input.process = 'filling';
                state.error = 'Network Problems. Try again!';
                return console.log(error);
            })
    });
};