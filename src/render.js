const buildItem = (state) => {
    const list = document.createElement('ul'); 
    state.content.items.forEach((el) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.setAttribute('href', el.linkItem);
        a.textContent = el.titleItem;
        li.append(a);
        list.append(li);
    });
    return { list };
};

export default (state) => {
    const body = document.querySelector('body');
    const conteiner = document.createElement('div');
    const title = document.createElement('h1');
    title.textContent = state.content.title;
    const description = document.createElement('p');
    description.textContent = state.content.description;
    const resultItems = buildItem(state);
    conteiner.append(title);
    conteiner.append(description);
    conteiner.append(resultItems.list);
    body.append(conteiner);
};