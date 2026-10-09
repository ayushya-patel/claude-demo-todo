# Provides — Edit a task

This change's **public boundary**. It extends the to-do screen of
`docs/specs/00000000-build-a-basic-to-do-app/` and adds no new surface.

Anything not listed here is internal and may change without notice. In particular
`editTask` in `src/todo.js` and the edit-mode handling in `src/app.js` are internal;
only this repo's tests import them.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (unchanged) | none | none | The to-do screen; each task now also has an Edit button and can be edited in place |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page (unchanged) | none — no data API |

## Input

None. All input is typed by the user on the page and stays in memory.

## Status and redirect behaviour

Unchanged (see `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`).

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes this module. |
