const add = require('../src_test/math').add;

test('adds 1 + 2 to equal 3', () => {
  expect(add(1, 2)).toBe(3);
});cd