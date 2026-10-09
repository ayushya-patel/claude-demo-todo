# Requires — Show a friendly message when the to-do list is empty

What this change needs from outside itself, and how it behaves when that changes
underneath it.

## Upstream data

None. The empty state is derived from the in-memory task list on every render.

| Client call | Entity | Fields read | Type | If missing or renamed |
|---|---|---|---|---|
| — | — | — | — | — |

## Parsed at

| Source | Parsed in |
|---|---|
| — (no external input added) | — |

## Other modules

| Module | Depends on | Listed in their provides? |
|---|---|---|
| `claude-demo-todo/00000000-build-a-basic-to-do-app` | the `/index.html` to-do screen (its `#todo-list` list and count line) | yes |

## Environment

None.

| Variable | Purpose | Required |
|---|---|---|
| — | — | — |
