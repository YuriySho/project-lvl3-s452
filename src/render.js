const render = (state) => {
  const containerForFeeds = document.createElement('div');
  const colFeed = document.querySelector('.col-3');
  const colItem = document.querySelector('.col-9');
  state.content.feedsList.forEach((feed) => {
    const div = document.createElement('div');
    const title = document.createElement('h4');
    title.textContent = `${feed.name}`;
    const description = document.createElement('p');
    description.textContent = `${feed.description}`;
    let nameContainer;
    if (state.content.activeFeed === feed.id) {
      nameContainer = document.createElement('div');
      nameContainer.classList.add('alert', 'alert-success');
      nameContainer.append(title);
      nameContainer.append(description);
    } else {
      nameContainer = document.createElement('div');
      const a = document.createElement('a');
      a.setAttribute('href', `${feed.link}`);
      nameContainer.classList.add('alert', 'alert-primary');
      a.append(title);
      a.append(description);
      nameContainer.appendChild(a);
      nameContainer.addEventListener('click', (e) => {
        e.preventDefault();
        state.content.activeFeed = feed.id;
        render(state);
      });
    }
    div.appendChild(nameContainer);
    containerForFeeds.appendChild(div);
  });
  colFeed.innerHTML = '';
  colFeed.appendChild(containerForFeeds);
  const itemForRendering = state.content.itemsList
    .filter(({ id }) => id === state.content.activeFeed);
  colItem.innerHTML = '';
  if (itemForRendering.length > 0) {
    const ulForItems = document.createElement('ul');
    itemForRendering.forEach((el) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.setAttribute('href', el.link);
      a.textContent = el.title;
      li.append(a);
      ulForItems.appendChild(li);
    });
    colItem.appendChild(ulForItems);
  }
};

export default render;
