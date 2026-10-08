# Build a basic to-do app

- **Status:** Draft

## Problem

Users need a simple, lightweight to-do app to manage tasks in the browser. They want to add tasks, mark them complete, delete them, and see a count of how many tasks are done.

## Outcomes

- Users can add a new task via an input field and button
- Users can mark a task as done (visual indicator, separate from delete)
- Users can delete a task permanently
- The app displays a count of completed tasks
- App works in the browser without external frameworks
- All core features are covered by automated tests

## Out of scope

- Persistence (localStorage or database)
- Editing existing tasks
- Task priority or categories
- Keyboard shortcuts or advanced UX patterns
- Mobile-specific design

## Constraints

- Vanilla JavaScript only (no frameworks)
- CSS variables for theming (styles.css)
- Logic isolated in todo.js, DOM wiring in app.js
- Tests run with `npm test` (Node test runner)

## Behaviour

### Add task
- User enters text in input field and clicks "Add" button (or Enter key)
- New task appears in the list with a checkbox (unchecked) and delete button
- Input field clears after adding
- Empty input is rejected (no blank tasks)

### Mark task as done
- User clicks checkbox next to task
- Task text gets a visual indicator (strikethrough or greyed out)
- Completed task count increments
- Unchecking re-activates the task and decrements count

### Delete task
- User clicks delete button on a task
- Task is removed from the list immediately
- If task was completed, completed count decrements

### Count display
- Shows "X of Y completed" or similar format
- Updates in real-time as tasks are marked done/undone
- Resets as tasks are added or deleted

### Edge cases

| Scenario | Behaviour |
|---|---|
| Add task with only whitespace | Rejected; input clears |
| Add task, mark done, then delete | Completed count decrements; task removed |
| Mark all tasks as done | Count shows "Y of Y completed" |
| Delete all tasks | Count resets to "0 of 0" |
| Rapid add/delete clicks | No race conditions; DOM stays consistent |

## Verification

- Unit tests cover: adding tasks, marking done/undone, deleting, count updates
- Integration tests verify: input clearing, visual state changes, count accuracy
- Manual test: add 5 tasks, mark 3 done, verify count shows "3 of 5", delete 1 done task, verify count shows "2 of 4"
- `npm test` passes with 100% coverage of todo.js and app.js functionality

## Contracts

Detail lives in `./contracts/` — `provides.md` and `requires.md`.

- **Provides:** one static screen (the to-do page); no API, nothing consumes it.
- **Requires:** nothing upstream — no network calls, no environment variables, no sibling modules.
