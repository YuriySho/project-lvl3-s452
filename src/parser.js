export default (xml) => {
    const channel = xml.querySelector('channel');
    const title = channel.querySelector('title').textContent;
    const description = channel.querySelector('description').textContent;
    const items = channel.querySelectorAll('item');
    const itemsList = [];
    items.forEach((item) => {
        const pubDate = new Date(item.querySelector('pubDate').textContent);
        const titleItem = item.querySelector('title').textContent;
        const linkItem = item.querySelector('link').textContent;
        itemsList.push({ titleItem, linkItem, pubDate });
    });
    return { title, description, itemsList };
};