# Provides — Show item count in the page title

This change extends the shipped to-do app (`docs/specs/00000000-build-a-basic-to-do-app`)
in place. Its public boundary is that module's; the module's own
`contracts/provides.md` is updated alongside the code. This file records what the
change adds to it.

The exports of `src/todo.js` (including the new `countOpen`) and `src/app.js` stay
internal to the module; only its tests import them.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (static, from `src/`) | none | none | Unchanged screen; its document title reads `To-do (N)`, N = number of incomplete tasks, kept current after every add, toggle and delete |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page (unchanged) | none — no data API |

## Input

None. No new input; the title is derived from the in-memory task list.

## Status and redirect behaviour

Unchanged from the to-do app's `provides.md`.

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes the page title; the to-do app is the only module in the repo. |
