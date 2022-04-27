const ticktick = require('ticktick-wrapper');
const {Client} = require("@notionhq/client");

const {capitalize, createTextEntries} = require('./helpers');

const {
  DATE_FIELD,
  TAGS_FIELD,
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
    await moveTickTickTaskToNotion(task, {notion});
  }
};

const moveTickTickTaskToNotion = async (ticktickTask, {notion}) => {
  const properties = {
    title: {
      title: createTextEntries(ticktickTask.title),
      type: 'title',
    },
  };

  if (ticktickTask.startDate && DATE_FIELD) {
    properties[DATE_FIELD] = {
      date: {
        start: ticktickTask.startDate,
        end: ticktickTask.dueDate,
        time_zone: ticktickTask.timeZone,
      },
    };
  }

  if (ticktickTask.tags && ticktickTask.tags.length && TAGS_FIELD) {
    properties[TAGS_FIELD] = {
      multi_select: ticktickTask.tags.map(tag => ({
        name: capitalize(tag),
      })),
    };
  }

  console.log(`Create notion task`, JSON.stringify(properties, null, 2));
  await notion.pages.create({
    properties,
    parent: {
      database_id: NOTION_DATABASE_ID,
      type: 'database_id',
    },
  });

  ticktickTask.status = 1;
  await ticktickTask.update();
};

module.exports = {
  moveTickTickTasksToNotion,
};

