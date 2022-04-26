const ticktick = require('ticktick-wrapper');
const {Client} = require("@notionhq/client")

const {
  DATE_FIELD,
  TAGS_FIELD,
  NOTION_TOKEN,
  NOTION_DATABASE_ID,
  TICKTICK_USERNAME,
  TICKTICK_PASSWORD,
} = process.env;

const main = async () => {
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
    await moveTicktickTaskToNotion(task, {notion});
  }
};

const moveTicktickTaskToNotion = async (ticktickTask, {notion}) => {
  const properties = {
    title: {
      title: createSimpleText(ticktickTask.title),
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

  if (ticktickTask.tags.length && TAGS_FIELD) {
    properties[TAGS_FIELD] = {
      multi_select: ticktickTask.tags.map(tag => ({
        name: capitalize(tag),
      })),
    };
  }

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

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const createSimpleText = (content) => [{
  text: {
    content,
  },
  type: 'text',
}];

main();
