# [W1] done stops planning

- **Status:** Draft

## Problem

The to-do app currently displays completed task counts. Users want a simpler footer showing only the number of open to-dos remaining, using a minimal format like "3 left".

## Outcomes

- Footer displays the count of incomplete to-dos only
- Format is concise (e.g., "3 left", "0 left")
- Footer updates in real-time when tasks are added, marked done, or deleted
- Visual design remains minimal and unobtrusive

## Out of scope

- Changing any other part of the UI
- Adding new task features
- Persistence or localStorage

## Constraints

- Use the existing `#todo-count` element in index.html
- Modify only the `formatCount` function in todo.js to change the display format
- Keep styling minimal using existing CSS
- No new dependencies

## Behaviour

### Count display
- Shows the number of incomplete (not done) tasks
- Format: "N left" where N is the count of open to-dos
- Updates in real-time as tasks are added, marked done/undone, or deleted

### Examples
- 3 incomplete tasks: "3 left"
- 0 incomplete tasks: "0 left"
- After marking a task done: count decreases by 1
- After adding a task: count increases by 1
- After deleting an incomplete task: count decreases by 1
- After deleting a complete task: count stays the same

### Edge cases

| Scenario | Behaviour |
|---|---|
| App loads with no tasks | "0 left" |
| Add first task | "1 left" |
| Mark the only task as done | "0 left" |
| Mark all tasks as done | "0 left" |
| Mark a done task back to incomplete | count increments |
| Delete incomplete task | count decrements |
| Delete complete task | count stays the same |
| Rapid add/delete of incomplete tasks | Count updates correctly each time |

## Verification

- Visual test: add 5 tasks, see "5 left"; mark 2 done, see "3 left"; delete 1 incomplete, see "2 left"
- Unit test: `formatCount()` returns correct "N left" format
- `npm test` passes all tests
- Count element remains styled and positioned as a minimal footer

## Contracts

Detail lives in `./contracts/` — `provides.md` and `requires.md`.

- **Provides:** one static screen (the to-do page with updated count format); no API, nothing consumes it.
- **Requires:** nothing upstream — no network calls, no environment variables, no sibling modules.