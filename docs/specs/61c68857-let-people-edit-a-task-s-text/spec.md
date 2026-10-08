# Edit a task's text

- **Status:** Draft

## Problem

Users cannot fix a typo in a task without deleting it and creating a new one.

## Outcomes

- A task's text can be edited inline by double-clicking it or pressing Enter when it is focused
- Saving the edit (Enter or leaving the field) updates the task
- Pressing Escape cancels the edit and restores the original text
- Saving empty text is ignored and the original text is preserved
- Editing works for both completed and incomplete tasks
- The completed count remains unchanged by editing
- The feature is keyboard and screen-reader accessible
- The feature is covered by automated tests

## Out of scope

- Editing multiple tasks at once
- Undo or editing history
- CSS styling changes beyond what is needed for the inline edit field

## Constraints

- Vanilla JavaScript only; no framework
- Logic must be testable via `npm test`
- DOM wiring through `app.js`
- Task data model in `todo.js`

## Behaviour

When a user double-clicks the text span of a task or presses Enter while the text span is focused:

1. The text span is replaced with an `<input type="text">` field containing the current task text
2. The input is immediately focused and its content is selected
3. While editing, the rest of the task row (checkbox, delete button) remains visible and interactive
4. When the user presses Enter or the input loses focus, the edit is saved if the input contains non-whitespace text; the input is replaced with a span showing the updated text
5. If the input contains only whitespace or is empty, the edit is cancelled and the original text is restored
6. When the user presses Escape, the edit is cancelled without saving and the original text is restored
7. If the input loses focus (blur event), the edit is saved using the same logic as pressing Enter
8. The task's `done` status is not changed by editing
9. The completed count display is not updated by editing
10. If a user interacts with the checkbox or delete button while editing, the edit is cancelled first
11. The input field has appropriate `aria-label` or is within a label for screen readers
12. Focus is returned to the text span after editing completes (either save or cancel)

### Edge cases

| Case | Behaviour |
|------|-----------|
| User double-clicks the text, then presses Escape | Input is replaced with original text span; no task data changes |
| User double-clicks, changes text, presses Enter | Task text is updated; input is replaced with span showing new text |
| User double-clicks, deletes all text, presses Enter | Original text is restored; no change to task |
| User edits a completed task | Task remains completed; only text changes |
| User edits an incomplete task | Task remains incomplete; only text changes |
| User edits and the input blurs by clicking the checkbox | Edit is cancelled; checkbox toggle proceeds normally |
| User edits and the input blurs by clicking the delete button | Edit is cancelled; task is deleted |
| Task text contains markup (e.g. `<b>`) | Text is treated as plain text in the input and rendered as text in the span, not as HTML |
| Input receives focus by keyboard (Tab) and user presses Enter | Edit is saved normally |

## Verification

- [ ] A new task can be created and its text can be edited inline
- [ ] Double-clicking the text span enters edit mode with the text selected and focused
- [ ] Pressing Enter in the edit field saves the new text (if non-whitespace) and replaces the input with a span
- [ ] Pressing Escape cancels the edit and restores the original text
- [ ] Blurring the edit field saves the text (if non-whitespace) using the same logic as Enter
- [ ] Saving only whitespace or empty text is rejected and the original text is restored
- [ ] Editing a completed task does not change its completion status
- [ ] Editing an incomplete task does not change its completion status
- [ ] The completed count does not change after editing
- [ ] Interacting with the checkbox while editing cancels the edit first
- [ ] Interacting with the delete button while editing cancels the edit first
- [ ] Focus returns to the text span after edit completes
- [ ] The feature works with keyboard navigation (Tab, Enter, Escape)
- [ ] Screen readers announce the edit state appropriately
- [ ] All existing tests continue to pass
- [ ] New tests cover: entering edit mode, saving valid text, rejecting empty/whitespace, cancelling with Escape, cancelling with blur, interaction with checkbox/delete during edit
