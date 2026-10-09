# Provides — Show the number of remaining tasks in the page title

This change's **public boundary**. It adds no route, API or export that another module
may depend on; it changes what the existing to-do screen shows in its browser tab
title. `formatTitle` in `src/todo.js` is internal; only tests import it.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (the existing to-do screen) | none | none | Unchanged page; its document title is now `(N) To-do` while N tasks are not done, or `To-do - all done` when none remain (including an empty list). |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page; title set client-side after load | none — no data API |

## Input

None. No new requests or user input.

## Status and redirect behaviour

Unchanged from `../../00000000-build-a-basic-to-do-app/contracts/provides.md`.

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes the page title. |
