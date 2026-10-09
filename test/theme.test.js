import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mount } from '../src/app.js';
import { mountThemeToggle } from '../src/theme.js';

const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');

function setup() {
  const dom = new JSDOM(html);
  const { document } = dom.window;
  mount(document);
  mountThemeToggle(document);
  const button = document.getElementById('theme-toggle');

  return {
    dom,
    document,
    button,
    theme: () => document.documentElement.dataset.theme,
  };
}

function assertLight(app) {
  assert.equal(app.theme(), 'light');
  assert.equal(app.button.textContent, '🌙');
  assert.equal(app.button.getAttribute('aria-pressed'), 'false');
}

function assertDark(app) {
  assert.equal(app.theme(), 'dark');
  assert.equal(app.button.textContent, '☀️');
  assert.equal(app.button.getAttribute('aria-pressed'), 'true');
}

test('starts in light mode with the moon icon and aria-pressed="false"', () => {
  assertLight(setup());
});

test('the toggle is a button named "Dark mode"', () => {
  const app = setup();
  assert.equal(app.button.tagName, 'BUTTON');
  assert.equal(app.button.getAttribute('type'), 'button');
  assert.equal(app.button.getAttribute('aria-label'), 'Dark mode');
});

test('syncs the icon and aria-pressed from the attribute on mount', () => {
  const dom = new JSDOM(html);
  const { document } = dom.window;
  document.documentElement.dataset.theme = 'dark';
  mountThemeToggle(document);
  const button = document.getElementById('theme-toggle');
  assert.equal(button.textContent, '☀️');
  assert.equal(button.getAttribute('aria-pressed'), 'true');
});

test('one click switches to dark with the sun icon and aria-pressed="true"', () => {
  const app = setup();
  app.button.click();
  assertDark(app);
});

test('a second click returns to light', () => {
  const app = setup();
  app.button.click();
  app.button.click();
  assertLight(app);
});

test('several rapid clicks alternate on each click', () => {
  const app = setup();
  for (let i = 1; i <= 5; i += 1) {
    app.button.click();
    if (i % 2 === 1) {
      assertDark(app);
    } else {
      assertLight(app);
    }
  }
});

test('adding and completing a task still works in dark mode', () => {
  const app = setup();
  app.button.click();
  const input = app.document.getElementById('todo-input');
  const form = app.document.getElementById('todo-form');
  input.value = 'Buy milk';
  form.dispatchEvent(new app.dom.window.Event('submit', { bubbles: true, cancelable: true }));
  app.document.querySelector('#todo-list input[type="checkbox"]').click();
  assert.ok(app.document.querySelector('#todo-list span').classList.contains('done'));
  assert.equal(app.document.getElementById('todo-count').textContent, '1 of 1 completed');
  assertDark(app);
});

test('the toggle has no tabindex, so the keyboard reaches it', () => {
  const app = setup();
  assert.equal(app.button.hasAttribute('tabindex'), false);
});

function setupAt(url, seed) {
  const dom = new JSDOM(html, { url });
  if (seed !== undefined) {
    dom.window.localStorage.setItem('todo-theme', seed);
  }
  const { document } = dom.window;
  mountThemeToggle(document);
  return {
    dom,
    document,
    button: document.getElementById('theme-toggle'),
    theme: () => document.documentElement.dataset.theme,
    saved: () => dom.window.localStorage.getItem('todo-theme'),
  };
}

test('todo-theme: a click stores "dark", then "light"', () => {
  const app = setupAt('http://localhost/');
  assert.equal(app.saved(), null);
  app.button.click();
  assert.equal(app.saved(), 'dark');
  app.button.click();
  assert.equal(app.saved(), 'light');
});

test('todo-theme: a saved "dark" starts dark with the sun icon and aria-pressed="true"', () => {
  assertDark(setupAt('http://localhost/', 'dark'));
});

test('todo-theme: a saved "light" starts light', () => {
  assertLight(setupAt('http://localhost/', 'light'));
});

test('todo-theme: a missing value starts light', () => {
  assertLight(setupAt('http://localhost/'));
});

test('todo-theme: an unknown value "blue" starts light', () => {
  assertLight(setupAt('http://localhost/', 'blue'));
});

test('todo-theme: unavailable storage (about:blank) starts light and still toggles', () => {
  const dom = new JSDOM(html);
  assert.throws(() => dom.window.localStorage);
  const { document } = dom.window;
  mountThemeToggle(document);
  const app = { button: document.getElementById('theme-toggle'), theme: () => document.documentElement.dataset.theme };
  assertLight(app);
  app.button.click();
  assertDark(app);
  app.button.click();
  assertLight(app);
});

test('todo-theme: a throwing setItem does not stop the toggle', () => {
  const app = setupAt('http://localhost/');
  app.dom.window.Storage.prototype.setItem = () => {
    throw new Error('quota');
  };
  app.button.click();
  assertDark(app);
  app.button.click();
  assertLight(app);
});

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

function parseRules(text) {
  const rules = [];
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    rules.push({ selector: match[1].trim(), body: match[2] });
  }
  return rules;
}

function declarations(body) {
  const result = {};
  for (const part of body.split(';')) {
    const index = part.indexOf(':');
    if (index > 0) {
      result[part.slice(0, index).trim()] = part.slice(index + 1).trim();
    }
  }
  return result;
}

function block(selector) {
  const rule = parseRules(css).find((r) => r.selector === selector);
  assert.ok(rule, `styles.css has a ${selector} block`);
  return declarations(rule.body);
}

test('styles.css: the dark block defines the charcoal palette', () => {
  const dark = block('html[data-theme="dark"]');
  assert.equal(dark['--color-bg'], '#1a1a1a');
  assert.equal(dark['--color-text'], '#f0f0f0');
  assert.equal(dark['--color-muted'], '#a0a0a0');
  assert.equal(dark['--color-border'], '#404040');
  assert.equal(dark['--color-accent'], '#0b5fff');
  assert.equal(dark['--color-focus'], '#0b5fff');
  assert.equal(dark['--color-on-accent'], '#ffffff');
  assert.equal(dark['color-scheme'], 'dark');
});

test('styles.css: :root keeps the light palette, on-accent and color-scheme light', () => {
  const root = block(':root');
  assert.equal(root['--color-on-accent'], '#ffffff');
  assert.equal(root['color-scheme'], 'light');
  for (const name of ['--color-bg', '--color-text', '--color-muted', '--color-border', '--color-accent', '--color-focus']) {
    assert.ok(root[name], `:root defines ${name}`);
  }
});

test('styles.css: the dark block redefines every colour variable that :root defines', () => {
  const root = Object.keys(block(':root')).filter((name) => name.startsWith('--color-'));
  const dark = block('html[data-theme="dark"]');
  for (const name of root) {
    assert.ok(name in dark, `dark block defines ${name}`);
  }
});

test('styles.css: no hex colour or white appears outside the variable blocks', () => {
  const variableBlocks = [':root', 'html[data-theme="dark"]'];
  const colour = /#[0-9a-fA-F]{3,8}\b|(?<![\w-])white(?![\w-])/;
  for (const rule of parseRules(css)) {
    if (variableBlocks.includes(rule.selector)) {
      continue;
    }
    assert.doesNotMatch(rule.body, colour, `${rule.selector} uses only var(--…) colours`);
  }
});
