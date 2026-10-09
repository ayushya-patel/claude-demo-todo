# Sort completed tasks to the bottom of the list

- **Status:** Draft

## Problem

Currently, when a task is marked as done, it stays in its original position in the list. Users need to see all open tasks together at the top, with completed tasks grouped below them for clarity.

## Outcomes

- When a task is checked off, it moves below all open tasks
- Open tasks maintain their creation order
- Completed tasks maintain their creation order among themselves
- Completed tasks are sorted to the bottom whenever the list is rendered

## Out of scope

- Persisting task state across page reloads
- Reordering tasks manually
- Filtering or hiding completed tasks

## Constraints

- Must work with the existing task data structure (`{ id, text, done }`)
- Must maintain focus management when tasks reorder
- Logic must be testable in isolation

## Behaviour

The app sorts tasks before rendering so that all `done: false` tasks appear first (in creation order), followed by all `done: true` tasks (in creation order).

**Where it happens:**
- In `todo.js`: add a new export function `sortTasks(tasks)` that returns tasks sorted with open tasks first, then completed tasks, both groups preserving creation order
- In `app.js`: call `sortTasks()` in the `render()` function after any task state changes (add, toggle, remove)

**User flow:**
1. User checks a task checkbox
2. The `toggleTask()` function updates its `done` property
3. `render()` calls `sortTasks()` before rendering the list
4. The task moves below any remaining open tasks
5. Focus stays on the checkbox that was just toggled (current behaviour preserved)

### Edge cases

| Case | Behaviour |
|------|-----------|
| All tasks completed | All tasks appear below an empty open section; empty state is not shown |
| All tasks open | All tasks appear in creation order; completed section exists but is empty |
| Multiple tasks completed in sequence | Each moves to the bottom group in the order it was completed |
| Task added while others are completed | New task appears at the end of open tasks, above completed tasks |
| Task removed | Remaining tasks stay sorted with open tasks first, completed tasks last |

## Verification

- Unit test: `sortTasks([{ id: 2, text: 'b', done: true }, { id: 1, text: 'a', done: false }])` returns open tasks first, then completed, in creation order
- Integration test: toggle a task done, confirm it moves to the bottom without losing focus
- Manual test: create 3 tasks, complete the middle one, confirm it moves below the third task

