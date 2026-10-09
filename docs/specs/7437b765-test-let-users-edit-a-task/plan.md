# Plan — Edit a task

Derived from `spec.md`. This is where implementation details are allowed.

This is a change to the shipped to-do app (`docs/specs/00000000-build-a-basic-to-do-app/`).
It follows the patterns already in `src/todo.js` (pure functions over an immutable
array) and `src/app.js` (state in `mount`'s closure, the whole list re-rendered from
state after every change, one delegated listener per event type on the list).

## Two problems in the existing code that every approach must solve

1. **Double-click on the text currently toggles the task.** The text `<span>` sits
   inside the checkbox's `<label>`, so each click of a double-click toggles the
   checkbox (two toggles, two re-renders, and the second click lands on a freshly
   rendered node). A click cannot be told apart from the first half of a double-click
   without a timer, so the text has to leave the label. The checkbox then gets its
   accessible name from `aria-label` (the task text, as today). Side effect: clicking
   the task text no longer toggles it; the checkbox itself still does.
2. **The list's handlers assume one kind of button and one kind of input.** The click
   handler treats any `<button>` as Delete and the delete-focus code picks "the n-th
   button"; the change handler treats any `change` as a checkbox toggle. A text input
   fires `change` when it loses focus with a changed value, so without a guard,
   typing an edit and clicking away would toggle the task. Buttons get a
   `data-action` (`edit` / `delete`), and the change handler acts only on checkboxes.

## Approaches considered

### A. Edit state in `mount`'s closure, rendered from state (recommended)

`mount` holds `editingId` (a task id or `null`) next to `tasks`. `renderTask` renders
the edited task as a single text input instead of checkbox + text + buttons; `render`
focuses and selects that input when there is one. Saving calls a new pure
`editTask(tasks, id, text)` in `todo.js`. Cancelling (Escape, or blur) just clears
`editingId`.

- For: one source of truth, same render-from-state pattern as add/toggle/delete, so a
  re-render caused by anything else cannot silently lose or duplicate edit mode; the
  saving rule (trim, reject blank) is a pure, unit-tested function like `addTask`.
- Against: a full re-render on blur would replace the node the user is pressing
  (mousedown → blur → re-render → the click never lands), which would break "Delete
  and toggle continue to work on adjacent tasks". So blur-cancel replaces **only the
  edited `<li>`** instead of the whole list (see Approach).

### B. Swap DOM nodes in place, no edit state

On double-click / Edit, replace the `<span>` with an `<input>` directly; on Enter
write the value back into `tasks` and re-render; on Escape/blur put the span back.

- For: smallest diff in `app.js`; no re-render while editing.
- Against: the DOM becomes a second source of truth for "which task is being
  edited". Any re-render while editing (for example toggling another task) silently
  drops the edit, and the code no longer follows the render-from-state rule the rest
  of `app.js` relies on for consistency.

### C. `contenteditable` on the text span

Make the span editable instead of rendering an input.

- For: no element swap; the text stays where it is.
- Against: accepts pasted markup and newlines, needs Range/Selection code to
  select all, behaves inconsistently across browsers and in jsdom, and is announced
  less clearly by screen readers than a labelled text input. The spec asks for "a
  text input field".

**This plan follows approach A.** Approving the plan picks A; request changes to pick
B or C instead.

## Approach

Approach A. No ADR: nothing here is expensive to reverse (no dependency, no data
boundary; all changes are inside `src/app.js`, `src/todo.js` and `src/styles.css`).
No runtime dependency is added.

### `todo.js`

| Export | Behaviour |
|---|---|
| `editTask(tasks, id, text)` (new) | Trims `text`. Returns `tasks` itself (same reference) when the trimmed text is empty or `id` is unknown; otherwise a new array where that task's `text` is replaced (other fields, and other tasks, unchanged). |

The app tells "rejected" from "saved" by reference: `editTask(...) === tasks` means
nothing changed and edit mode stays. The trimming rule lives in one place.

### `app.js`

Rendered task, normal mode (DOM order = visual order):
`<li data-id>` → checkbox (`aria-label` = task text) · `<span>` text (`done` class when
done) · `<button data-action="edit" aria-label="Edit <text>">Edit</button>` ·
`<button data-action="delete" aria-label="Delete <text>">Delete</button>`.

Rendered task, edit mode: `<li data-id>` → `<input type="text" class="edit"
aria-label="Edit <text>">` with value = current text. No checkbox or buttons while
editing (spec Out of scope: other properties during edit mode).

State: `let editingId = null` beside `tasks`. `render()` rebuilds the list as today;
if a task with `editingId` is in the list, it focuses that input and calls `select()`.
If the edited task is no longer in `tasks`, `editingId` is cleared and nothing is
focused (spec edge case "deleted during edit").

Handlers (delegated on the list, as today):

| Event | Target | Action |
|---|---|---|
| `dblclick` | the task text `<span>` | `editingId = id`, `render()` |
| `click` | `button[data-action="edit"]` | `editingId = id`, `render()` |
| `click` | `button[data-action="delete"]` | as today; focus logic picks among Delete buttons only |
| `change` | checkbox only (`type="checkbox"`) | as today; the edit input's `change` is ignored |
| `keydown` Enter | edit input | `next = editTask(tasks, id, value)`; if `next === tasks` → re-select the input, stay in edit mode, no message; else `tasks = next`, `editingId = null`, `render()`, focus that task's Edit button |
| `keydown` Escape | edit input | `editingId = null`, `render()`, focus that task's Edit button |
| `focusout` | edit input, only while `editingId` is that task | cancel: `editingId = null`, replace **only that `<li>`** with its normal render; focus its Edit button only when focus is not going to another element (`relatedTarget === null`), so a click on another task's checkbox, Edit or Delete still lands and keeps its own focus behaviour |

