export function mountThemeToggle(document) {
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  const storage = () => document.defaultView.localStorage;

  function sync() {
    const dark = root.dataset.theme === 'dark';
    button.textContent = dark ? '☀️' : '🌙';
    button.setAttribute('aria-pressed', String(dark));
  }

  button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    sync();
    try {
      storage().setItem('todo-theme', root.dataset.theme);
    } catch {
      // Storage unavailable: the toggle still works for this page's lifetime.
    }
  });

  try {
    if (storage().getItem('todo-theme') === 'dark') {
      root.dataset.theme = 'dark';
    }
  } catch {
    // Storage unavailable: stay light.
  }

  sync();
}
