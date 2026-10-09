import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mount } from '../src/app.js';

const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');

function setup() {
  const dom = new JSDOM(html);
  const { document } = dom.window;
  mount(document);
  const input = document.getElementById('todo-input');
  const form = document.getElementById('todo-form');
  const list = document.getElementById('todo-list');
  const count = document.getElementById('todo-count');

  return {
    document,
    input,
    list,
    count,
    add(text) {
      input.value = text;
      form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
    },
    items: () => [...list.querySelectorAll('li')],
    checkbox: (index) => list.querySelectorAll('li')[index].querySelector('input[type="checkbox"]'),
    deleteButton: (index) => list.querySelectorAll('li')[index].querySelector('button'),
    textOf: (index) => list.querySelectorAll('li')[index].querySelector('span'),
  };
}

test('renders an empty list and "0 of 0 completed" on mount', () => {
  const app = setup();
  assert.equal(app.items().length, 0);
  assert.equal(app.count.textContent, '0 of 0 completed');
});

test('submit adds a task with an unchecked checkbox and a Delete button, and clears the input', () => {
  const app = setup();
  app.add('Buy milk');
  assert.equal(app.items().length, 1);
  assert.equal(app.textOf(0).textContent, 'Buy milk');
  assert.equal(app.checkbox(0).checked, false);
  assert.equal(app.deleteButton(0).textContent, 'Delete');
  assert.equal(app.input.value, '');
  assert.equal(app.count.textContent, '0 of 1 completed');
});

test('adds a task via the Add button', () => {
  const app = setup();
  app.input.value = 'Buy milk';
  app.document.querySelector('#todo-form button[type="submit"]').click();
  assert.equal(app.items().length, 1);
  assert.equal(app.textOf(0).textContent, 'Buy milk');
  assert.equal(app.input.value, '');
  assert.equal(app.count.textContent, '0 of 1 completed');
});

test('submit calls preventDefault', () => {
  const app = setup();
  const event = new app.document.defaultView.Event('submit', { bubbles: true, cancelable: true });
  app.document.getElementById('todo-form').dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
});

test('a whitespace-only task is rejected and the input is cleared', () => {
  const app = setup();
  app.add('   ');
  assert.equal(app.items().length, 0);
  assert.equal(app.input.value, '');
  assert.equal(app.count.textContent, '0 of 0 completed');
});

test('an empty submit adds nothing', () => {
  const app = setup();
  app.add('');
  assert.equal(app.items().length, 0);
});

test('checking and unchecking a task toggles the done class and the count', () => {
  const app = setup();
  app.add('One');
  app.add('Two');

  app.checkbox(0).click();
  assert.equal(app.checkbox(0).checked, true);
  assert.equal(app.textOf(0).classList.contains('done'), true);
  assert.equal(app.textOf(1).classList.contains('done'), false);
  assert.equal(app.count.textContent, '1 of 2 completed');

  app.checkbox(0).click();
  assert.equal(app.checkbox(0).checked, false);
  assert.equal(app.textOf(0).classList.contains('done'), false);
  assert.equal(app.count.textContent, '0 of 2 completed');
});

test('marking every task done shows "Y of Y completed"', () => {
  const app = setup();
  app.add('One');
  app.add('Two');
  app.checkbox(0).click();
  app.checkbox(1).click();
  assert.equal(app.count.textContent, '2 of 2 completed');
});

test('deleting an open task removes it and keeps the completed count', () => {
  const app = setup();
  app.add('One');
  app.add('Two');
  app.checkbox(1).click();
  app.deleteButton(0).click();
  assert.equal(app.items().length, 1);
  assert.equal(app.textOf(0).textContent, 'Two');
  assert.equal(app.count.textContent, '1 of 1 completed');
});

test('deleting a done task decrements the completed count', () => {
  const app = setup();
  app.add('One');
  app.checkbox(0).click();
  assert.equal(app.count.textContent, '1 of 1 completed');
  app.deleteButton(0).click();
  assert.equal(app.items().length, 0);
  assert.equal(app.count.textContent, '0 of 0 completed');
});

test('deleting all tasks resets the count to "0 of 0 completed"', () => {
  const app = setup();
  app.add('One');
  app.add('Two');
  app.deleteButton(0).click();
  app.deleteButton(0).click();
  assert.equal(app.items().length, 0);
  assert.equal(app.count.textContent, '0 of 0 completed');
});

