# QA r2: clear completed items button

- **Status:** Draft

## Problem

Users need a quick way to remove all completed tasks from the list at once, rather than deleting them one by one.

## Outcomes

- A "Clear completed" button appears in the UI when there are completed tasks
- Clicking the button removes all done items from the list instantly
- The completed count updates correctly after clearing
- The button disappears when there are no completed tasks

## Out of scope

- Confirmation dialog before clearing
- Undo functionality
- Keyboard shortcuts for the clear action

## Constraints

- Vanilla JavaScript only (no frameworks)
- Logic isolated in todo.js, DOM wiring in app.js
- Must work with existing task state management
- Tests run with `npm test` (Node test runner)

## Behaviour

### Clear completed button visibility
- Button is only rendered when at least one task has `done: true`
- Button is hidden when no tasks are completed (zero completed tasks)
- Button text is "Clear completed"

### Clear completed action
- User clicks the "Clear completed" button
- All tasks with `done: true` are removed from the list
- The completed count is recomputed and displayed
- Count now shows the new total (e.g., "0 of 3 completed" if 3 items remain but none are done)
- Focus moves to the input field after clearing

### Edge cases

| Scenario | Behaviour |
|---|---|
| All tasks are completed, user clears | All tasks removed; button disappears; count shows "0 of 0" |
| Mix of done and not-done tasks; user clears | Only done tasks removed; not-done tasks remain; button stays or hides based on remaining done tasks |
| No completed tasks exist | Button is not rendered; no change to DOM |
| User adds a task after clearing all | List shows only the new incomplete task; button remains hidden |

## Verification

- Unit test: `clearCompleted()` function removes all tasks with `done: true`
- Unit test: `clearCompleted()` returns original list if no tasks are done
- Integration test: button is only visible when completed tasks exist
- Integration test: clicking button removes all completed tasks and updates count
- Integration test: focus moves to input after clearing
- Manual test: add 5 tasks, mark 3 done, click "Clear completed", verify 2 remain with correct count, button disappears
- `npm test` passes with full coverage of new functionality
