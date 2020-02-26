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
    const row = document.querySelector('.row');
    const col = document.createElement('div');
    col.classList.add('col-sm-4', 'border', 'border-dark');
    const title = document.createElement('h1');
    title.textContent = state.content.title;
    const description = document.createElement('p');
    description.textContent = state.content.description;
    const resultItems = buildItem(state);
    col.append(title);
    col.append(description);
    col.append(resultItems.list);
    row.append(col);
};