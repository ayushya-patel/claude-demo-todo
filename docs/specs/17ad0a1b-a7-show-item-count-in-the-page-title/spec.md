# Show item count in the page title

- **Status:** Draft

## Problem
Users cannot easily see at a glance how many tasks are pending, even when the browser tab is out of focus.

## Outcomes
- Browser tab title displays "To-do (N)" where N is the number of incomplete tasks.
- Title updates instantly when tasks are added, completed, or removed.

## Out of scope
- Showing completed count in the title.
- Changing the heading or any other UI elements.

## Constraints
- Must use `document.title`.
- Must not break existing tests.

## Behaviour
The title updates whenever the task list changes:
- When a task is added: count increases if it starts incomplete.
- When a task is toggled complete: count decreases.
- When a task is toggled incomplete: count increases.
- When a task is deleted: count decreases if it was incomplete.

### Edge cases
| Case | Behaviour |
|------|-----------|
| No tasks | Title reads "To-do (0)" |
| All tasks completed | Title reads "To-do (0)" |
| New item added | Title updates before input clears |

## Verification
- Unit test: `countOpen()` returns the number of incomplete tasks.
- Integration test: render() updates `document.title` to match current open count.
- Manual: add, complete, and delete tasks; verify tab title matches open count.

## Contracts

Detail lives in `./contracts/` — `provides.md` and `requires.md`.

- **Provides:** the existing to-do screen, whose tab title now reads "To-do (N)"; nothing consumes it.
- **Requires:** nothing upstream — no network calls, no environment variables, no sibling modules.
