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

One. This change extends the to-do app module in place; it does not stand alone.

| Module | Depends on | Listed in their provides? |
|---|---|---|
| `docs/specs/00000000-build-a-basic-to-do-app` | The to-do screen and its in-memory task list, which this change extends in place. On change: this module's tests fail in `npm test`. | Yes — the `/index.html` screen row |

## Environment

None.

| Variable | Purpose | Required |
|---|---|---|
| — | — | — |
