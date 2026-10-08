# Fix completed count after deleting done tasks

- **Status:** Draft

**Status:** Draft

## Problem

Users report that the "X of Y completed" count displays incorrectly after deleting a task that was marked as done. The exact incorrect value is not yet known, but the issue occurs consistently in that scenario.

## Outcomes

- The completed count displays correctly after a user deletes any task, whether it is done or open.
- The count shows the correct number of remaining done tasks and the correct total remaining tasks.

## Out of scope

- Changes to the count format or wording.
- Changes to when or how often the count updates.

## Constraints

- The fix must not break any existing tests.
- The logic in `todo.js` (countCompleted, formatCount) is used by `app.js` to render the count.
- The app uses the DOM event system to wire user interactions in `app.js`.

## Behaviour

1. When a user clicks the Delete button on any task (done or open), that task is removed from the list.
2. The count is recalculated by calling `countCompleted(tasks)` on the updated task array.
3. The count is formatted and rendered to the `#todo-count` element.
4. The rendered count reflects the actual number of done tasks and total tasks remaining.

### Edge cases

| Scenario | Behaviour |
|----------|-----------|
| Delete a done task when it's the only task | Count shows "0 of 0 completed" |
| Delete a done task when others remain (some done, some open) | Count shows correct done count and total |
| Delete an open task when others are done | Done count stays the same; total decreases |
| Delete the last done task, leaving only open tasks | Count shows "0 of N completed" |
| Rapid deletion of multiple done tasks | Count updates correctly after each deletion |

## Verification

- Add 5 tasks; mark 3 as done; delete one done task. Count should show "2 of 4 completed".
- Add 3 tasks; mark all 3 as done; delete one. Count should show "2 of 2 completed".
- Add 2 tasks; mark 1 as done; delete the done task. Count should show "0 of 1 completed".
- Run `npm test` and confirm all tests pass.
- Test in a browser to confirm the count updates visibly and correctly after each delete action.