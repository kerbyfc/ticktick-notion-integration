const express = require('express');
const {moveTickTickTasksToNotion} = require('./lib/moveTickTickTasksToNotion');

const {
  PORT = 80
} = process.env;

const app = express();

app
  .use(express.json())
  .get('/', async (req, res) => {
      await moveTickTickTasksToNotion();
      res.send(200);
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

moveTickTickTasksToNotion();
