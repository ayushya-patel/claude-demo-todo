# Requires — Show the number of remaining tasks in the page title

What this change needs from outside itself, and how it behaves when that changes
underneath it.

## Upstream data

None. No network calls; the remaining count is derived from the in-memory task list.

| Client call | Entity | Fields read | Type | If missing or renamed |
|---|---|---|---|---|
| — | — | — | — | — |

## Parsed at

| Source | Parsed in |
|---|---|
| — (no new input) | — |

## Other modules

This change extends the to-do app (`00000000-build-a-basic-to-do-app`) by editing its
own code (`src/app.js`, `src/todo.js`); it does not consume that module across a
boundary. It relies on the app's existing behaviour that every add, toggle and delete
ends in `render()`, and on the task model's boolean `done` flag (via `countCompleted`).

| Module | Depends on | Listed in their provides? |
|---|---|---|
| — | — | n/a — same code, changed in place; that module's `provides.md` is updated to mention the title |

## Environment

None.

| Variable | Purpose | Required |
|---|---|---|
| — | — | — |
