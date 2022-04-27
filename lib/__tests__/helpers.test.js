const {createTextEntries, createTextEntriesString} = require('../helpers');

const testString = '[url](https://link.ru?tiaernst#eirsnt) Two [url2](https://ya.ru)';
const linkAnnotation = {color: 'blue', underline: true};

test('createTextEntriesString', () => {
  expect(createTextEntriesString(testString)).toBe(`[{"content":""},{"content":"url","link":{"url":"https://link.ru?tiaernst#eirsnt"}},{"content": " Two "},{"content":"url2","link":{"url":"https://ya.ru"}},{"content": ""}]`);
});

test('createTextEntries', () => {
  expect(createTextEntries(testString)).toMatchObject([
    {text: {content:"url",link:{url:"https://link.ru?tiaernst#eirsnt"}}, annotations: linkAnnotation},
    {text: {content: " Two "}},
    {text: {content:"url2",link:{url:"https://ya.ru"}}, annotations: linkAnnotation},
  ]);
})
