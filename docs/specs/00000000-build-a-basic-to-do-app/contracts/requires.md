# Requires — Build a basic to-do app

What this module needs from outside itself, and how it behaves when that changes
underneath it.

## Upstream data

None. The app makes no network calls and reads no upstream system; the task list is
client state held in memory (see `plan.md` → Data).

| Client call | Entity | Fields read | Type | If missing or renamed |
|---|---|---|---|---|
| — | — | — | — | — |

## Parsed at

| Source | Parsed in |
|---|---|
| User-typed task text (the only input) | `src/todo.js` → `addTask` (trimmed; empty rejected) |

## Other modules

None.

| Module | Depends on | Listed in their provides? |
|---|---|---|
| — | — | — |

## Environment

None. `npm start` uses a fixed local port (8080); no variables are read.

| Variable | Purpose | Required |
|---|---|---|
| — | — | — |
