# Provides — Improve the to-do app's look

This change restyles the existing to-do screen. Its public boundary is the same one the
app already provides ([`00000000-build-a-basic-to-do-app/contracts/provides.md`](../../00000000-build-a-basic-to-do-app/contracts/provides.md));
nothing new is exposed to other modules.

Anything not listed here is internal. The exports of `src/todo.js` (including the new
`progress()`) and `src/app.js` are internal; only the tests import them.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (static, from `src/`) | none | none | The to-do screen in the Light glass style: add form, task list, progress ring (`completed/total`, decorative), empty-state message when there are no tasks, `X of Y completed` count |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page with its `styles.css`, `app.js`, `todo.js` | none — no data API |

## Input

None. The app accepts no requests and exposes no API; all input is typed by the user
on the page and stays in memory.

## Status and redirect behaviour

Unchanged from the base module (dev server `npm start` only: 404 for unknown or unsafe
paths).

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes this screen. |
