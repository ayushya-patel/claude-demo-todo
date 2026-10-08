# Provides — Fix completed count after deleting done tasks

This change keeps the to-do app's public boundary as it is. The boundary is described in
[`docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`](../../00000000-build-a-basic-to-do-app/contracts/provides.md)
and stays the source of truth. Nothing is restated here.

## Routes / endpoints

No change. The page at `/` and `/index.html` still shows the add form, the task list and
the `X of Y completed` count. Its wording does not change (out of scope). After every
delete, the count matches the tasks that are left.

## Output

No change.

## Input

No change. The app accepts no requests.

## Status and redirect behaviour

No change.

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes the to-do app; it is the only module in the repo. |
