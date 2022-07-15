const {
  getNotionTaskIdFromTickTickTask,
  setNotionTaskIdToTickTickTask,
  formNotionTaskPropsFromTickTickTask,
} = require('../helpers');

const moveTickTickTasksToNotion = async (tickTick, notion, {notionDatabaseId}) => {
  const tasks = await tickTick.tasks.getUncompleted();

  console.log(tasks);

  for (const task of tasks) {
    if (!getNotionTaskIdFromTickTickTask(task)) {
      await moveTickTickTaskToNotion(task, {notion, notionDatabaseId});
    }
  }
};

const moveTickTickTaskToNotion = async (tickTickTask, {notion, notionDatabaseId}) => {
  const task = formNotionTaskPropsFromTickTickTask(tickTickTask);

  console.log(`Create notion task`, JSON.stringify(task, null, 2));
  const {id} = await notion.pages.create({
    ...task,
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

