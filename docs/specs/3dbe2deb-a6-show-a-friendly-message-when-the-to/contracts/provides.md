# Provides — Show a friendly message when the to-do list is empty

This change adds no public surface of its own. It changes what the existing to-do
screen renders when the list is empty; that screen's public boundary stays in
[00000000-build-a-basic-to-do-app/contracts/provides.md](../../00000000-build-a-basic-to-do-app/contracts/provides.md),
which is updated alongside the code.

Anything not listed here is internal. The `todo-empty` class and the message `<li>` are
internal markup, not an interface.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (unchanged route) | none | none | The to-do screen; when the list is empty, the list shows "Nothing to do yet — add your first task above" above `0 of 0 completed` |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page (unchanged) | none — no data API |

## Input

None.

## Status and redirect behaviour

Unchanged (see the to-do app's `provides.md`).

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes this change. |
