import JumbotronRSS from './jumbotron';

export default () => {
    const jumbotron = document.createElement('div');
    jumbotron.classList.add('jumbotron');
    const h1 = document.createElement('h1');
    h1.classList.add('display-4');
    h1.textContent = 'RSS Reader';
    jumbotron.append(h1);
    const discription = document.createElement('p');
    discription.classList.add('lead');
    discription.textContent = 'Customize your RSS flow';
    jumbotron.append(discription);
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.classList.add('form-control', 'form-control-lg');
    jumbotron.append(input);
    const pButton = document.createElement('p');
    pButton.classList.add('lead');
    const button = document.createElement('a');
    button.classList.add('btn', 'btn-primary', 'btn-lg');
    button.setAttribute('href', '#');
    button.setAttribute('role', 'button');
    button.textContent = 'Add';
    pButton.append(button);
    jumbotron.append(pButton);
    const obj = new JumbotronRSS(jumbotron);
    obj.init();
};