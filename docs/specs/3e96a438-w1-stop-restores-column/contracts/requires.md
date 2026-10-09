# Requires — Add a footer showing open to-do count

What this module needs from outside itself, and how it behaves when that changes
underneath it.

## Upstream data

None. No network calls; the open count is derived from the in-memory task list.

| Client call | Entity | Fields read | Type | If missing or renamed |
|---|---|---|---|---|
| — | — | — | — | — |

## Parsed at

No new input. User-typed task text is still parsed only in `src/todo.js` → `addTask`.

## Other modules

| Module | Depends on | Listed in their provides? |
|---|---|---|
| `claude-demo-todo/00000000-build-a-basic-to-do-app` | the `/` to-do screen (the footer is added to it, and reads the screen's task list, `done` flag per task, inside the same `mount`) | yes — `/` and `/index.html` route |

If the to-do screen's task shape changes (`done` renamed), `countOpen` and its unit
tests fail at `npm test`: **throw** (fail the build), never render a wrong count.

## Environment

None.
