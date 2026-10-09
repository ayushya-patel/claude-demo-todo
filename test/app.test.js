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
    editButton: (index) => list.querySelectorAll('li')[index].querySelector('button[data-action="edit"]'),
    deleteButton: (index) => list.querySelectorAll('li')[index].querySelector('button[data-action="delete"]'),
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
  assert.equal(app.checkbox(0).getAttribute('aria-label'), 'Buy milk');
});

test('markup: a task has an Edit button with an accessible name from the task text', () => {
  const app = setup();
  app.add('Buy milk');
  assert.equal(app.editButton(0).textContent, 'Edit');
  assert.equal(app.editButton(0).getAttribute('aria-label'), 'Edit Buy milk');
});

test('markup: DOM order is checkbox, text, Edit, Delete', () => {
  const app = setup();
  app.add('Buy milk');
  assert.deepEqual(
    [...app.items()[0].children],
    [app.checkbox(0), app.textOf(0), app.editButton(0), app.deleteButton(0)],
  );
});

test('edit mode: double-clicking the text enters edit mode for that task only', () => {
  const app = setup();
  app.add('One');
  app.add('Two');
  app.textOf(1).dispatchEvent(new app.document.defaultView.MouseEvent('dblclick', { bubbles: true }));
  const editors = app.list.querySelectorAll('input.edit');
  assert.equal(editors.length, 1);
  assert.equal(app.items()[1].querySelector('input.edit'), editors[0]);
  assert.equal(editors[0].type, 'text');
  assert.equal(editors[0].value, 'Two');
  assert.equal(app.items()[1].children.length, 1);
  assert.equal(app.items()[0].querySelector('input.edit'), null);
  assert.equal(app.textOf(0).textContent, 'One');
  assert.equal(app.editButton(0).textContent, 'Edit');
});

test('edit mode: clicking Edit enters edit mode for that task only', () => {
  const app = setup();
  app.add('One');
  app.add('Two');
  app.checkbox(0).click();
  app.editButton(0).click();
  const editors = app.list.querySelectorAll('input.edit');
  assert.equal(editors.length, 1);
  assert.equal(app.items()[0].querySelector('input.edit'), editors[0]);
  assert.equal(editors[0].value, 'One');
  assert.equal(app.items()[1].querySelector('input.edit'), null);
  assert.equal(app.textOf(1).textContent, 'Two');
  assert.equal(app.count.textContent, '1 of 2 completed');
});

test('edit mode: the input is focused with its whole text selected', () => {
  const app = setup();
  app.add('Buy milk');
  app.editButton(0).click();
  const editor = app.list.querySelector('input.edit');
  assert.equal(app.document.activeElement, editor);
  assert.equal(editor.selectionStart, 0);
  assert.equal(editor.selectionEnd, 'Buy milk'.length);
});

test('edit mode: double-clicking the text does not toggle the task', () => {
  const app = setup();
  app.add('One');
  app.textOf(0).click();
  app.textOf(0).click();
  app.textOf(0).dispatchEvent(new app.document.defaultView.MouseEvent('dblclick', { bubbles: true }));
  assert.equal(app.list.querySelectorAll('input.edit').length, 1);
  assert.equal(app.count.textContent, '0 of 1 completed');
  assert.equal(app.items()[0].querySelector('input[type="checkbox"]'), null);
});

test('edit mode: a change on the edit input does not toggle the task', () => {
  const app = setup();
  app.add('One');
  app.editButton(0).click();
  const editor = app.list.querySelector('input.edit');
  editor.value = 'One edited';
  editor.dispatchEvent(new app.document.defaultView.Event('change', { bubbles: true }));
  assert.equal(app.list.querySelector('input.edit'), editor);
  assert.equal(app.count.textContent, '0 of 1 completed');
});

test('edit mode: a double-click that is not on a task text does not enter edit mode', () => {
  const app = setup();
  app.add('One');
  const dblclick = () => new app.document.defaultView.MouseEvent('dblclick', { bubbles: true });
  app.list.dispatchEvent(dblclick());
  app.items()[0].dispatchEvent(dblclick());
  app.editButton(0).dispatchEvent(dblclick());
  assert.equal(app.list.querySelectorAll('input.edit').length, 0);
});

test('edit mode: the edit input has an accessible name from the task text', () => {
  const app = setup();
  app.add('Buy milk');
  app.editButton(0).click();
  assert.equal(app.list.querySelector('input.edit').getAttribute('aria-label'), 'Edit Buy milk');
});

test('edit mode: a double-click on the edit input stays in edit mode', () => {
  const app = setup();
  app.add('One');
  app.editButton(0).click();
  const editor = app.list.querySelector('input.edit');
  editor.dispatchEvent(new app.document.defaultView.MouseEvent('dblclick', { bubbles: true }));
  assert.equal(app.list.querySelector('input.edit'), editor);
});

test('markup: clicking the task text does not toggle the task', () => {
  const app = setup();
  app.add('One');
  app.textOf(0).click();
  assert.equal(app.checkbox(0).checked, false);
  assert.equal(app.count.textContent, '0 of 1 completed');
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
