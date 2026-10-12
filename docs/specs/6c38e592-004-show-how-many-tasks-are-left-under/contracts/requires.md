# Requires — Show how many tasks are left

What this change needs from outside itself, and how it behaves when that changes
underneath it.

## Upstream data

None. The app calls no upstream system; the count is derived from the in-memory task
list on every render.

| Client call | Entity | Fields read | Type | If missing or renamed |
|---|---|---|---|---|
| — | — | — | — | — |

## Parsed at

| Source | Parsed in |
|---|---|
| — | — |

## Other modules

| Module | Depends on | Listed in their provides? |
|---|---|---|
| `00000000-build-a-basic-to-do-app` | The `/` screen's `#todo-count` element, which is redrawn whenever the list changes. If missing or renamed — throw: `mount` fails and the DOM tests go red | yes — the `/` route row; updated in this build to describe the tasks-left count |

## Environment

None.
