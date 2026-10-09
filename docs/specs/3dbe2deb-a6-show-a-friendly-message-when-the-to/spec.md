# Show a friendly message when the to-do list is empty

- **Status:** Draft

## Problem

When a user has no tasks, the page shows only the input form and "0 of 0 completed" with no visual content in the list area, making the interface feel empty or broken.

## Outcomes

- When the task list is empty, a friendly message appears in place of the empty `<ul>` to prompt the user to add their first task
- The completion count ("0 of 0 completed") remains visible below the message
- The message disappears as soon as the user adds their first task
- All existing to-do functionality (add, toggle, delete) works unchanged

## Out of scope

- Changing the completion count display or format
- Changing the input form layout or styling
- Changing task list styling when tasks are present

## Constraints

- Must use the existing DOM structure; no wrapper elements
- Message must render inside the `<ul id="todo-list">` element when empty
- `npm test` must pass; all existing tests must remain passing or be updated to reflect the new behaviour

## Behaviour

When the task list is empty (total === 0):
- The `<ul id="todo-list">` renders a single `<li>` containing the message "Nothing to do yet — add your first task above"
- This `<li>` has no interactive elements (no checkbox, no Delete button)
- It is styled to appear as neutral informational text, not a task

When the task list is not empty:
- The `<ul id="todo-list">` renders task items normally
- The message does not appear

The message text is: "Nothing to do yet — add your first task above"

### Edge cases

| Scenario | Behaviour |
|----------|-----------|
| List is empty on mount | Message appears, count shows "0 of 0 completed" |
| User adds first task while message is showing | Message disappears, task appears, count updates to "0 of 1 completed" |
| User deletes all tasks | Message reappears immediately |
| User adds task, then marks it done, then deletes it | Message reappears after deletion |
| Whitespace-only input is submitted on empty list | Message remains; input is cleared (existing behaviour) |

## Verification

- Snapshot test: empty list renders the message
- Snapshot test: non-empty list does not render the message
- Integration test: add a task to empty list → message disappears
- Integration test: delete all tasks → message reappears
- All existing app tests continue to pass
