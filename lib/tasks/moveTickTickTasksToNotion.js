const ticktick = require('ticktick-wrapper');
const {Client} = require("@notionhq/client");

const {capitalize, createTextEntries, getNotionTaskIdFromTickTickTask, setNotionTaskIdToTickTickTask} = require('../helpers');

const {
  DATE_FIELD,
  TAGS_FIELD,
  LINK_FIELD,
  NOTION_TOKEN,
  NOTION_DATABASE_ID,
  TICKTICK_USERNAME,
  TICKTICK_PASSWORD,
} = process.env;

const moveTickTickTasksToNotion = async () => {
  await ticktick.login({
    email: {
      username: TICKTICK_USERNAME,
      password: TICKTICK_PASSWORD,
    },
  });

  const notion = new Client({
    auth: NOTION_TOKEN,
  });

  const tasks = await ticktick.tasks.getUncompleted();
  console.log(tasks);

  for (const task of tasks) {
    if (!getNotionTaskIdFromTickTickTask(task)) {
      await moveTickTickTaskToNotion(task, {notion});
    }
  }
};

const moveTickTickTaskToNotion = async (tickTickTask, {notion}) => {
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
      database_id: NOTION_DATABASE_ID,
      type: 'database_id',
    },
  });

  setNotionTaskIdToTickTickTask(tickTickTask, id);
  await tickTickTask.update();
};

module.exports = {
  moveTickTickTasksToNotion,
};

