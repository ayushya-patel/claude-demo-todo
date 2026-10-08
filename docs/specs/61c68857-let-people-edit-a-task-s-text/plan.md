# Plan — Edit a task's text

Derived from `spec.md`. This is where implementation details are allowed.

This changes the shipped to-do app ([00000000](../00000000-build-a-basic-to-do-app/spec.md)):
the same `src/todo.js` (data model) and `src/app.js` (DOM wiring) get one new
operation and one new interaction. No dependency is added; `npm test` (100 % line,
branch and function coverage of `src/**/*.js`) stays the check.

## Approaches considered

All three share these points, which the current code forces:

- **The text span must leave the `<label>`.** Today each row is
  `<label><input type=checkbox><span>text</span></label>`, so a click on the text
  toggles the checkbox. A double-click is two clicks: it would toggle the task twice,
  re-render twice and announce the count twice, breaking Behaviour 8 and 9. The span
  therefore moves out of the label and becomes its own focusable element
  (`tabindex="0"`), and the checkbox gets its accessible name from
  `aria-label="<task text>"` (the same pattern the Delete button already uses).
  **Visible consequence:** a single click on a task's text no longer toggles it; the
  checkbox itself still does. The existing accessible-name test changes to match.
- **Blur saves, but a click on the row's checkbox or Delete cancels** (edge-case table).
  In a browser the input blurs on `mousedown`, before the `click` reaches the control,
  so the blur handler alone cannot tell the two apart. A delegated `mousedown` on the
  list cancels the edit when it lands on the editing row's checkbox or Delete button;
  the blur that follows then finds no edit in progress and does nothing. Leaving by
  keyboard (Tab) is a plain blur and saves, as Behaviour 7 says.
- **One edit at a time, guarded.** Removing a focused input can itself fire `blur` in
  some browsers, so finishing an edit clears the "editing" state *before* touching the
  DOM, and every handler ignores events from an input that is no longer the current
  edit. This also prevents a double save (Enter, then the blur caused by re-render).
- **Data stays in `todo.js`.** A new pure `editTask(tasks, id, text)` trims the text,
  returns `tasks` unchanged when it is empty or the id is unknown, and otherwise
  returns a new array where only that task's `text` changed (`id` and `done` kept).

### A. Edit state in `mount`'s closure, drawn by `render()` (recommended)

`mount` holds `editingId` (the id being edited, or `null`) next to `tasks`.
`renderTask` draws an `<input type="text">` instead of the span when
`task.id === editingId`. Starting an edit sets `editingId` and re-renders, then
focuses and selects the input. Saving sets `editingId = null`, calls `editTask`,
re-renders and focuses the span; cancelling does the same without `editTask`.

- For: keeps the module's one rule, "the list is rebuilt from state after every
  change; nothing is patched in place" (00000000 → How it works), so there is one
  code path that builds rows. Start, save and cancel are three symmetrical lines each.
- Against: entering edit mode rebuilds the whole list (negligible for this app). The
  text being typed lives only in the input, so anything that re-renders mid-edit
  would drop it — but every such path (checkbox, Delete, the add form) first blurs or
  cancels the edit, so none occurs.

### B. Swap the span for an input in place, re-render on finish

On double-click / Enter, `app.js` builds the input and calls `span.replaceWith(input)`
directly; saving or cancelling re-renders as usual.

- For: entering edit mode touches one node, no closure state beyond a reference to
  the current input.
- Against: a second way to build part of a row, outside `renderTask`, which the
  module deliberately avoided; the input's attributes (`aria-label`, value) are set
  in a different place from the row they belong to.

### C. `contenteditable` on the span

Make the span editable in place instead of swapping in an input.

- For: no element swap, no focus transfer.
- Against: the spec says the span is replaced by `<input type="text">` (Behaviour 1);
  `contenteditable` accepts pasted markup and line breaks that would need stripping,
  and its screen-reader announcement varies between browsers.

**This plan follows approach A.** Approving the plan picks A; request changes to pick
B (or C, which would need the spec changed).

## Approach

Approach A, as described above. In detail:

### `todo.js`

| Export | Change |
|---|---|
| `editTask(tasks, id, text)` | **new** — trims `text`; empty after trim or unknown `id` → returns `tasks` unchanged (same array); otherwise a new array with that task's `text` replaced and its `id` and `done` untouched. Same shape as `toggleTask` / `removeTask`. |

Nothing else changes; `countCompleted` is untouched, so the count cannot move on an edit.

### `app.js`

Row markup becomes:

```
<li data-id="N">
  <input type="checkbox" aria-label="<text>">
  <span tabindex="0" aria-describedby="edit-hint">text</span>   ← or, while editing:
  <input type="text" class="edit" aria-label="Edit task: <text>" value="<text>">
  <button type="button" aria-label="Delete <text>">Delete</button>
</li>
```

New delegated listeners on `#todo-list` (the module already delegates `change` and
`click` there):

| Event | Target | Action |
|---|---|---|
| `dblclick` | a task's span | start editing that task |
| `keydown` Enter | a task's span | start editing that task (`preventDefault`) |
| `keydown` Enter | the edit input | save |
| `keydown` Escape | the edit input | cancel |
| `focusout` (bubbling blur) | the edit input | save, unless the edit already ended |
| `mousedown` | the editing row's checkbox or Delete button | cancel; the click then proceeds through the existing `change` / `click` handlers unchanged |

- **Start:** `editingId = id; render();` then focus the input and `select()` it.
- **Save:** read the input's value, `editingId = null`, `tasks = editTask(tasks, id, value)`,
  `render()`, focus that task's span. Blank input → `editTask` returns the list
  unchanged, so the original text is restored by the same path (Behaviour 5).
