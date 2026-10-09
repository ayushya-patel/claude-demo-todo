# Plan — Add a footer showing open to-do count

Derived from `spec.md`. This is where implementation details are allowed.

> Note for the reviewer: the ticket title is "[W1] stop restores column", but the
> approved spec (commit `d008593`) describes a footer with the open to-do count. This
> plan follows the approved spec's content, not the title. If the title is the real
> intent, request changes and the spec needs re-approval first.

## Context found in the code

- `src/todo.js` holds pure task-list functions; a task is `{ id, text, done }`. The
  spec's "to-dos with `completed: false`" maps to `done === false` here (the spec's
  field name is descriptive; there is no `completed` field on a task).
- `src/app.js` → `mount(document)` keeps the task array in a closure and calls one
  `render()` after every add, toggle and delete. `render()` already updates the
  existing `#todo-count` paragraph (`"X of Y completed"`, `aria-live="polite"`).
- `src/index.html` has one `<main>` column; `src/styles.css` defines colour variables
  (`--color-muted`, `--color-border`, …).
- `npm test` runs the Node test runner with 100 % line/branch/function coverage over
  `src/**/*.js`; DOM behaviour is tested in jsdom (ADR 0001). It passes on the branch
  base (42 tests).

Because every state change already goes through `render()`, "updates in real time"
needs no new event wiring: the footer is written in `render()` next to the existing
count.

## Approaches considered

### A. New pure `countOpen` + `formatOpen` in `todo.js`, footer rendered in `render()` (recommended)

Add `countOpen(tasks)` (number of tasks with `done === false`) and
`formatOpen(count)` (`"{count} left"`) to `src/todo.js`. Add
`<footer id="todo-footer">` as the last child of `<main>` in `src/index.html`.
`render()` in `src/app.js` sets its `textContent` to
`formatOpen(countOpen(tasks))`. The existing `#todo-count` line is left untouched.

- For: follows the existing split exactly (logic + formatting in `todo.js`, DOM in
  `app.js`, mirroring `countCompleted` / `formatCount`); the new logic is unit-testable
  without a DOM; one extra line in `render()`.
- Against: two small new exports.

### B. Derive the open count from the existing `countCompleted` in `app.js`

No change to `todo.js`; `render()` computes `total - completed` from
`countCompleted(tasks)` and formats `"… left"` inline.

- For: smallest diff (HTML, CSS and one line of `app.js`).
- Against: puts counting/formatting logic in the DOM layer, which the spec's
  constraint ("todo.js for logic, app.js for DOM wiring") and the existing pattern
  argue against; the format string is only testable through jsdom.

### C. Replace the existing `#todo-count` paragraph with the footer

Turn the current `"X of Y completed"` line into the footer and change its text to
`"{count} left"`.

- For: one count on screen instead of two.
- Against: removes existing behaviour and breaks the existing count tests; the spec's
  Out of scope excludes changes to the main to-do list display and asks only for a
  footer to be added. Would need a spec change.

**This plan follows approach A.** Approving the plan picks A; request changes to pick
B or C instead.

## Approach

Approach A. The open count is derived from the in-memory task list on every render,
never stored, so it cannot drift from the list (same as the completed count). The
footer is a plain `<footer>` element at the bottom of `<main>`, so it sits in the same
column under the list and the existing count. Styling is minimal: smaller font and the
existing `--color-muted` variable, a top margin to separate it; no new colours.

No ADR: nothing here is expensive to reverse, and no dependency is added.

### `todo.js` additions (internal to this module)

| Export | Behaviour |
|---|---|
| `countOpen(tasks)` | Number of tasks with `done === false` (`0` for an empty list). |
| `formatOpen(count)` | `"{count} left"`, e.g. `"0 left"`, `"3 left"`. |

### `app.js` change

`mount` looks up `#todo-footer` alongside the other elements; `render()` sets
`footer.textContent = formatOpen(countOpen(tasks))`. Because `mount` calls `render()`
once at start-up, the footer shows `"0 left"` at page load.

## Touched surface

| Path | Change |
|---|---|
| `src/todo.js` | modified — add `countOpen`, `formatOpen` |
| `src/app.js` | modified — look up `#todo-footer`, write it in `render()` |
| `src/index.html` | modified — add `<footer id="todo-footer">` as last child of `<main>` |
| `src/styles.css` | modified — minimal `#todo-footer` rule (small, muted) |
| `test/todo.test.js` | modified — unit tests for `countOpen`, `formatOpen` |
| `test/app.test.js` | modified — jsdom tests for the footer |
| `docs/specs/3e96a438-w1-stop-restores-column/spec.md` | modified — `## How it works` after the build (Constitution VI); `## Contracts` pointer (this commit) |
| `docs/specs/3e96a438-w1-stop-restores-column/contracts/*` | new — this plan's contracts |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | modified — **Consumed by** gains this module, and the screen description mentions the footer |

## Data

| Data | Owner | Shape | Boundary |
|---|---|---|---|
| Task list | Client state inside `mount`'s closure (unchanged, owned by the to-do app module) | array of `{ id, text, done }` | Unchanged. |
| Open count | Derived from the task list on every render | number | Never stored; rendered with `textContent`. |

Nothing is persisted.

## Consumed contracts

None from upstream systems: no network calls, no environment variables.

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| — | — | — | — |

## Entry points

| Entry point | Runs | Behaviour on failure |
|---|---|---|
| `src/index.html` (the existing single screen) | Client-side only | No async work, so no loading or error state. The footer always has a value (`"0 left"` minimum). |

## Accessibility

- `<footer>` is a landmark-capable element with visible text; no controls are added, so
  there is nothing new to focus.
- The footer is **not** an `aria-live` region: the existing `#todo-count` is already
  live and announces every change, and a second live region would announce each
  change twice.
- Text colour `--color-muted` (`#6a737d`) on `--color-bg` (`#f7f7f9`) is about
  4.5:1, already used for done tasks.

## Risks

| Risk | Mitigation |
|---|---|
| A future state change bypasses `render()` and the footer goes stale | All current mutations call `render()`; jsdom tests cover add, toggle on/off and delete for the footer. |
| Spec field name (`completed`) differs from the code (`done`) | Plan states the mapping; tests assert behaviour, not field names. |
| Ticket title does not match the spec content | Flagged at the top of this plan for the reviewer. |

## Test strategy

- **Unit (`test/todo.test.js`)**: `countOpen` for empty list, all open, all done,
  mixed; `formatOpen(0)` → `"0 left"`, `formatOpen(3)` → `"3 left"`.
- **Integration (`test/app.test.js`)**: footer element present after mount with
  `"0 left"`; add → count up; check → down; uncheck → up; delete an open task → down;
  delete a done task → unchanged; all complete → `"0 left"`; footer is inside `<main>`
  after the list.
- Coverage stays at 100 % (the `npm test` thresholds enforce it).
- Deliberately not tested: visual size/appearance and absence of console errors in a
  real browser (manual check from the spec's Verification). The config has no `"e2e"`.
