
const {capitalize, createTextEntries, getNotionTaskIdFromTickTickTask, setNotionTaskIdToTickTickTask} = require('../helpers');

const {
  DATE_FIELD,
  TAGS_FIELD,
  LINK_FIELD,
} = process.env;

const moveTickTickTasksToNotion = async (ticktick, notion, {notionDatabaseId}) => {
  const tasks = await ticktick.tasks.getUncompleted();

  console.log(tasks);

  for (const task of tasks) {
    if (!getNotionTaskIdFromTickTickTask(task)) {
      await moveTickTickTaskToNotion(task, {notion, notionDatabaseId});
    }
  }
};

const moveTickTickTaskToNotion = async (tickTickTask, {notion, notionDatabaseId}) => {
  const properties = {
    title: {
      title: createTextEntries(tickTickTask.title),
      type: 'title',
    },
  };

  const titleLink = properties.title.title.find(textEntry => textEntry.text.link);

  if (titleLink && LINK_FIELD) {
    properties[LINK_FIELD] = {
      url: titleLink.text.link.url,
    }
  }

  if (tickTickTask.startDate && DATE_FIELD) {
    properties[DATE_FIELD] = {
      date: {
        start: tickTickTask.startDate,
        end: tickTickTask.dueDate,
        time_zone: tickTickTask.timeZone,
      },
    };
  }

  if (tickTickTask.tags && tickTickTask.tags.length && TAGS_FIELD) {
    properties[TAGS_FIELD] = {
      multi_select: tickTickTask.tags.map(tag => ({
        name: capitalize(tag),
      })),
    };
  }

  console.log(`Create notion task`, JSON.stringify(properties, null, 2));
  const {id} = await notion.pages.create({
    properties,
    parent: {
      database_id: notionDatabaseId,
      type: 'database_id',
    },
  });

  setNotionTaskIdToTickTickTask(tickTickTask, id);
  await tickTickTask.update();
};

module.exports = {
  moveTickTickTasksToNotion,
};

