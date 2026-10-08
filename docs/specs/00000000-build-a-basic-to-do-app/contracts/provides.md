# Provides — Build a basic to-do app

This module's **public boundary**. Everything another module — in this repo or in
another team's repo — is allowed to depend on.

Anything not listed here is internal and may change without notice. In particular the
exports of `src/todo.js` and `src/app.js` are internal to this module; only its tests
import them.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (static, from `src/`) | none | none | The to-do screen: add form, task list, `X of Y completed` count |

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
| Unknown path or path outside `src/` (dev server `npm start` only) | 404 |

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes this module; it is the only module in the repo. |
