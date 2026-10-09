# Edit a task

- **Status:** Draft

Users can edit the text of an existing task by double-clicking on it or clicking an Edit button. The task text turns into an editable text field. Pressing Enter saves the edit; pressing Escape cancels. An empty or whitespace-only edit does not save.

## Problem

Currently, once a task is added, its text cannot be changed. Users must delete and recreate a task if they make a typo or want to update it.

## Outcomes

- A user can double-click a task's text to enter edit mode
- A user can click an Edit button next to a task to enter edit mode  
- While editing, the task text is in a focused text input field
- Pressing Enter saves the edited text if it is not empty or whitespace-only
- Pressing Escape cancels the edit without saving
- An edit that results in empty or whitespace-only text is rejected and edit mode remains active
- After saving or cancelling, the task list re-renders and focus is managed appropriately

## Out of scope

- Editing other task properties (done status, deletion) during edit mode
- Undo/redo for edits
- Autosave or timed persistence

## Constraints

- The app is vanilla JavaScript with no framework
- Task state is immutable (as per the existing todo.js pattern)
- Styling uses CSS variables defined in styles.css
- Changes are tested with `npm test` (node --test)

## Behaviour

### Edit mode entry

- Double-clicking the task text span enters edit mode for that task
- Clicking an Edit button (visible next to each task) enters edit mode for that task
- When entering edit mode, an input field with the current task text appears in place of the text span
- The input field receives focus immediately and its text is selected

### Edit mode: saving

- Pressing Enter while focused on the edit input saves the edit
- The new text is trimmed of leading/trailing whitespace
- If the trimmed text is not empty, it replaces the task text and edit mode exits
- The task list re-renders
- Focus moves to the task's Edit button (or, if it has been deleted, to the next task's Edit button or the input field)

### Edit mode: cancelling  

- Pressing Escape while focused on the edit input cancels the edit without changing the task
- Edit mode exits and the task list re-renders with the original text
- Focus moves to the task's Edit button

### Edit mode: rejecting empty text

- If Enter is pressed and the trimmed text is empty, the edit is not saved
- Edit mode remains active
- The input still receives focus and its content is selected (or left as-is for user correction)
- The message, if any, is handled silently (no alert; the field simply remains in edit state)

### Edge cases

| Scenario | Behaviour |
|----------|-----------|
| User double-clicks the text span | Edit mode activates with input focused and text selected |
| User clicks Edit button | Edit mode activates with input focused and text selected |
| User edits text and presses Enter with non-empty trimmed text | Task text updates, edit mode exits, focus moves to Edit button |
| User edits text and presses Enter with only whitespace | Edit not saved, edit mode remains active, input focused with text selected |
| User presses Escape during edit | Original text restored, edit mode exits, focus to Edit button |
| User clicks outside the input during edit | Edit is cancelled (handled by blur event), focus management as per Escape behaviour |
| Task is deleted by another action during edit | Edit input disappears with no error |
| Multiple tasks are on screen | Double-click or Edit button affects only the clicked task |

## Contracts

Detail lives in `./contracts/` — `provides.md` and `requires.md`.

- **Provides:** the same single to-do screen, now with in-place editing; no API, nothing consumes it.
- **Requires:** nothing upstream — no network calls, no environment variables, no sibling modules.

## Verification

- All changes pass `npm test`
- A user can double-click a task to edit it, press Enter to save, and the text updates
- A user can double-click a task, press Escape, and the original text is restored
- A user can attempt to save an edit with only whitespace and the edit is rejected
- Focus is correctly managed before, during, and after edit operations
- Delete and toggle operations continue to work on tasks being edited or adjacent tasks

## How it works

**Entering edit mode.** Double-clicking a task's text, or pressing the Edit button beside it, starts editing that task. Only one task is edited at a time, and which task it is lives only in the page's memory; it is never stored on the task, so a reload starts with nothing being edited. The edited task shows a single text field holding its current text, named "Edit" followed by that text for assistive technology, in place of its checkbox, text and buttons, so nothing else about the task can be changed while editing. The field receives focus and its whole text is selected. Clicking the task's text once no longer ticks the task; only its checkbox does.

**Saving.** Enter in the field trims the text and replaces the task's text with it. The task's done state and its place in the list are unchanged, as are all other tasks. Editing then ends, the list is rebuilt and focus goes to that task's Edit button.

**Rejecting a blank edit.** Enter on empty or whitespace-only text saves nothing, shows no message and keeps edit mode: the field stays focused with its text selected, ready for correction.

**Cancelling.** Escape ends editing without saving, shows the original text again and focuses the task's Edit button. Moving focus out of the field also cancels, but only that one row goes back to its normal form; the rest of the list is left alone, so a click that caused the focus to leave still lands on the other task's checkbox, Edit button or Delete button. Focus goes to the Edit button only when it is not moving to another control, so it never steals focus from the control the user chose. Other keys do nothing, and Enter in the edit field never adds a new task.

**Row height.** A task row is the same height in normal and edit mode, so swapping the edited row back does not shift the rows below it between pressing and releasing the mouse, and a click on the row below is not lost.

**Text entry with an input method.** Enter or Escape pressed to confirm or abandon a composition in progress (for example when typing Japanese, Chinese or Korean) is ignored: it neither saves nor cancels, and the user stays in edit mode with the field as it is.

**Switching window or tab.** When the whole window or tab loses focus, edit mode is kept with the typed text as it is; the field is focused again when the user returns. Only focus moving to something else on the page cancels the edit.

**Unchanged behaviour.** Ticking a task's checkbox still flips only that task, and the edit field's own change when it loses focus after typing does not tick the task. After a delete, focus still moves among the Delete buttons only. Edited text is shown as plain text, so markup typed into it appears literally. If the edited task disappears from the list, no field is shown for it and nothing goes wrong. When a task is saved or cancelled it always still exists, so focus never needs to fall back to another task's Edit button or the add field.

**Divergences.** Where the build differs from the plan, see `plan.md` → "Divergences found during the build".
