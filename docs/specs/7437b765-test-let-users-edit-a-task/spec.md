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

**Entering edit mode.** Double-clicking a task's text, or pressing the Edit button beside it, starts editing that task. The page remembers which task is being edited (a task identifier, or none) next to the task list; this is page memory only and never stored on a task. Only one task is edited at a time, and the list is rebuilt from the task list and that identifier, as for every other change. The edited task shows a single text input holding its current text, labelled `Edit <task text>`, in place of its checkbox, text and buttons, so nothing else about it can be changed while editing. The input receives focus and its whole text is selected.

**Saving.** Enter in the input trims the text and replaces the task's text with it, using `editTask(tasks, id, text)` in `src/todo.js`. Like the other operations, it never changes the existing list. It returns the same list, untouched, when the trimmed text is empty or the identifier is unknown; otherwise it returns a new list with only that task's text replaced (done flag, identifier and other tasks unchanged). The page compares the returned list with the one it passed in to tell a rejected edit from a saved one. On a save, editing ends, the list is rebuilt, and focus goes to that task's Edit button.

**Rejecting a blank edit.** Enter on empty or whitespace-only text saves nothing, shows no message, and keeps edit mode: the input stays focused with its text selected, ready for correction.

**Cancelling.** Escape ends editing without saving, rebuilds the list with the original text, and focuses the task's Edit button. Focus leaving the input also cancels: only that task's row is put back (the rest of the list is not rebuilt, so a click that caused the focus to leave still lands on the other task's checkbox, Edit or Delete button). Focus goes to the Edit button only when it is not moving to another control, so it never steals focus from the control the user chose. Enter and Escape clear the edit state first, so the focus-leaving event that the removed input may still fire is ignored. Other keys do nothing, and Enter in the edit input never submits the add form.

**Unchanged behaviour.** The checkbox only reacts to its own change; the edit input's change event (fired when it loses focus after typing) does not toggle the task. Buttons are told apart by what they do (edit or delete), and after a delete, focus moves among the Delete buttons only. The text is set with `textContent`, `value` or `aria-label` only, so edited markup shows as plain text.

**Styling.** The edit input fills the row (`flex: 1`) using the existing `--color-border` and `--color-text` variables, and the task text takes the remaining width so the buttons stay right-aligned. The visible focus outline is the existing rule for inputs and buttons.

**Divergences from `plan.md`.**
- The `<label>` around the checkbox and text was removed entirely, not just the text moved out of it; the checkbox is named by its `aria-label` (the task text), and clicking the text no longer toggles the task.
- The page does not clear the edit state when the edited task disappears from the list. No input is drawn for a missing task and identifiers are never reused, so the stale identifier is harmless, and the branch would be unreachable from the page under the 100 % coverage gate. The planned test "deleting the edited task leaves no input" was therefore not written either.
- The Edit button's click is handled before the Delete logic in the one delegated `click` listener, and returns early, instead of being a separate branch after it.
- The spec's "focus moves to the next task's Edit button or the input field if the task was deleted" was not built, as the plan already decided: after a save or cancel the task always exists.
