# Rename Add button to Add task

**Status:** Draft

## Problem

The submit button for the to-do form currently reads "Add", which is terse. "Add task" is clearer.

## Outcomes

- The button text changes from "Add" to "Add task".

## Out of scope

- Any other changes to the form or task list.

## Constraints

- The button is a submit button (`type="submit"`) and must remain so.

## Behaviour

The form contains a text input labelled "New task" and a submit button that reads "Add task". Submitting the form (by clicking the button or pressing Enter) adds the input text as a new task.

### Edge cases

| Scenario | Outcome |
|----------|---------|
| User clicks the "Add task" button | Form submits, task is added |
| User presses Enter in the input | Form submits, task is added |
| Input is blank or whitespace only | Task is not added; input is cleared |

## Verification

- The button element in `src/index.html` contains the text "Add task".
- The app loads and the button displays correctly.
- Clicking the button or pressing Enter adds a task as before.
- The test `adds a task via the Add button` in `test/app.test.js` still passes (it tests the button's behaviour, not its text).