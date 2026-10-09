# Provides — Add footer with app version

This module's **public boundary**. Everything another module — in this repo or in
another team's repo — is allowed to depend on.

This change extends the existing to-do screen (owned by
`docs/specs/00000000-build-a-basic-to-do-app`); it adds no route, API or export of its
own. The `VERSION` constant and the `#app-version` id are internal.

## Routes / endpoints

| Path | Params | Query / search params | Returns or renders |
|---|---|---|---|
| `/` and `/index.html` (static, from `src/`) | none | none | The existing to-do screen, plus a footer below it reading `v<version>` (currently `v1.0.0`) |

## Output

| Route / endpoint | Returns | Type |
|---|---|---|
| `/index.html` | Static HTML page; no data API | none |

## Input

None.

## Status and redirect behaviour

Unchanged; see `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`.

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes this; the footer is display-only. |
