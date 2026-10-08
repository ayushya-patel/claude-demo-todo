# Provides — Add dark mode to the to-do app

This module's **public boundary**. Everything another module (in this repo or in
another team's repo) is allowed to depend on.

This change adds no route and no API. It extends the to-do screen that
`00000000-build-a-basic-to-do-app` provides. Anything not listed here is internal
and may change without notice. In particular, the exports of `src/theme.js` are
internal: only `src/index.html` and the tests import them.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (existing, static from `src/`) | none | none | The to-do screen as before, plus a sun/moon theme toggle at the top right of the content column |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page. `<html>` carries `data-theme="light"` or `data-theme="dark"`. | none: no data API |

The `data-theme` attribute on `<html>` (`light` | `dark`) is the theme state the
spec names. CSS selects on it. Nothing outside this repo reads it.

## Input

None. The only input is a click (or Enter/Space) on the toggle button. It stays on
the page and is never sent or stored.

## Status and redirect behaviour

Unchanged from `00000000-build-a-basic-to-do-app` (dev server 404 rules). This change
adds no new status behaviour.

| Situation | Response |
|---|---|
| — | — |

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes this module. |
