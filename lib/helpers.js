const {forEach} = require('lodash');
const {env, NOTION_TASK_ID_PATTERN, NOTION_TASK_ID_PREFIX, MARKDOWN_LINK, STANDALONE_URL_RE} = require('./constants');


const helper = fn =>
  env.JEST_WORKER_ID
    ? jest.fn(fn)
    : fn;

const wrapUrl = helper((url, text) => {
  if (!text) {
    text = url;
  }

  return [
    `"},`,
    JSON.stringify({content: text, link: {url}}),
    `,{"content": "`
  ].join('');
});

const getNotionTaskIdFromTickTickTask = helper((tickTickTask) => {
  const match = (tickTickTask.content || '').match(NOTION_TASK_ID_PATTERN);

  if (match) {
    return match[1];
  }

  return match;
});

const setNotionTaskIdToTickTickTask = helper((tickTickTask, id) => {
  const idString = `${NOTION_TASK_ID_PREFIX}${id}`;

  tickTickTask.content = !getNotionTaskIdFromTickTickTask(tickTickTask)
    ? `${tickTickTask.content || ''}\n\n${idString}`
    : tickTickTask.content.replace(NOTION_TASK_ID_PATTERN, idString);

  return tickTickTask;
});

const createTextEntriesString = helper((text) => (
  [
    `[{"content":"`,
    (
      text.trim()
        .replace(MARKDOWN_LINK, (_, text, url) => wrapUrl(url, text))
        .replace(STANDALONE_URL_RE, (_, url) => wrapUrl(url))
    ),
    `"}]`
  ].join('')
));

const createTextEntries = helper((content) => {
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

          if (entry.link.url === entry.content) {
            entry.content = '🔗';
          }
        }

        return wrapped;
      });
  } catch (e) {
    console.error(e);
    return createSimpleRichText(content);
  }
});

const createSimpleRichText = helper((content) => [{text: {content: String(content)}}]);

const flattenTextEntries = helper((textObjects) =>
  textObjects.map(textEntry => textEntry.text.content).join('')
);

const getTaskTitle = helper((task) =>
  Object.values(task.properties).find(entry => entry.type === "title").title
);

const getNotionTaskLink = helper((task) =>
  task.properties[env.LINK_FIELD]
    ? task.properties[env.LINK_FIELD].url
    : '',
);

const getFlattenNotionTaskTitle = helper((task) => flattenTextEntries(getTaskTitle(task)));

const getNumberField = helper((task, field, defaultValue = 0) =>
  task.properties[field]
    ? Number(task.properties[field].number)
    : defaultValue
);


const createValuesSetter = helper((property) => (task, field, value) => {
  task[field] = {
    [property]: value,
  };
});

const setNumberField = helper(createValuesSetter('number'));
const setDateField = helper(createValuesSetter('date'));

const setNotionTaskCompleteCount = helper((task, value) => setNumberField(task, env.COMPLETE_COUNT_FIELD, value));

const setNotionTaskDate = helper((task, {start, end}) => setDateField(task, env.DATE_FIELD, {
  start: start ? start.toISOString() : '',
  end: end ? end.toISOString() : '',
}));

const setNotionTaskCompleteDate = helper((task, start))

const getDateField = helper((task, field, defaultValue = null) =>
  task.properties[field] && task.properties[field].date
    ? {
      start: task.properties[field].date.start ? new Date(task.properties[field].date.start) : null,
      end: task.properties[field].date.end ? new Date(task.properties[field].date.end) : null,
    }
    : defaultValue
);

const getNotionTaskRecurring = helper((task) => getNumberField(task, env.RECURRING_FIELD));
const getNotionTaskCompleteCount = helper((task) => getNumberField(task, env.COMPLETE_COUNT_FIELD));
const getNotionTaskDate = helper((task) => getDateField(task, env.DATE_FIELD));

const capitalize = helper((text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
});

const invariant = helper((condition, error) => {
  if (!condition) {
    throw error;
  }
});

const removeFormulaProperties = helper((props) => Object.keys(props).reduce((acc, key) => {
  if (props[key].type !== "formula") {
    acc[key] = props.key;
  }

  return acc;
}, {}));

const formNotionTaskPropsFromTickTickTask = helper((tickTickTask) => {
  const properties = {
    title: {
      title: createTextEntries(capitalize(tickTickTask.title)),
      type: 'title',
    },
  };

  const titleLink = properties.title.title.find(textEntry => textEntry.text.link);

  if (titleLink && env.LINK_FIELD) {
    properties[env.LINK_FIELD] = {
      url: titleLink.text.link.url,
    }
  }

  if (tickTickTask.startDate && env.DATE_FIELD) {
    properties[env.DATE_FIELD] = {
      date: {
        start: tickTickTask.startDate,
        end: tickTickTask.dueDate,
        time_zone: tickTickTask.timeZone,
      },
    };
  }

  if (tickTickTask.tags && tickTickTask.tags.length && env.TAGS_FIELD) {
    properties[env.TAGS_FIELD] = {
      multi_select: tickTickTask.tags.map(tag => ({
        name: capitalize(tag),
      })),
    };
  }

  return {
    properties,
  };
});

module.exports = {
  invariant,
  createSimpleRichText,
  createTextEntriesString,
  createTextEntries,
  removeFormulaProperties,
  capitalize,
  getTaskTitle,
  getNotionTaskIdFromTickTickTask,
  setNotionTaskIdToTickTickTask,
  formNotionTaskPropsFromTickTickTask,
  flattenTextEntries,
  getFlattenNotionTaskTitle,
  getNotionTaskLink,
  getNotionTaskRecurring,
  getNotionTaskCompleteCount,
  getNotionTaskDate,
  setNotionTaskDate,
  setNotionTaskCompleteCount,
  setNotionTaskCompleteDate,
}

if (env.JEST_WORKER_ID) {
  forEach(module.exports, helper => invariant(jest.isMockFunction(helper), `Helper ${helper} has not mock`));
}
