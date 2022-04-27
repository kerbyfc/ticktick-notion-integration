const express = require('express');
const {moveTickTickTasksToNotion} = require('./lib/tasks/moveTickTickTasksToNotion');
const {createRecurringTasks} = require('./lib/tasks/createRecurringTasks');

const {
  PORT = 80
} = process.env;

const app = express();

app
  .use(express.json())
  .get('/', async (req, res) => {
      await moveTickTickTasksToNotion();
      await createRecurringTasks();
      res.send(200);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

moveTickTickTasksToNotion();
