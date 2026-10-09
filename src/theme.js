export function mountThemeToggle(document) {
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');

  function sync() {
    const dark = root.dataset.theme === 'dark';
    button.textContent = dark ? '☀️' : '🌙';
    button.setAttribute('aria-pressed', String(dark));
  }

  button.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    sync();
  });

  sync();
}
