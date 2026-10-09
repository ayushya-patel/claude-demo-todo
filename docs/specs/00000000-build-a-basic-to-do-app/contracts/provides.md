# Provides — Build a basic to-do app

This module's **public boundary**. Everything another module — in this repo or in
another team's repo — is allowed to depend on.

Anything not listed here is internal and may change without notice. In particular the
exports of `src/todo.js` and `src/app.js` are internal to this module; only its tests
import them.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (static, from `src/`) | none | none | The to-do screen: add form, task list, `X of Y completed` count, a decorative progress ring (`completed/total`), and an empty-state message when there are no tasks |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page with its `styles.css`, `app.js`, `todo.js` | none — no data API |

## Input

None. The app accepts no requests and exposes no API; all input is typed by the user
on the page and stays in memory.

## Status and redirect behaviour

| Situation | Response |
|---|---|
| Unknown path, path outside `src/`, malformed request target, bad percent-encoding, or a path containing NUL (dev server `npm start` only) | 404 |

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| `971bd93b-improve-the-to-do-app-s-look` | The `/` screen and its ids (`#todo-form`, `#todo-input`, `#todo-list`, `#todo-count`) | Restyles it in place. |