`focusout` is used rather than `blur` because it bubbles, so one delegated listener
works. Enter and Escape clear `editingId` before re-rendering, so the `focusout` that
the removed input may fire afterwards is a no-op. The edit input is outside the add
form, so Enter in it never submits a new task.

"Focus moves to the task's Edit button (or, if it has been deleted, …)": after save or
cancel the task always exists (nothing can delete it mid-keystroke), so the code
focuses its Edit button; the "deleted" branch is not built (simplicity, no
unreachable code under the 100 % branch-coverage gate).

### `styles.css`

The edit input fills the row (`flex: 1`) and uses the existing variables
(`--color-border`, `--color-text`); the text span takes the remaining width so the
buttons stay right-aligned. Focus outline comes from the existing `input:focus-visible,
button:focus-visible` rule. No new variables unless a colour is needed that does not
exist.

## Touched surface

| Path | Change |
|---|---|
| `src/todo.js` | modified — add `editTask` |
| `src/app.js` | modified — edit state, edit rendering, `dblclick` / `keydown` / `focusout` handlers, `data-action` on buttons, checkbox-only `change`, text span out of the label |
| `src/styles.css` | modified — edit input and row layout |
| `test/todo.test.js` | modified — `editTask` unit tests |
| `test/app.test.js` | modified — edit-mode integration tests; helpers select buttons by `data-action`; the accessible-name test reads the checkbox's `aria-label` instead of its `<label>` |
| `docs/specs/7437b765-test-let-users-edit-a-task/spec.md` | modified — `## Contracts` summary (this commit); `## How it works` at ship |
| `docs/specs/7437b765-test-let-users-edit-a-task/plan.md`, `contracts/*` | new — this plan |

`src/index.html` is not touched (the list markup is all rendered by `app.js`).

## Data

| Data | Owner | Shape | Boundary |
|---|---|---|---|
| Task list | Client state in `mount`'s closure (unchanged) | array of `{ id, text, done }` | Edited text is trimmed and rejected when blank in `editTask`; rendered with `textContent` / `value` / `aria-label` only, never `innerHTML`. |
| Which task is being edited | Client state in `mount`'s closure | `editingId: number \| null` | UI state only; never stored on the task objects, cleared when its task disappears. |

Nothing is persisted (unchanged).

## Consumed contracts

None. No upstream system, no network, no environment variables.

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| — | — | — | — |

## Entry points

| Entry point | Runs | Behaviour on failure |
|---|---|---|
| `src/index.html` (the one screen) | Client-side only | No async work, so no loading/error states. The only failure path is a blank edit, rejected silently with the field left in edit mode and its text selected. |

## Accessibility

- Edit button is a real `<button>` with accessible name `Edit <task text>`; the edit
  input has accessible name `Edit <task text>`; the checkbox keeps the task text as its
  name (via `aria-label` now).
- Edit mode is keyboard reachable without a mouse (Tab to Edit, Enter/Space), and
  focus is always placed explicitly: into the input on entry, back to the Edit button
  on save/cancel.
- DOM order = visual order: checkbox, text, Edit, Delete.

## Risks

| Risk | Mitigation |
|---|---|
| Clicking the task text no longer toggles it (text leaves the label) | Unavoidable for double-click-to-edit without a timer; the checkbox still toggles. Called out here so the reviewer can object. |
| Blur-cancel re-render swallows a click on another task | `focusout` replaces only the edited `<li>`; test: while editing task A, clicking task B's Delete removes B and clicking B's checkbox toggles B. |
| Edit input's `change` event toggles the task | `change` handler ignores non-checkboxes; tested by firing `change` on the edit input. |
| A stale `focusout` after Enter/Escape acts twice | `editingId` is cleared first; handler checks it; tested by dispatching `focusout` on the removed input. |
| jsdom differs from browsers on focus/selection | Assert with `document.activeElement`, `selectionStart` / `selectionEnd` (supported by jsdom for text inputs); manual browser run of the spec's Verification before the PR. |
| Existing tests rely on "first button = Delete" | Helpers updated to `button[data-action="delete"]` in the same task that adds the Edit button. |

## Test strategy

The 100 % line/branch/function coverage gate in `npm test` stays.

- **Unit (`test/todo.test.js`)** — `editTask`: replaces text, trims, rejects empty and
  whitespace-only (returns the same array), unknown id (same array), leaves `done`,
  `id` and other tasks unchanged, does not mutate the input array.
- **Integration (`test/app.test.js`)**, through real events in jsdom:
  - double-click on the text and click on Edit each enter edit mode for that task only
    (other tasks unchanged); the input has the text, is focused, and fully selected;
    double-click does not toggle the task;
  - Enter with new text saves it trimmed, exits edit mode, focuses the Edit button;
    count unchanged; done state kept;
  - Enter with whitespace-only text keeps edit mode, keeps the task text unchanged,
    input focused and selected, no alert;
  - Escape restores the original text, exits edit mode, focuses the Edit button;
  - focus leaving the input to nowhere cancels and focuses the Edit button; focus
    leaving to another task's control cancels without stealing focus, and that
    control's click (Delete / checkbox) still works;
  - a stale `focusout` after save/cancel changes nothing; `change` on the edit input
    does not toggle;
  - deleting the edited task (via state change) leaves no input and throws nothing;
  - edited text containing markup renders as text; Edit button and edit input have
    accessible names;
  - existing toggle/delete/focus tests still pass with the updated helpers.
- Deliberately not tested: CSS appearance (manual browser check).
- No end-to-end browser suite: `.claude/ai-workflow.json` has no `"e2e"`.

## Expensive to reverse

Nothing. No ADR is needed for this change.
