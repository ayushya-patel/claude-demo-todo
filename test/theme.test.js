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
