import { addTask, toggleTask, removeTask, countCompleted, formatCount, progress } from './todo.js';

export function mount(document) {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const count = document.getElementById('todo-count');
  const ring = document.getElementById('todo-ring');
  const ringLabel = document.getElementById('todo-ring-label');
  const empty = document.getElementById('todo-empty');
  let tasks = [];

  function renderTask(task) {
    const item = document.createElement('li');
    item.dataset.id = String(task.id);

    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    const text = document.createElement('span');
    text.textContent = task.text;
    text.classList.toggle('done', task.done);
    label.append(checkbox, text);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'del';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${task.text}`);

    item.append(label, remove);
    return item;
  }

  function render() {
    list.replaceChildren(...tasks.map(renderTask));
    const counts = countCompleted(tasks);
    count.textContent = formatCount(counts);
    ringLabel.textContent = `${counts.completed}/${counts.total}`;
    ring.style.setProperty('--progress', String(progress(counts)));
    empty.hidden = tasks.length > 0;
  }

  function idOf(target) {
    return Number(target.closest('li').dataset.id);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    tasks = addTask(tasks, input.value);
    input.value = '';
    render();
  });

  list.addEventListener('change', (event) => {
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

  render();
}
