# Show the number of remaining tasks in the page title

- **Status:** Draft

## Problem

The browser tab title does not reflect the current state of the to-do list, making it hard for users to see at a glance how many tasks they still need to complete when switching between tabs or windows.

## Outcomes

- The page title updates dynamically to show the count of incomplete tasks
- When tasks remain, the title reads "(N) To-do" where N is the number of incomplete tasks
- When all tasks are complete (N = 0), the title reads "To-do"
- The title updates whenever a task is added, ticked, unticked, or deleted

## Out of scope

- Changes to the HTML title element structure
- Persisting title state across page reloads
- Notifications or other browser features

## Constraints

- Use the existing `document.title` API
- The to-do app has no backend; all state is in-memory
- The build must work with the existing task model where `done` is a boolean property

## Behaviour

The `render()` function in app.js calculates the count of incomplete tasks (total tasks minus completed tasks) and updates `document.title`:

- Calculate remaining count as: `total - completed`
- If remaining > 0, set title to `"(${remaining}) To-do"`
- If remaining = 0, set title to `"To-do"`
- Perform this update every time `render()` is called, which happens when:
  - A new task is added
  - A task checkbox is toggled
  - A task is deleted

### Edge cases

| Case | Behaviour |
|------|-----------|
| First task added | Title changes from "To-do" to "(1) To-do" |
| Last task ticked as done | Title changes from "(1) To-do" to "To-do" |
| Task unticked | Title updates to show remaining count again |
| All tasks deleted | Title becomes "To-do" |
| No tasks exist | Title is "To-do" |

## Verification

- Add a task and verify the title shows "(1) To-do"
- Add another task and verify the title shows "(2) To-do"
- Tick one task and verify the title shows "(1) To-do"
- Untick it and verify the title shows "(2) To-do"
- Delete a task and verify the title updates correctly
- Tick all remaining tasks and verify the title shows "To-do"
- Delete all tasks and verify the title shows "To-do"