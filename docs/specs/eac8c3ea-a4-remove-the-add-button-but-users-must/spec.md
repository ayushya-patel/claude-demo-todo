# [A4] Remove the Add button but users must still be able to add tasks with zero clicks and zero typing

- **Status:** Draft

## Problem

The current to-do app requires users to click an Add button or press Enter to add tasks. The requirement is to remove the Add button and allow task addition with zero clicks and zero typing, while tasks survive a page reload.

## Outcomes

- The Add button is removed from the UI
- Tasks can be added without user interaction (clicks or typing)
- Tasks persist through a page reload
- All existing task functionality (marking done, deleting, counting) remains

## Out of scope

- Editing existing tasks
- Task priority or categories
- Mobile-specific design
- Keyboard shortcuts

## Constraints

- No Add button visible
- Zero clicks and zero typing required to add tasks
- Tasks must survive a page reload

## Behaviour

### Add task
- Tasks are added automatically without user interaction
- No text input required; the app generates or provides task content by default
- Tasks appear in the list without any user action (click or typing)
- The mechanism for generating tasks without input is not specified by user action

### Mark task as done
- User clicks checkbox next to task
- Task text shows a visual indicator (strikethrough)
- Completed task count increments
- Unchecking re-activates the task and decrements count

### Delete task
- User clicks delete button on a task
- Task is removed from the list immediately
- If task was completed, completed count decrements

### Count display
- Shows "X of Y completed" format
- Updates in real-time as tasks are marked done/undone
- Resets as tasks are added or deleted

### Persistence
- Tasks are stored so they survive a page reload
- Task state (completed/not completed) is also persisted
- Deletions are persisted

### Edge cases

| Scenario | Behaviour |
|---|---|
| Page reload | Tasks are restored from storage |
| No user action | Tasks are automatically added without clicks or typing |
| Completed task count after reload | Count matches the task list state after restore |
| All tasks deleted then reload | Lists reflect the delete state across reloads |

## Verification

- Visual inspection confirms the Add button is not present
- Manual test: load the page, verify tasks appear without clicking or typing
- Reload the page and verify tasks are still present
- Verify checkboxes and delete buttons still work
- `npm test` passes all task management tests

## Contracts

- **Provides:** one static screen (the to-do page); no API, nothing consumes it
- **Requires:** nothing upstream — no network calls, no environment variables, no sibling modules

## Notes

Clarification still needed before implementation: How should tasks be added without user input? What mechanism provides task content? (Examples: generate placeholder tasks on first load, fetch from an API, use predefined data, etc.)