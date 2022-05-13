const {createTextEntries, createTextEntriesString, setNotionTaskIdToTickTickTask, getNotionTaskIdFromTickTickTask} = require('./helpers');

const testString = '[url](https://link.ru?tiaernst#eirsnt) Two https://ya.ru';
const linkAnnotation = {color: 'blue', underline: true};

test('createTextEntriesString', () => {
  expect(createTextEntriesString(testString)).toBe(`[{"content":""},{"content":"url","link":{"url":"https://link.ru?tiaernst#eirsnt"}},{"content": " Two "},{"content":"https://ya.ru","link":{"url":"https://ya.ru"}},{"content": ""}]`);
});

test('createTextEntries', () => {
  expect(createTextEntries(testString)).toMatchObject([
    {text: {content:"url",link:{url:"https://link.ru?tiaernst#eirsnt"}}, annotations: linkAnnotation},
    {text: {content: " Two "}},
    {text: {content:"🔗",link:{url:"https://ya.ru"}}, annotations: linkAnnotation},
  ]);
})

describe('getNotionTaskIdFromTickTickTask', () => {
  it('should return id if it exists', () => {
    expect(getNotionTaskIdFromTickTickTask({content: 'Notion task id: 1'})).toMatch('1');
  });

  it('should return null if id does not exist', () => {
    expect(getNotionTaskIdFromTickTickTask({content: 'some content'})).toBeNull();
    expect(getNotionTaskIdFromTickTickTask({content: undefined})).toBeNull();
  });
});

describe('setNotionTaskIdToTickTickTask', () => {
  it('should add task id', () => {
    expect(setNotionTaskIdToTickTickTask({content: undefined}, '1')).toMatchObject({
      content: '\n\nNotion task id: 1',
    });
  });

  it('should replace task id', () => {
    expect(setNotionTaskIdToTickTickTask({content: '\n\nNotion task id: 1'}, '2')).toMatchObject({
      content: '\n\nNotion task id: 2',
    });
  });
});
