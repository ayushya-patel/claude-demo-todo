let nextId = 1;

export function addTask(tasks, text) {
  const trimmed = text.trim();
  if (trimmed === '') {
    return tasks;
  }
  return [...tasks, { id: nextId++, text: trimmed, done: false }];
}

export function toggleTask(tasks, id) {
  return tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
}

export function removeTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

export function countCompleted(tasks) {
  return {
    completed: tasks.filter((task) => task.done).length,
    total: tasks.length,
  };
}

export function formatCount({ completed, total }) {
  return `${completed} of ${total} completed`;
}

export function progress({ completed, total }) {
  return total === 0 ? 0 : completed / total;
}
