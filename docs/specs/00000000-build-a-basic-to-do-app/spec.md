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

## How it works

**Page load.** `scripts/serve.mjs` (`npm start`) serves `src/` on `http://localhost:8080`. `src/index.html` holds the form (`#todo-form`, `#todo-input`), an empty `#todo-list` and `#todo-count`, and loads `app.js` as a module whose inline script calls `mount(document)`.

**State.** `mount` in `src/app.js` keeps the task list as `let tasks = []` in its closure: an array of `{ id, text, done }`, in memory only, so a reload starts empty. The id counter (`nextId`) is module state in `src/todo.js`. `todo.js` is pure: each function takes the array and returns a new one.

**Add / toggle / delete.** `mount` attaches three listeners, then calls `render()` once.
- `submit` on the form (covers the Add button and Enter): `preventDefault`, `tasks = addTask(tasks, input.value)`, clear the input, `render()`. `addTask` trims the text and returns the array unchanged when it is empty, so blank input is rejected but the input is still cleared.
- `change` on the list: `tasks = toggleTask(tasks, id)`, `render()`, then focus returns to that task's checkbox.
- `click` on the list: if the target is inside a `<button>`, `tasks = removeTask(tasks, id)`, `render()`, then focus moves to the Delete button now at the removed task's index (the previous task's when the last one was removed), or to the text input when the list is empty.
- `id` comes from the closest `<li>`'s `data-id`, never from list position. `toggleTask` and `removeTask` ignore unknown ids.

**Render.** `render()` rebuilds the list with `replaceChildren` from `tasks`. Each `<li>` has a labelled checkbox, a `<span>` with the text (set via `textContent`, with a `done` class when done) and a Delete button with `aria-label="Delete <text>"`. Nothing is patched in place.

**Count.** The count is not stored. Each `render()` sets `#todo-count` to `formatCount(countCompleted(tasks))`, e.g. `3 of 5 completed`, so it cannot drift from the list.

**Dev server.** `createServer()` takes no argument and is exported; it only listens, on `127.0.0.1:8080`, when run directly. It resolves the decoded URL path against `src/` (`/` → `index.html`) and returns 404 for missing files, a malformed request target or percent-encoding, NUL-containing paths, and anything that resolves outside `src/`. Content types are set for `.html`, `.css` and `.js`.

**Divergences from plan.md**
- `engines.node` is `>=22.13`, not `>=22.8` (jsdom 29 requires it); the README says the same.
- The `npm test` script ends in `'test/*.test.js'`, not `test/` (Node 22 treats a bare directory as a module path).
- The dev-server test is `test/serve.test.js`, which the plan's Touched surface table did not list.
- `scripts/serve.mjs` exports `createServer()` so the test can start it on a free port; the plan did not describe this export.
- `todo.js` keeps a module-level id counter (`nextId`), although plan.md → Approach says it has no global state; ids stay unique across `addTask` calls, so the functions are not strictly pure.
