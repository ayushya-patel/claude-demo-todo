# Provides — Add a footer showing open to-do count

This module's **public boundary**. Anything not listed here is internal and may change
without notice. The new `countOpen` / `formatOpen` exports of `src/todo.js` are
internal; only tests import them.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (existing static screen) | none | none | Adds a footer at the bottom of the to-do screen reading `"{n} left"` |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page (unchanged delivery) | none — no data API |

## Input

None. No requests accepted, no API.

## Status and redirect behaviour

Unchanged from the to-do app module (`../../00000000-build-a-basic-to-do-app/contracts/provides.md`).

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes the footer. |
