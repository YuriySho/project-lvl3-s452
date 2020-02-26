import JumbotronRSS from './jumbotron.js';
import i18next from 'i18next';
import resources from './locales';

export default () => {
    i18next.init({
        lng: 'en',
        debug: true,
        resources,
    });
    const jumbotron = document.createElement('div');
    jumbotron.classList.add('jumbotron');
    const h1 = document.createElement('h1');
    h1.classList.add('display-4');
    h1.textContent = `${i18next.t('title')}`;
    jumbotron.append(h1);
    const discription = document.createElement('p');
    discription.classList.add('lead');
    discription.textContent = `${i18next.t('description')}`;
    jumbotron.append(discription);
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('value', '');
    input.classList.add('form-control', 'form-control-lg');
    jumbotron.append(input);
    const pButton = document.createElement('p');
    pButton.classList.add('lead');
    const button = document.createElement('a');
    button.classList.add('btn', 'btn-primary', 'btn-lg');
    button.setAttribute('href', '#');
    button.setAttribute('role', 'button');
    button.textContent = `${i18next.t('button')}`;
    pButton.append(button);
    jumbotron.append(pButton);
    const obj = new JumbotronRSS(jumbotron);
    obj.init();
};