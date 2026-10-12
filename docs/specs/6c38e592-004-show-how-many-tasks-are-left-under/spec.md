# Show task counter

- **Status:** Draft

## Problem
Users don't see at a glance how many incomplete tasks remain, making it harder to track progress.

## Outcomes
- A counter displays under the task list showing incomplete tasks remaining
- Counter updates in real-time as tasks are added, completed, or deleted
- Proper singular/plural forms: "1 task left" vs "3 tasks left"
- Counter is hidden when there are no incomplete tasks (empty list or all tasks done)

## Out of scope
- Changes to styling (use existing CSS variables)
- Changes to HTML structure

## Constraints
- The DOM element `#todo-count` already exists and is wired into the render cycle
- Must use the existing `render()` function in app.js

## Behaviour
The counter displays below the task list, showing the count of incomplete tasks. The text is:
- "1 task left" when exactly one task remains incomplete
- "N tasks left" when multiple tasks remain incomplete (N ≥ 2)
- Hidden (empty string) when all tasks are complete or no tasks exist

The counter updates automatically whenever tasks are added, marked complete/incomplete, or deleted.

### Edge cases

| Scenario | Displayed |
|----------|-----------|
| 0 tasks, 0 incomplete | Hidden |
| 3 tasks, 0 incomplete | Hidden |
| 1 task, 1 incomplete | "1 task left" |
| 5 tasks, 3 incomplete | "3 tasks left" |
| Add a task to empty list | "1 task left" |
| Mark only remaining task complete | Hidden |

## Verification
- [ ] Counter displays "1 task left" when one incomplete task exists
- [ ] Counter displays "N tasks left" for 2+ incomplete tasks
- [ ] Counter is hidden when zero incomplete tasks remain
- [ ] Counter updates when a task is added
- [ ] Counter updates when a task is marked complete
- [ ] Counter updates when a task is marked incomplete
- [ ] Counter updates when a task is deleted
- [ ] Counter uses proper pluralization in all cases
## Contracts

Detail lives in `./contracts/` — `provides.md` and `requires.md`.

- **Provides:** the same single static screen; `#todo-count` now shows tasks left. No API, nothing consumes it.
- **Requires:** the `/` screen's `#todo-count` and `render()` cycle from 00000000; no upstream data.

## How it works

**Where the number comes from.** The count is never stored. Every time the list is redrawn — on first load, after adding a task, after ticking or unticking a checkbox, and after deleting a task — the open tasks in the current list are counted and the wording is chosen from that number. The text appears in the line under the list.

**What it says.** No open task (empty list, or every task done): the line is empty, so nothing shows. One open task: "1 task left". Two or more: "N tasks left".

**Screen readers.** The counter line is still a polite live region, so the new text is announced after each change. The line stays in the page when empty rather than being hidden, so the first "1 task left" after an empty list is announced too.

**Editing.** Changing a task's text redraws only that row and leaves the counter untouched; an edit cannot change how many tasks are open.

**What changed from before.** The line used to read "X of Y completed"; that text is gone. The progress ring in the header still shows completed/total. No markup or styles changed; the empty paragraph keeps its top margin. The shipped code matches the plan (approach A) with no divergence.
