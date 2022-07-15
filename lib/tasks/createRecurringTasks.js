const {cloneDeep} = require('lodash');

const {invariant, removeFormulaProperties, getFlattenNotionTaskTitle, getNotionTaskRecurring, getNotionTaskDate,
  setNotionTaskCompleteCount, getNotionTaskCompleteCount, setNotionTaskDate
} = require('../helpers');

const {
  DATE_FIELD,
  TITLE_FIELD,
  DRY,
  COMPLETE_COUNT_FIELD,
  RECURRING_FIELD,
  COMPLETE_DATE_FIELD,
  NOTION_DATABASE_ID,
} = process.env;

const createRecurringTasks = async (notion, {notionDatabaseId}) => {
  invariant(COMPLETE_DATE_FIELD, 'Missed COMPLETE_DATE_FIELD env variable');
  invariant(DATE_FIELD, 'Missed DATE_FIELD env variable');
  invariant(RECURRING_FIELD, 'Missed RECURRING_FIELD env variable');
  invariant(TITLE_FIELD, 'Missed TITLE_FIELD env variable');

  const tasks = await notion.databases.query({
    database_id: notionDatabaseId,
    filter: {
      and: [
        {
          property: COMPLETE_DATE_FIELD,
          date: {
            is_empty: true,
          }
        },
        {
          property: RECURRING_FIELD,
          number: {
            is_not_empty: true,
          }
        }
      ]
    },
  })

  for (const task of tasks.results) {
    await createRecurringTask(task, {notion});
  }
};

const createRecurringTask = async (task, {notion}) => {
  try {
    const title = getFlattenNotionTaskTitle(task);
    const recurring = getNotionTaskRecurring(task);
    const {start, end} = getNotionTaskDate(task);

    const newTask = {
      properties: cloneDeep(task.properties),
    }

    setNotionTaskCompleteCount(newTask, getNotionTaskCompleteCount(task) + 1);

    if (start) {
      start.setDate(start.getDate() + recurring);

      if (end) {
        end.setDate(end.getDate() + recurring);
      }

      setNotionTaskDate(newTask, {start, end});
    }

    const updateTaskProperties = {
      [COMPLETE_DATE_FIELD]: {
        date: {
          start: new Date().toISOString(),
        }
      }
    };

    console.log(`Update task "${title}" properties`, JSON.stringify(updateTaskProperties, null, 2));
    if (!DRY) {
      await notion.pages.update({
        page_id: task.id,
        properties: updateTaskProperties,
      });
    }

    console.log(`Create recurring task for "${title}" with change props`, JSON.stringify(changedProperties, null, 2));
    if (!DRY) {
      return await notion.pages.create({
        properties: removeFormulaProperties({
          ...properties,
          ...changedProperties,
        }),
        parent: {
          database_id: NOTION_DATABASE_ID,
          type: 'database_id',
        },
      });
    }
  } catch (e) {
    console.log(JSON.stringify(task, null, 2));
    throw e;
  }
}

module.exports = {
  createRecurringTasks,
};