- **Cancel:** `editingId = null; render();` focus that task's span.
- The existing `change` / `click` handlers already re-render and move focus to the
  checkbox / next Delete button; after a `mousedown` cancel they run as today, so the
  toggle or delete "proceeds normally" and focus follows the existing rules (not the
  span), matching the edge-case table.
- Text is set with `textContent` / `.value` only, never `innerHTML`, so markup in a
  task stays text in both the span and the input.
- The Delete button's and checkbox's `aria-label`s are rebuilt from the saved text on
  render, so they follow an edit.

### `index.html` / `styles.css`

- One visually hidden hint after the list: `<p id="edit-hint" class="visually-hidden">Press
  Enter or double-click to edit</p>`, referenced by every span's `aria-describedby`, so a
  screen reader announces how to edit when the span gets focus.
- CSS, limited to what the edit field needs (spec Out of scope): a `.visually-hidden`
  utility, the edit input taking the span's place (`flex: 1`), and the span getting the
  existing `:focus-visible` outline (today the rule covers only `input` and `button`).

## Touched surface

| Path | Change |
|---|---|
| `src/todo.js` | modified — add `editTask` |
| `src/app.js` | modified — row markup (span out of label, checkbox `aria-label`, span `tabindex`), `editingId` state, edit listeners |
| `src/index.html` | modified — `#edit-hint` visually hidden paragraph |
| `src/styles.css` | modified — `.visually-hidden`, edit input sizing, span focus outline |
| `test/todo.test.js` | modified — `editTask` unit tests |
| `test/app.test.js` | modified — edit integration tests; the accessible-name test updated for the checkbox `aria-label` |
| `docs/specs/61c68857-let-people-edit-a-task-s-text/contracts/*` | new — this plan's contracts |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | modified — the screen now also edits task text |

## Data

| Data | Owner | Shape | Boundary |
|---|---|---|---|
| Task list | Client state in `mount`'s closure (unchanged) | `{ id, text, done }` (unchanged) | Edited text is trimmed and rejected when empty in `editTask`, the same rule as `addTask`. |
| Task being edited | Client state in `mount`'s closure: `editingId` (number or `null`) | — | Only ever one; cleared before any DOM change that ends the edit. |
| Text being typed | The edit input's value, until save | string | Read once on save, passed through `editTask`. |

Nothing is persisted (unchanged).

## Consumed contracts

None. No upstream system, network call or environment variable.

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| — | — | — | — |

## Contracts

Detail lives in `./contracts/` — `provides.md` and `requires.md`. **Provides:** no new
route or API; the existing to-do screen gains inline editing. **Requires:** nothing
upstream. The approved `spec.md` has no `## Contracts` section and is left byte-for-byte
as approved; this paragraph is that summary.

## Entry points

| Entry point | Change | Behaviour on failure |
|---|---|---|
| `src/index.html` (the one screen) | Inline edit on each task | No async or network work. The only invalid input, blank text, is rejected by restoring the original text. |

## Accessibility

- The span is in the Tab order (`tabindex="0"`), has the focus outline, and Enter on it
  starts editing; its `aria-describedby` hint says how to edit.
- The edit input is named `Edit task: <text>` (Behaviour 11), so focusing it announces
  the edit state; Enter saves, Escape cancels, Tab saves and moves on.
- After save or cancel, focus returns to the span (Behaviour 12); a screen reader then
  reads the (new) text.
- Tab order stays visual order: checkbox, text, Delete.

## Risks

| Risk | Mitigation |
|---|---|
| A single click on the text no longer toggles the task (span leaves the label) | Unavoidable if a double-click must not toggle (Behaviour 8–9); the checkbox and its accessible name are unchanged for users. Called out above for the reviewer. |
| Double save / save after cancel, from the blur that a re-render or an Enter causes | `editingId` is cleared before `render()`; the `focusout` handler acts only while `editingId` matches the input's row. Tested by blurring after Enter and after Escape. |
| Browsers differ on whether a mouse click focuses a button (Safari does not), so `relatedTarget` cannot detect "clicked Delete" | Cancel on `mousedown`, which every browser fires before the blur. |
| jsdom's `click()` does not dispatch `mousedown` | Tests dispatch `mousedown` then `click`, the order a browser uses; a manual browser check of the two edge cases before the PR. |
| An edit leaves stale accessible names | Names are rebuilt from state on every render; tested after a save. |

## Test strategy

- **Unit (`test/todo.test.js`)**: `editTask` — changes only the text, keeps `id` and
  `done` (done and not-done task), trims, empty / whitespace returns the same list,
  unknown id returns the same list, leaves other tasks and `countCompleted` unchanged.
- **Integration (`test/app.test.js`)**, jsdom, real events, one test per spec
  Verification line: double-click enters edit mode with the text focused and
  selected; Enter on a focused span enters edit mode; Enter saves non-blank text and
  shows a span; Escape restores the original; blur saves; blank / whitespace restores
  the original; a done task stays done and a not-done task stays not done; the count
  text is unchanged after an edit; `mousedown` + click on the row's checkbox cancels
  the edit and toggles; on its Delete cancels and deletes; focus returns to the span
  after save and after cancel; markup in the text stays text in the input and the span;
  the input has its `aria-label`; the checkbox and Delete names follow the saved text;
  no second save from the blur after Enter.
- 100 % line / branch / function coverage stays enforced by `npm test`, so every new
  branch (the guards above included) needs a test.
- Not automated: visual styling of the edit field and real-browser `mousedown`/blur
  ordering — checked manually in a browser (`npm start`).

## ADRs

None. Nothing here is expensive to reverse: no dependency, data boundary or storage
change; the markup change is internal to the module (only its tests read it).
