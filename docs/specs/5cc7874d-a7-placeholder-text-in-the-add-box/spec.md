# [VOLCANO] Add placeholder to input

- **Status:** Draft

## Problem

The add-task input field is blank when empty, offering no guidance to users on what it does.

## Outcomes

- Input shows placeholder text "What needs doing?" when empty.

## Out of scope

None.

## Constraints

- DOM lives in `src/index.html`.

## Behaviour

Add `placeholder="What needs doing?"` to the input element with id `todo-input` in `src/index.html`.

### Edge cases

| Case | Behaviour |
|------|-----------|
| Text entered | Placeholder hides, text shows |
| Text cleared | Placeholder returns |

## Verification

- Placeholder is visible when the input is empty.
- Placeholder disappears when user types.
