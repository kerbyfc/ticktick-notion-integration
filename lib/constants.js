const {
  DATE_FIELD,
  TAGS_FIELD,
  LINK_FIELD,
  RECURRING_FIELD,
  JEST_WORKER_ID,
  COMPLETE_COUNT_FIELD,
} = process.env;

const MARKDOWN_LINK = /\[([^\]]+)]\(([^)]+)\)/g;
const STANDALONE_URL_RE = /(?<!")(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
const NOTION_TASK_ID_PREFIX = 'Notion task id: ';
const NOTION_TASK_ID_PATTERN = new RegExp(`${NOTION_TASK_ID_PREFIX}([^\s]+)`);

module.exports = {
  env: {
    DATE_FIELD,
    TAGS_FIELD,
    LINK_FIELD,
    RECURRING_FIELD,
    JEST_WORKER_ID,
    COMPLETE_COUNT_FIELD,
  },
  NOTION_TASK_ID_PREFIX,
  NOTION_TASK_ID_PATTERN,
  MARKDOWN_LINK,
  STANDALONE_URL_RE,
};
