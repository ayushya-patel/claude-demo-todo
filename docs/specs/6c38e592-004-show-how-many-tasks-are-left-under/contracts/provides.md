# Provides — Show how many tasks are left

This change alters behaviour on the existing to-do screen owned by
[00000000-build-a-basic-to-do-app](../../00000000-build-a-basic-to-do-app/contracts/provides.md).
It adds no route, endpoint or API. The new `formatRemaining` export of `src/todo.js`
(replacing `formatCount`) is internal to the module; only its tests import it.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (unchanged path) | none | none | The to-do screen, whose `#todo-count` now reads `1 task left` / `N tasks left`, or is empty when no task is open (it no longer reads `X of Y completed`) |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page (markup unchanged) | none — no data API |

## Input

None. All input is typed by the user on the page and stays in memory.

## Status and redirect behaviour

Unchanged from 00000000.

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes this screen. |
