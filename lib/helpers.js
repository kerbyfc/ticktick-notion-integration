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
    return JSON.parse(createTextEntriesString(content)).filter(entry => !!entry.content);
  } catch (e) {
    return [{content}];
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
