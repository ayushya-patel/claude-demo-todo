# Plan — Filter the list: All, Active, Done

Derived from `spec.md` in this folder (change 001 to `00000000-build-a-basic-to-do-app`).
This is where implementation details are allowed.

## Approach

Three options were weighed; this plan follows **Approach 1**.

1. **Filter at render time in `src/app.js` (recommended, chosen).** `mount` keeps one
   more piece of state, `filter` (`'all' | 'active' | 'done'`). `render()` keeps
   computing the count, ring and empty state from the full `tasks` list (unchanged), but
   builds the `<li>` rows from `tasks.filter(isShown)` only. The filter is read from
   `localStorage` once on mount and written on each filter click, both inside
   `try/catch` so a missing or full storage degrades to "All, not remembered". One
   derivation of state: the list on screen is always rebuilt from `tasks` + `filter`,
   exactly as today's "rebuild after every change" rule. Focus rules after toggle and
   delete are computed against the visible rows. Cost: about 40 lines in `app.js`, a
   button group in `index.html`, a few CSS rules, tests.
2. **Hide rows with CSS.** Render every task as today, set `data-filter` on `#todo-list`
   and hide `li.is-done` / `li:not(.is-done)` with CSS. Smaller JS, but the hidden rows
   stay in the DOM: the delete-focus rule (which counts `button`s) and the toggle-focus
   rule would land on invisible rows unless rewritten to check visibility, and jsdom does
   not apply the stylesheet, so tests could not see what the user sees. Two sources of
   truth for "what is shown" (JS state and CSS). Rejected.
3. **A separate `src/filter.js` module** with pure `matchesFilter` / `readFilter` /
   `writeFilter`, wired from `app.js`. Clean to unit-test, but each function has exactly
   one caller and the spec makes the filter a display-only concern of the page; a new
   module adds a third file to the "logic in `todo.js`, wiring in `app.js`" split for
   ~15 lines. Rejected under Simplicity First; revisit if a second view ever needs
   filtering.

No ADR: storing a UI preference under one `localStorage` key is cheap to reverse
(delete the key and the code that reads it).

### Decisions where the spec reads two ways

- **The count.** The Outcomes say `"N tasks left"` shows incomplete tasks; the Behaviour
  section, the edge-case table (`"0 of 0"`) and the manual test (`"2 of 5 completed"`)
  all keep today's `X of Y completed`. The plan keeps **`X of Y completed`, counted over
  every task whatever the filter**, and adds no "N tasks left" line. Ask for a change if
  a "tasks left" line was meant.
- **Storage unavailable.** "All as the only option" (Behaviour) vs "functions with All as
  the active filter; no persistence" (edge cases): the plan follows the edge case. All
  three buttons still work; nothing is remembered.
- **Switching tabs.** The saved filter is applied when a page loads. A page already open
  in another tab does not change live (no `storage` event listener).
- **New task under "Done".** It is added and counted but stays hidden until it is marked
  done or the user picks All/Active.

## Behaviour changes and removals

- Three buttons, "All", "Active" and "Done", appear below the task list; "All" is selected the first time the app is opened.
- Choosing "Active" shows only tasks not yet done; choosing "Done" shows only finished tasks; "All" shows every task.
- The selected button is marked visually and announced to screen readers as pressed.
- The chosen filter is remembered in this browser and is selected again after the page is reloaded; if the browser blocks storage, the filters still work but are not remembered.
- Ticking a task while "Active" is selected (or unticking one while "Done" is selected) makes it disappear from the list straight away; the keyboard focus moves to the next task shown, or to the selected filter button if none are left.
- A task added while "Done" is selected is saved and counted, but is not shown until it is ticked or another filter is chosen.
- The count line keeps its current wording, "X of Y completed", and always counts every task, whatever filter is selected; no separate "tasks left" line is added.
- The "Nothing here yet" message still appears only when there are no tasks at all; when a filter hides every task, the list is simply empty.
- A filter changed in one browser tab only takes effect in another open tab after that tab is reloaded.

## Touched surface

| Path | Change |
|---|---|
| `src/index.html` | modified: filter button group after `#todo-list` |
| `src/app.js` | modified: filter state, storage read/write, render the visible subset, focus rules against visible rows, filter click handler |
| `src/styles.css` | modified: filter group and pressed-button styles (existing CSS variables; forced-colors) |
| `test/app.test.js` | modified: `setup` takes an optional URL / seeded storage; new filter, persistence and focus tests |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | modified: the `/` screen now has filter buttons (`#todo-filters`) |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/requires.md` | modified: reads/writes `localStorage` key `todoFilter` (degrade) |
| `docs/specs/00000000-build-a-basic-to-do-app/spec.md` | modified at ship (B4 fold-back): `## How it works` and `## History`; the "Persistence" out-of-scope line narrowed to tasks |
| `docs/specs/00000000-build-a-basic-to-do-app/changes/001-…/tasks.md`, `verify-report.md` | new (implement phase) |

