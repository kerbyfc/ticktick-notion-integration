const express = require('express');
const {Client} = require('@notionhq/client');
const tickTick = require('ticktick-wrapper');

const {moveTickTickTasksToNotion} = require('./lib/tasks/moveTickTickTasksToNotion');
const {createRecurringTasks} = require('./lib/tasks/createRecurringTasks');

const {
  PORT = 80,
  TICKTICK_USERNAME,
  TICKTICK_PASSWORD,
  NOTION_TOKEN,
  NOTION_DATABASE_ID,
} = process.env;

const app = express();

tickTick.login({
  email: {
    username: TICKTICK_USERNAME,
    password: TICKTICK_PASSWORD,
  },
});

const notion = new Client({
  auth: NOTION_TOKEN,
});

app
  .use(express.json())
  .get('/', async (req, res) => {
    await moveTickTickTasksToNotion(tickTick, notion, {
      notionDatabaseId: NOTION_DATABASE_ID
    });

    await createRecurringTasks(notion, {
      notionDatabaseId: NOTION_DATABASE_ID,
    });

    res.send(200);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
