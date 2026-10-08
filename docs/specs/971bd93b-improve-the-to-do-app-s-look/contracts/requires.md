# Requires — Improve the to-do app's look

What this change needs from outside itself, and how it behaves when that changes
underneath it.

## Upstream data

None. The app makes no network calls and loads no external resource (no web fonts,
images or CDNs); the task list stays client state in memory (see `plan.md` → Data).

| Client call | Entity | Fields read | Type | If missing or renamed |
|---|---|---|---|---|
| — | — | — | — | — |

## Parsed at

| Source | Parsed in |
|---|---|
| User-typed task text (the only input, unchanged) | `src/todo.js` → `addTask` (trimmed; empty rejected) |

## Browser capabilities

Not data, but the look depends on them, so each has a declared fallback (all
`degrade`):

| Capability | If unavailable |
|---|---|
| `backdrop-filter` | degrade: glass surfaces become near-opaque white (`@supports not`) |
| Transparency (user set `prefers-reduced-transparency: reduce`) | degrade: glass surfaces near-opaque, same layout |
| Author colours (`forced-colors: active`) | degrade: native checkboxes and system-colour borders on buttons and input; the ring switches to system colours with `forced-color-adjust: none` |

## Other modules

| Module | Depends on | Listed in their provides? |
|---|---|---|
| `00000000-build-a-basic-to-do-app` | The screen and its page structure (`#todo-form`, `#todo-input`, `#todo-list`, `#todo-count`), which this change restyles in place. If missing or renamed — throw: a renamed or removed id makes `mount` fail and the existing DOM tests go red | yes — the `/` route row; updated in this build to mention the ring and empty state |

## Environment

None.

| Variable | Purpose | Required |
|---|---|---|
| — | — | — |
