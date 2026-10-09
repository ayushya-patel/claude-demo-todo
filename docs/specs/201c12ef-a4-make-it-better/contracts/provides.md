# Provides — Add dark mode toggle with persistent choice

This module's **public boundary**. Everything another module — in this repo or in
another team's repo — is allowed to depend on.

Anything not listed here is internal and may change without notice. In particular the
exports of `src/theme.js` and the `data-theme` attribute on `<html>` are internal; only
this module's code and tests use them.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (static, from `src/`) | none | none | The same to-do screen as `00000000-build-a-basic-to-do-app`, plus a theme toggle button in the header, labelled only by an emoji (🌙 in light mode, ☀️ in dark mode; accessible name "Dark mode") |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page with its `styles.css`, `app.js`, `todo.js`, `theme.js` | none — no data API |

## Input

None. No requests are accepted and no API is exposed.

## Persisted client state

| Store | Key | Values | Written when |
|---|---|---|---|
| Browser `localStorage` (this origin) | `theme` | `"light"` or `"dark"` | Each click on the toggle |

The key and values are fixed by the spec; changing them would silently reset every
user's saved choice.

## Status and redirect behaviour

Unchanged from `00000000-build-a-basic-to-do-app/contracts/provides.md` (dev server only).

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes this module. |
