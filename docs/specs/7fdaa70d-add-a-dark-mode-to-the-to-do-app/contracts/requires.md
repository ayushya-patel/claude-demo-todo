# Requires — Add dark mode to the to-do app

What this module needs from outside itself, and how it behaves when that changes
underneath it.

## Upstream data

None. The toggle makes no network calls and reads no storage. The theme is client
state held in the `data-theme` attribute on `<html>` (see `plan.md` → Data).

| Client call | Entity | Fields read | Type | If missing or renamed |
|---|---|---|---|---|
| — | — | — | — | — |

## Parsed at

| Source | Parsed in |
|---|---|
| The current `data-theme` value on `<html>` (the only state read) | `src/theme.js` → `mountThemeToggle`. Any value other than `dark` is treated as light, so the next click goes to dark. |

## Other modules

| Module | Depends on | Listed in their provides? |
|---|---|---|
| `claude-demo-todo/00000000-build-a-basic-to-do-app` | The to-do screen at `/index.html`, which this change extends with the toggle and the dark palette | yes (`/` and `/index.html`). Its `provides.md` is updated in this build to mention the toggle. |

The theme code does not call `src/app.js` or `src/todo.js`. It shares only the page
(`src/index.html`) and the colour variables in `src/styles.css`, both of which this
build edits.

## Environment

None.

| Variable | Purpose | Required |
|---|---|---|
| — | — | — |
