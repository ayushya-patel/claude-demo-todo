# Provides — Add placeholder to input

This change adds no public boundary. It modifies the to-do screen owned by
`docs/specs/00000000-build-a-basic-to-do-app`, whose
[`contracts/provides.md`](../../00000000-build-a-basic-to-do-app/contracts/provides.md)
remains the screen's contract and is unchanged (it does not list input attributes).

## Routes / endpoints

None new. `/` and `/index.html` keep rendering the to-do screen; the add input now
shows the hint "What needs doing?" when empty.

## Output

None.

## Input

None.

## Status and redirect behaviour

Unchanged.

## Consumed by

| Module | Depends on | Why |
|---|---|---|
| — | — | Nothing consumes the placeholder text. |
