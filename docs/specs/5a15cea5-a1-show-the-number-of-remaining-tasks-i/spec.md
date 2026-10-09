# Show the number of remaining tasks in the page title

- **Status:** Draft

## Problem

The browser tab title does not reflect the current state of the to-do list, making it hard for users to see at a glance how many tasks they still need to complete when switching between tabs or windows.

## Outcomes

- The page title updates dynamically to show the count of incomplete tasks
- When tasks remain, the title reads "(N) To-do" where N is the number of incomplete tasks
- When all tasks are complete (N = 0), the title reads "To-do - all done"
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
- If remaining = 0, set title to `"To-do - all done"`
- Perform this update every time `render()` is called, which happens when:
  - A new task is added
  - A task checkbox is toggled
  - A task is deleted

### Edge cases

| Case | Behaviour |
|------|-----------|
| First task added | Title changes from "To-do - all done" to "(1) To-do" |
| Last task ticked as done | Title changes from "(1) To-do" to "To-do - all done" |
| Task unticked | Title updates to show remaining count again |
| All tasks deleted | Title becomes "To-do - all done" |
| No tasks exist | Title is "To-do - all done" |

## Verification

- Add a task and verify the title shows "(1) To-do"
- Add another task and verify the title shows "(2) To-do"
- Tick one task and verify the title shows "(1) To-do"
- Untick it and verify the title shows "(2) To-do"
- Delete a task and verify the title updates correctly
- Tick all remaining tasks and verify the title shows "To-do - all done"
- Delete all tasks and verify the title shows "To-do - all done"

## Contracts

Detail lives in `./contracts/` — `provides.md` and `requires.md`.

- **Provides:** no new route or API; the existing to-do screen's tab title shows the remaining count.
- **Requires:** nothing upstream; extends the to-do app's own code in place.

## How it works

**Where the title comes from.** The page title is not stored anywhere. Every time the page redraws the list (once on load, then after each add, tick, untick or delete), it works out how many tasks are not done from the task list and sets the browser tab title from that, in the same step that rewrites the `X of Y completed` line. The title therefore cannot drift from the list.

**The two forms.** When at least one task is not done, the title is `(N) To-do`, where N is the number of tasks not done, for example `(2) To-do`. When none are left, including when the list is empty, it is `To-do - all done` (an ordinary hyphen). Task text never goes into the title.

**First load.** `index.html` still carries the fixed `<title>To-do</title>`. The first draw on load replaces it, so a fresh page immediately shows `To-do - all done` and the fixed title is only seen if the script does not run.

**Divergences.** None from `plan.md`: approach A shipped as planned (a small formatting function in `src/todo.js`, called from the redraw in `src/app.js`).
