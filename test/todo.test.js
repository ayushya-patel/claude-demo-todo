import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addTask,
  toggleTask,
  removeTask,
  countCompleted,
  formatCount,
} from '../src/todo.js';

test('addTask appends a new open task', () => {
  const tasks = addTask([], 'Buy milk');
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].text, 'Buy milk');
  assert.equal(tasks[0].done, false);
});

test('addTask trims the text', () => {
  const tasks = addTask([], '  Buy milk \t');
  assert.equal(tasks[0].text, 'Buy milk');
});

test('addTask rejects empty text', () => {
  const before = [];
  assert.equal(addTask(before, ''), before);
});

test('addTask rejects whitespace-only text', () => {
  const before = addTask([], 'Existing');
  const after = addTask(before, ' \t\n ');
  assert.equal(after, before);
  assert.equal(after.length, 1);
});

test('addTask gives each task a unique id, even after removals', () => {
  let tasks = addTask([], 'a');
  tasks = addTask(tasks, 'b');
  const removedId = tasks[1].id;
  tasks = removeTask(tasks, removedId);
  tasks = addTask(tasks, 'c');
  const ids = tasks.map((task) => task.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.notEqual(tasks[1].id, removedId);
});

test('addTask does not mutate its input', () => {
  const before = Object.freeze([]);
  const after = addTask(before, 'x');
  assert.equal(before.length, 0);
  assert.notEqual(after, before);
});

test('toggleTask flips an open task to done and back', () => {
  const [task] = addTask([], 'a');
  const done = toggleTask([task], task.id);
  assert.equal(done[0].done, true);
  const open = toggleTask(done, task.id);
  assert.equal(open[0].done, false);
});

test('toggleTask only changes the matching task and does not mutate', () => {
  const tasks = addTask(addTask([], 'a'), 'b');
  const snapshot = structuredClone(tasks);
  const result = toggleTask(tasks, tasks[0].id);
  assert.deepEqual(tasks, snapshot);
  assert.equal(result[0].done, true);
  assert.equal(result[1].done, false);
});

test('toggleTask with an unknown id leaves the list unchanged', () => {
  const tasks = addTask([], 'a');
  assert.deepEqual(toggleTask(tasks, -1), tasks);
});

test('removeTask removes an open task', () => {
  const tasks = addTask(addTask([], 'a'), 'b');
  const result = removeTask(tasks, tasks[0].id);
  assert.deepEqual(result.map((task) => task.text), ['b']);
});

test('removeTask removes a done task', () => {
  let tasks = addTask(addTask([], 'a'), 'b');
  tasks = toggleTask(tasks, tasks[1].id);
  const result = removeTask(tasks, tasks[1].id);
  assert.deepEqual(result.map((task) => task.text), ['a']);
});

test('removeTask with an unknown id leaves the list unchanged', () => {
  const tasks = addTask([], 'a');
  assert.deepEqual(removeTask(tasks, -1), tasks);
});

test('removeTask does not mutate its input', () => {
  const tasks = addTask([], 'a');
  const snapshot = structuredClone(tasks);
  removeTask(tasks, tasks[0].id);
  assert.deepEqual(tasks, snapshot);
});

test('countCompleted is 0 of 0 for an empty list', () => {
  assert.deepEqual(countCompleted([]), { completed: 0, total: 0 });
});

test('counts follow add, toggle and remove', () => {
  let tasks = [];
  for (const text of ['a', 'b', 'c', 'd', 'e']) {
    tasks = addTask(tasks, text);
  }
  assert.deepEqual(countCompleted(tasks), { completed: 0, total: 5 });

  for (const index of [0, 1, 2]) {
    tasks = toggleTask(tasks, tasks[index].id);
  }
  assert.deepEqual(countCompleted(tasks), { completed: 3, total: 5 });

  tasks = removeTask(tasks, tasks[0].id);
  assert.deepEqual(countCompleted(tasks), { completed: 2, total: 4 });

  tasks = removeTask(tasks, tasks[3].id);
  assert.deepEqual(countCompleted(tasks), { completed: 2, total: 3 });
});

test('formatCount formats 0 of 0, 3 of 5 and Y of Y', () => {
  assert.equal(formatCount({ completed: 0, total: 0 }), '0 of 0 completed');
  assert.equal(formatCount({ completed: 3, total: 5 }), '3 of 5 completed');
  assert.equal(formatCount({ completed: 4, total: 4 }), '4 of 4 completed');
});
