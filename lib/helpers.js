const MARKDOWN_LINK = /\[([^\]]+)]\(([^)]+)\)/g;
const STANDALONE_URL_RE = /(?<!")(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

const wrapUrl = (url, text) => {
  if (!text) {
    text = url;
  }

  return [
    `"},`,
    JSON.stringify({content: text, link: {url}}),
    `,{"content": "`
  ].join('');
}

const createTextEntriesString = (text) => (
  [
    `[{"content":"`,
    (
      text.trim()
        .replace(MARKDOWN_LINK, (_, text, url) => wrapUrl(url, text))
        .replace(STANDALONE_URL_RE, (_, url) => wrapUrl(url))
    ),
    `"}]`
  ].join('')
);

const createTextEntries = (content) => {
  try {
    return JSON.parse(createTextEntriesString(content))
      .filter(entry => !!entry.content)
      .map(entry => {
        const wrapped = {
          text: entry,
        };

        if (entry.link) {
          wrapped.annotations = {
            color: 'blue',
            underline: true,
          }
        }

        return wrapped;
      });
  } catch (e) {
    console.error(e);
    return [{text: {content}}];
  }
}

const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

module.exports = {
  createTextEntriesString,
  createTextEntries,
  capitalize,
};
