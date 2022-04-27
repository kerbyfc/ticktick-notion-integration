const MARKDOWN_LINK = /\[([^\]]+)]\(([^)]+)\)/g;

const createTextEntriesString = (text) => (
  [
    `[{"content":"`,
    text.trim().replace(MARKDOWN_LINK, (_, text, url) => (
      [
        `"},`,
        JSON.stringify({content: text, link: {url}}),
        `,{"content": "`
      ].join('')
    )),
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
