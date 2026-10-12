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

export function editTask(tasks, id, text) {
  const trimmed = text.trim();
  if (trimmed === '' || !tasks.some((task) => task.id === id)) {
    return tasks;
  }
  return tasks.map((task) => (task.id === id ? { ...task, text: trimmed } : task));
}

export function countCompleted(tasks) {
  return {
    completed: tasks.filter((task) => task.done).length,
    total: tasks.length,
  };
}

export function formatRemaining({ completed, total }) {
  const remaining = total - completed;
  if (remaining === 0) {
    return '';
  }
  return remaining === 1 ? '1 task left' : `${remaining} tasks left`;
}

export function progress({ completed, total }) {
  return total === 0 ? 0 : completed / total;
}
