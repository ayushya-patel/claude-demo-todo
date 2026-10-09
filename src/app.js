import { addTask, toggleTask, editTask, removeTask, countCompleted, formatCount } from './todo.js';

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

    if (task.id === editingId) {
      const editor = document.createElement('input');
      editor.type = 'text';
      editor.className = 'edit';
      editor.value = task.text;
      editor.setAttribute('aria-label', `Edit ${task.text}`);
      item.append(editor);
      return item;
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', task.text);
    const text = document.createElement('span');
    text.textContent = task.text;
    text.classList.toggle('done', task.done);

    const edit = document.createElement('button');
    edit.type = 'button';
    edit.dataset.action = 'edit';
    edit.textContent = 'Edit';
    edit.setAttribute('aria-label', `Edit ${task.text}`);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.dataset.action = 'delete';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${task.text}`);

    item.append(checkbox, text, edit, remove);
    return item;
  }

  function render() {
    list.replaceChildren(...tasks.map(renderTask));
    count.textContent = formatCount(countCompleted(tasks));
    const editor = list.querySelector('input.edit');
    editor?.focus();
    editor?.select();
  }

  function idOf(target) {
    return Number(target.closest('li').dataset.id);
  }

  function leaveEdit(id) {
    editingId = null;
    render();
    list.querySelector(`li[data-id="${id}"] button[data-action="edit"]`).focus();
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

  list.addEventListener('dblclick', (event) => {
    if (!event.target.matches('li > span')) {
      return;
    }
    editingId = idOf(event.target);
    render();
  });

  list.addEventListener('keydown', (event) => {
    if (!event.target.matches('input.edit')) {
      return;
    }
    const id = idOf(event.target);
    if (event.key === 'Enter') {
      const next = editTask(tasks, id, event.target.value);
      if (next === tasks) {
        event.target.select();
        return;
      }
      tasks = next;
      leaveEdit(id);
    } else if (event.key === 'Escape') {
      leaveEdit(id);
    }
  });

  list.addEventListener('focusout', (event) => {
    if (!event.target.matches('input.edit') || idOf(event.target) !== editingId) {
      return;
    }
    const id = editingId;
    editingId = null;
    const restored = renderTask(tasks.find((task) => task.id === id));
    event.target.closest('li').replaceWith(restored);
    if (event.relatedTarget === null) {
      restored.querySelector('button[data-action="edit"]').focus();
    }
  });

  list.addEventListener('click', (event) => {
    const editButton = event.target.closest('button[data-action="edit"]');
    if (editButton !== null) {
      editingId = idOf(editButton);
      render();
      return;
    }
    const button = event.target.closest('button[data-action="delete"]');
    if (button === null) {
      return;
    }
    const id = idOf(button);
    const index = tasks.findIndex((task) => task.id === id);
    tasks = removeTask(tasks, id);
    render();
    const buttons = list.querySelectorAll('button[data-action="delete"]');
    (buttons[Math.min(index, buttons.length - 1)] ?? input).focus();
  });

  render();
}
