# Requires — Show item count in the page title

What this change needs from outside itself, and how it behaves when that changes
underneath it.

## Upstream data

None. The open count is derived from the to-do app's in-memory task list (client
state, owned by that module's `mount` closure); no network call, no upstream system.

| Client call | Entity | Fields read | Type | If missing or renamed |
|---|---|---|---|---|
| — | — | — | — | — |

## Parsed at

| Source | Parsed in |
|---|---|
| — (no new input; task text still enters only through `src/todo.js` → `addTask`) | — |

## Other modules

None. The change edits the to-do app's own files (`src/todo.js`, `src/app.js`) rather
than consuming it from outside, so it depends on no other module's public boundary.

| Module | Depends on | Listed in their provides? |
|---|---|---|
| — | — | — |

## Environment

None.

| Variable | Purpose | Required |
|---|---|---|
| — | — | — |