test('a click on the list that is not on a Delete button changes nothing', () => {
  const app = setup();
  app.add('One');
  app.list.click();
  app.items()[0].click();
  assert.equal(app.items().length, 1);
  assert.equal(app.count.textContent, '0 of 1 completed');
});

test('rapid adds and deletes keep the list and count consistent', () => {
  const app = setup();
  for (let i = 0; i < 20; i += 1) {
    app.add(`Task ${i}`);
  }
  for (let i = 0; i < 10; i += 1) {
    app.deleteButton(i + 1).click();
    app.checkbox(i).click();
  }
  assert.equal(app.items().length, 10);
  assert.equal(app.items().filter((li) => li.querySelector('input').checked).length, 10);
  assert.equal(app.count.textContent, '10 of 10 completed');
  assert.deepEqual(
    app.items().map((li) => li.querySelector('span').textContent),
    ['Task 0', 'Task 2', 'Task 4', 'Task 6', 'Task 8', 'Task 10', 'Task 12', 'Task 14', 'Task 16', 'Task 18'],
  );
});

test('the spec scenario: 5 added, 3 done → "3 of 5"; delete one done → "2 of 4"', () => {
  const app = setup();
  ['a', 'b', 'c', 'd', 'e'].forEach((text) => app.add(text));
  app.checkbox(0).click();
  app.checkbox(1).click();
  app.checkbox(2).click();
  assert.equal(app.count.textContent, '3 of 5 completed');
  app.deleteButton(1).click();
  assert.equal(app.count.textContent, '2 of 4 completed');
});

test('task text containing markup renders as text', () => {
  const app = setup();
  app.add('<img src=x onerror=alert(1)><b>bold</b>');
  assert.equal(app.list.querySelectorAll('img, b').length, 0);
  assert.equal(app.textOf(0).textContent, '<img src=x onerror=alert(1)><b>bold</b>');
});

test('checkbox and Delete button have accessible names from the task text', () => {
  const app = setup();
  app.add('Buy milk');
  assert.equal(app.deleteButton(0).getAttribute('aria-label'), 'Delete Buy milk');
  const label = app.checkbox(0).closest('label');
  assert.notEqual(label, null);
  assert.equal(label.textContent, 'Buy milk');
});

test('toggling a task keeps focus on that task\'s checkbox', () => {
  const app = setup();
  app.add('One');
  app.add('Two');
  app.checkbox(1).focus();
  app.checkbox(1).click();
  assert.equal(app.document.activeElement, app.checkbox(1));
});

test('deleting a task focuses the Delete button of the task that took its place', () => {
  const app = setup();
  app.add('One');
  app.add('Two');
  app.add('Three');
  app.deleteButton(1).focus();
  app.deleteButton(1).click();
  assert.equal(app.document.activeElement, app.deleteButton(1));
  assert.equal(app.textOf(1).textContent, 'Three');

  app.deleteButton(1).click();
  assert.equal(app.document.activeElement, app.deleteButton(0));
});

test('deleting the last remaining task focuses the text input', () => {
  const app = setup();
  app.add('One');
  app.deleteButton(0).focus();
  app.deleteButton(0).click();
  assert.equal(app.document.activeElement, app.input);
});

test('document.title tracks the remaining tasks through add, toggle and delete', () => {
  const app = setup();
  assert.equal(app.document.title, 'To-do - all done');

  app.add('One');
  assert.equal(app.document.title, '(1) To-do');
  app.add('Two');
  assert.equal(app.document.title, '(2) To-do');

  app.checkbox(0).click();
  assert.equal(app.document.title, '(1) To-do');
  app.checkbox(0).click();
  assert.equal(app.document.title, '(2) To-do');

  app.deleteButton(0).click();
  assert.equal(app.document.title, '(1) To-do');

  app.checkbox(0).click();
  assert.equal(app.document.title, 'To-do - all done');

  app.deleteButton(0).click();
  assert.equal(app.items().length, 0);
  assert.equal(app.document.title, 'To-do - all done');
});

test('deleting the only open task leaves the title "To-do - all done"', () => {
  const app = setup();
  app.add('Done');
  app.add('Open');
  app.checkbox(0).click();
  assert.equal(app.document.title, '(1) To-do');
  app.deleteButton(1).click();
  assert.equal(app.items().length, 1);
  assert.equal(app.document.title, 'To-do - all done');
});
