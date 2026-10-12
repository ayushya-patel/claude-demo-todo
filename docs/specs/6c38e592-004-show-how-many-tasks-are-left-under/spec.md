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