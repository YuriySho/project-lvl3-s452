export default (xml) => {
  const domParser = new DOMParser();
  const data = domParser.parseFromString(xml, 'text/xml');
  const channel = data.querySelector('channel');
  const titleFeed = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;
  const items = channel.querySelectorAll('item');
  const posts = [];
  items.forEach((item) => {
    const pubDate = new Date(item.querySelector('pubDate').textContent);
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    posts.push({ title, link, pubDate });
  });
  return { titleFeed, description, posts };
};
