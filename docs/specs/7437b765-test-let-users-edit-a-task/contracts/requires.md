# Requires — Edit a task

What this change needs from outside itself, and how it behaves when that changes
underneath it.

## Upstream data

None. No network calls and no upstream system; the task list is client state held in
memory (see `plan.md` → Data).

| Client call | Entity | Fields read | Type | If missing or renamed |
|---|---|---|---|---|
| — | — | — | — | — |

## Parsed at

| Source | Parsed in |
|---|---|
| User-typed edited task text (the only input) | `src/todo.js` → `editTask` (trimmed; blank rejected) |

## Other modules

None. The change lives inside the to-do app itself (`src/`), not in a sibling module.

| Module | Depends on | Listed in their provides? |
|---|---|---|
| — | — | — |

## Environment

None.

| Variable | Purpose | Required |
|---|---|---|
| — | — | — |
