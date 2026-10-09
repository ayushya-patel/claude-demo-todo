# Add a 'Clear all' link under the list

- **Status:** Draft

## Problem

Users have no quick way to clear the entire to-do list at once. They currently must delete tasks one by one, which is tedious when the list is long.

## Outcomes

- Users can clear all tasks with a single "Clear all" link
- A confirmation dialog prevents accidental deletion
- The confirmation shows the number of tasks being deleted
- Completed task count resets to 0 after clearing
- Focus management follows existing patterns

## Out of scope

- Undo or recovery after clearing
- Selective clearing (e.g., completed tasks only)
- Animation or transition effects

## Constraints

- Vanilla JavaScript only (no frameworks)
- Must follow existing code structure: logic in todo.js, DOM wiring in app.js
- Confirmation uses browser's `confirm()` dialog
- Behaviour consistent with existing delete operations

## Behaviour

### Clear all link
- A "Clear all" link appears below the task list
- Link is always visible, even when the list is empty
- Clicking it triggers a confirmation dialog

### Confirmation dialog
- Dialog shows: "Delete all N tasks?" where N is the current total task count (not just completed tasks)
- If user confirms, all tasks are removed and the list clears
- If user cancels, nothing happens
- After clearing, the count resets to "0 of 0 completed"

### Focus management
- After clearing completes, focus moves to the "New task" input field

### Edge cases

| Scenario | Behaviour |
|---|---|
| Click "Clear all" with empty list | Dialog shows "Delete all 0 tasks?"; no change if confirmed |
| Click "Clear all", then cancel | List remains unchanged |
| Click "Clear all" with mix of done and undone tasks | All tasks removed, regardless of done state |
| Rapid clicks on "Clear all" | Only one confirmation dialog appears at a time |

## Verification

- Unit test: `clearAll` function removes all tasks and returns empty list
- Integration test: clicking "Clear all" with 5 tasks (3 done, 2 undone) shows "Delete all 5 tasks?", clears all on confirm, resets count to "0 of 0"
- Integration test: clicking "Clear all" then canceling leaves list unchanged
- Manual test: add 5 tasks, mark 3 as done, click "Clear all", confirm, verify empty list and count shows "0 of 0"
- `npm test` passes; new tests have 100% coverage of clear all logic

## Contracts

- **Provides:** enhanced to-do page with clear all functionality; no API changes
- **Requires:** no upstream changes

## How it works

A "Clear all" link is added below the task list in the HTML. When clicked, it prompts the user with a confirmation dialog showing the current task count. If confirmed, all tasks are removed from the in-memory list, the page re-renders with an empty list and a reset count, and focus moves to the input field. If cancelled, nothing changes.

The implementation adds a `clearAll` function to todo.js that returns an empty tasks array, and wires the link click event in app.js following the existing event delegation pattern used for delete buttons.