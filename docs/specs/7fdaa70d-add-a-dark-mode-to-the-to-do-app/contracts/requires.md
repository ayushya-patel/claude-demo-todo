# Requires — Add dark mode to the to-do app

What this module needs from outside itself, and how it behaves when that changes
underneath it.

## Upstream data

No network calls. The theme is client state held in the `data-theme` attribute on
`<html>`. It is also saved in the browser's `localStorage` so it survives a reload
(see `plan.md` → Data).

| Client call | Entity | Fields read | Type | If missing or renamed |
|---|---|---|---|---|
| `localStorage.getItem('todo-theme')` on mount; `setItem` on each click | Saved theme preference | the value | `"light"` \| `"dark"` (string) | degrade: missing, unknown or unreadable (storage throws) means light. A failed write is ignored, and the toggle still works for the page's lifetime. |

## Parsed at

| Source | Parsed in |
|---|---|
| The saved `todo-theme` value in `localStorage` | `src/theme.js` → `mountThemeToggle`, once on mount. Only exactly `"dark"` gives dark. Anything else is light. |
| The current `data-theme` value on `<html>` | `src/theme.js` → `mountThemeToggle`, on each click. Any value other than `dark` is treated as light, so the next click goes to dark. |

## Other modules

| Module | Depends on | Listed in their provides? |
|---|---|---|
| `claude-demo-todo/00000000-build-a-basic-to-do-app` | The to-do screen at `/index.html`, which this change extends with the toggle and the dark palette | yes (`/` and `/index.html`). Its `provides.md` is updated in this build to mention the toggle. |

The theme code does not call `src/app.js` or `src/todo.js`. It shares only the page
(`src/index.html`) and the colour variables in `src/styles.css`, both of which this
build edits.

## Environment

None. (`localStorage` is a browser API, not configuration.)

| Variable | Purpose | Required |
|---|---|---|
| — | — | — |
