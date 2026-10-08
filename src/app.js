import { addTask, toggleTask, removeTask, editTask, countCompleted, formatCount } from './todo.js';

export function mount(document) {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const count = document.getElementById('todo-count');
  let tasks = [];
  let editingId = null;

  function renderTask(task) {
    const item = document.createElement('li');
    item.dataset.id = String(task.id);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', task.text);
    let text;
    if (task.id === editingId) {
      text = document.createElement('input');
      text.type = 'text';
      text.className = 'edit';
      text.value = task.text;
      text.setAttribute('aria-label', `Edit task: ${task.text}`);
    } else {
      text = document.createElement('span');
      text.textContent = task.text;
      text.tabIndex = 0;
      text.setAttribute('aria-describedby', 'edit-hint');
      text.classList.toggle('done', task.done);
    }

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${task.text}`);

    item.append(checkbox, text, remove);
    return item;
  }

  function render() {
    list.replaceChildren(...tasks.map(renderTask));
    count.textContent = formatCount(countCompleted(tasks));
  }

  function idOf(target) {
    return Number(target.closest('li').dataset.id);
  }

  function startEdit(id) {
    editingId = id;
    render();
    const field = list.querySelector(`li[data-id="${id}"] input.edit`);
    field.focus();
    field.select();
  }

  function finishEdit(field, save, refocus = true) {
    const item = field.closest('li');
    const id = idOf(field);
    const value = field.value;
    editingId = null;
    if (save) {
      tasks = editTask(tasks, id, value);
    }
    item.replaceWith(renderTask(tasks.find((task) => task.id === id)));
    count.textContent = formatCount(countCompleted(tasks));
    if (refocus) {
      list.querySelector(`li[data-id="${id}"] span`).focus();
    }
  }

  function isCurrentEdit(target) {
    return target.matches('input.edit') && idOf(target) === editingId;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    tasks = addTask(tasks, input.value);
    input.value = '';
    render();
  });

  list.addEventListener('change', (event) => {
    if (event.target.type !== 'checkbox') {
      return;
    }
    const id = idOf(event.target);
    tasks = toggleTask(tasks, id);
    render();
    list.querySelector(`li[data-id="${id}"] input`).focus();
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button === null) {
      return;
    }
    const id = idOf(button);
    const index = tasks.findIndex((task) => task.id === id);
    tasks = removeTask(tasks, id);
    render();
    const buttons = list.querySelectorAll('button');
    (buttons[Math.min(index, buttons.length - 1)] ?? input).focus();
  });

  list.addEventListener('dblclick', (event) => {
    if (event.target.tagName === 'SPAN') {
      startEdit(idOf(event.target));
    }
  });

  list.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.tagName === 'SPAN') {
      event.preventDefault();
      startEdit(idOf(event.target));
    }
  });

  list.addEventListener('keydown', (event) => {
    if (!isCurrentEdit(event.target)) {
      return;
    }
    if (event.key === 'Enter') {
      finishEdit(event.target, true);
    } else if (event.key === 'Escape') {
      finishEdit(event.target, false);
    }
  });

  list.addEventListener('mousedown', (event) => {
    const control = event.target.closest('button, input[type="checkbox"]');
    if (control !== null && idOf(control) === editingId) {
      editingId = null;
    }
  });

  list.addEventListener('focusout', (event) => {
    if (isCurrentEdit(event.target)) {
      const next = event.relatedTarget;
      finishEdit(event.target, true, next === null || event.target.closest('li').contains(next));
    }
  });

  render();
}
