# Provides — Build a basic to-do app

This module's **public boundary**. Everything another module — in this repo or in
another team's repo — is allowed to depend on.

Anything not listed here is internal and may change without notice. In particular the
exports of `src/todo.js` and `src/app.js` are internal to this module; only its tests
import them.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (static, from `src/`) | none | none | The to-do screen: add form, task list, `X of Y completed` count, plus a sun/moon theme toggle (added by `7fdaa70d-add-a-dark-mode-to-the-to-do-app`) |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page with its `styles.css`, `app.js`, `todo.js`, `theme.js` | none — no data API |

## Input

The app accepts no requests and exposes no API. Tasks are typed by the user on the page
and stay in memory. The only other input is a click on the theme toggle; the chosen theme
is saved in the browser's own `localStorage` (key `todo-theme`) and never sent anywhere.

## Status and redirect behaviour

| Situation | Response |
|---|---|
| Unknown path, path outside `src/`, malformed request target, bad percent-encoding, or a path containing NUL (dev server `npm start` only) | 404 |

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes this module; it is the only module in the repo. |
