# Provides — Edit a task's text

This change adds behaviour to the existing to-do screen owned by
[00000000-build-a-basic-to-do-app](../../00000000-build-a-basic-to-do-app/contracts/provides.md).
It adds no route, endpoint or API. The new `editTask` export of `src/todo.js` and the
row markup in `src/app.js` are internal to the module; only its tests import or read
them.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (unchanged) | none | none | The to-do screen, whose task text can now be edited inline |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page (unchanged) | none — no data API |

## Input

None. Edited text is typed by the user on the page and stays in memory.

## Status and redirect behaviour

Unchanged from 00000000.

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes this screen. |