`src/todo.js` is not touched (spec constraint). The change spec itself is never edited;
its `## Contracts` summary stays as approved, and the detail lives in the parent's
`contracts/`.

## Data

| Data | Owner | Shape | Boundary |
|---|---|---|---|
| Task list | client memory (unchanged) | `{ id, text, done }[]` | `todo.js` |
| Selected filter | client memory in `mount` | `'all' \| 'active' \| 'done'` | set only by a filter click or the mount-time read |
| Saved filter | browser `localStorage`, key `todoFilter` | one of the three strings | parsed on mount: any other value, a missing key or a throwing storage → `'all'` |

Nothing leaves the browser; there is one viewer and no hidden fields.

## Consumed contracts

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| `localStorage['todoFilter']` | browser Web Storage (`document.defaultView.localStorage`) | `src/app.js`, mount-time read | degrade: value not in `all/active/done`, `null`, or access/`getItem` throws → `'all'`; `setItem` throws → ignored, filter still applied |

## Entry points

The one screen, `/` (`src/index.html`), client-side only.

- **Markup:** after `<ul id="todo-list">`:
  `<div id="todo-filters" role="group" aria-label="Show tasks">` with three
  `<button type="button" data-filter="all|active|done" aria-pressed="true|false">`.
  The click handler is on `#todo-filters`, so the existing `#todo-list` click handler
  (Delete) is unaffected.
- **Mount:** read the saved filter, set `aria-pressed` on the buttons, render.
- **Filter click:** if it is the current filter, do nothing (no render, no write).
  Otherwise set `filter`, write it to storage, update `aria-pressed`, render.
- **Render:** rows from the visible subset; count, ring and empty message from all
  tasks, as today.
- **Toggle:** after render, focus the toggled task's checkbox if still shown; otherwise
  the checkbox now at the same visible position (or the last one); if no rows are
  shown, the pressed filter button.
- **Delete:** the existing rule, but the index is the task's position among the visible
  rows; empty visible list → the text input, as today.
- **Add / edit:** unchanged; focus stays where it is today.
- **Failure:** storage errors are caught and ignored (see Consumed contracts). No async
  work.

## Contracts

Change 001 has no contracts of its own (Path B). It updates the parent module's
`contracts/provides.md` (the `/` row gains the filter buttons and `#todo-filters`) and
`contracts/requires.md` (browser `localStorage`, key `todoFilter`, degrade). **Consumed
by** lists `971bd93b-improve-the-to-do-app-s-look`, which depends on `#todo-form`,
`#todo-input`, `#todo-list` and `#todo-count`: none are renamed or removed, so nothing
breaks; the new `#todo-filters` is styled with that module's existing CSS variables.

## Risks

| Risk | Mitigation |
|---|---|
| Toggle/delete focus code assumes the task is still rendered (`querySelector(...)` would be `null` under a filter) | Focus rules computed against visible rows, with tests for "task disappears" under Active and Done |
| `localStorage` access itself throws (sandboxed or `about:blank` origin) | Access and calls inside `try/catch`; jsdom's default `about:blank` origin exercises this path in tests |
| Clicking a filter while editing a task | `focusout` already saves the edit before the click handler runs (relatedTarget is outside the row, so no refocus); covered by a test |
| 100% branch coverage gate in `npm test` | Every storage branch (valid, invalid, missing, throwing read, throwing write) gets a test |

## Test strategy

Integration tests in `test/app.test.js` with jsdom (ADR 0001), extending `setup` to
accept an optional URL (so `localStorage` exists) and a value to seed under
`todoFilter` before `mount`:

- Default: "All" pressed, every task shown.
- Active / Done / All show the right rows; `aria-pressed` follows the click.
- Count and ring are the same under every filter (`2 of 5 completed`).
- Clicking the selected filter again does not rebuild the list (same `<li>` nodes).
- A click writes `todoFilter`; mounting with a seeded `active` restores it; an invalid
  value or no value gives "All".
- Storage unavailable (default `about:blank` JSDOM) and `setItem` throwing: filters still
  work.
- Toggle under Active/Done hides the task and moves focus as above; delete under a filter
  focuses the right visible Delete button; add under Done is counted but hidden.
- Clicking a filter while editing saves the edit.

No tests for CSS appearance (jsdom does not apply styles); the pressed style is checked
in the manual test from the spec. `todo.js` tests are unchanged.
