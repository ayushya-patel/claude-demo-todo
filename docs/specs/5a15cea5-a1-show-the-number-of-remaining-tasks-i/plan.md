# Plan — Show the number of remaining tasks in the page title

Derived from `spec.md`. This is where implementation details are allowed.

## Context

The to-do app (spec `00000000-build-a-basic-to-do-app`) already re-renders the list
and the `X of Y completed` line from the in-memory task array in `render()` inside
`mount(document)` (`src/app.js`). `render()` runs once on mount and after every add,
toggle and delete, so it is the single place the title must be set. `src/todo.js`
already has `countCompleted(tasks)` → `{ completed, total }` and the formatter
`formatCount({ completed, total })`; this plan reuses that pattern. `src/index.html`
keeps its static `<title>To-do</title>` (spec Out of scope: no title element
changes); the first `render()` on mount replaces it with `To-do - all done`.

`npm test` enforces 100 % line, branch and function coverage of `src/**/*.js`, so the
`remaining > 0` / `remaining = 0` branch must be covered by tests.

## Approaches considered

### A. Pure formatter in `todo.js`, set in `render()` (recommended)

Add `formatTitle({ completed, total })` to `src/todo.js` next to `formatCount`: it
computes `remaining = total - completed` and returns `"(N) To-do"` when
`remaining > 0`, else `"To-do - all done"`. In `render()`, compute
`countCompleted(tasks)` once and pass it to both `formatCount` and `formatTitle`,
assigning the latter to `document.title` (the `document` that `mount` receives).

- For: follows the existing `countCompleted` → `formatCount` pattern exactly; the
  string rule is unit-tested without a DOM; `render()` grows by one line; the title
  can never drift from the list because it is derived on every render, like the count.
- Against: one more export in `todo.js` (internal to the module, only tests import it).

### B. Inline in `render()`

Compute `remaining` and the title string directly inside `render()` in `src/app.js`.

- For: smallest diff (no new export).
- Against: the formatting rule (and its branch) is only testable through jsdom;
  breaks the split the app already has (logic in `todo.js`, DOM wiring in `app.js`).

### C. Separate title updater observing the list

A new `src/title.js` that watches the list element (e.g. `MutationObserver`) or is
called from each event handler, and updates `document.title`.

- For: keeps `render()` untouched.
- Against: a second way to react to state changes; an observer runs asynchronously
  and reads the DOM instead of the state, and calling it from each handler duplicates
  what `render()` already centralises. More code for no gain.

**This plan follows approach A.** Approving the plan picks A; request changes to pick
B or C instead.

## Approach

Approach A. `formatTitle` is a pure function over the same `{ completed, total }`
value `countCompleted` returns; `render()` calls `countCompleted` once and uses the
result for both the count line and `document.title`. No new state is stored. No
dependency is added and nothing is expensive to reverse, so no ADR.

### `todo.js` addition (internal to the module)

| Export | Behaviour |
|---|---|
| `formatTitle({ completed, total })` | `remaining = total - completed`; `remaining > 0` → `` `(${remaining}) To-do` ``; otherwise `"To-do - all done"` (covers the empty list). |

### `app.js` change

```js
function render() {
  list.replaceChildren(...tasks.map(renderTask));
  const counts = countCompleted(tasks);
  count.textContent = formatCount(counts);
  document.title = formatTitle(counts);
}
```

## Touched surface

| Path | Change |
|---|---|
| `src/todo.js` | modified — add `formatTitle` |
| `src/app.js` | modified — `render()` sets `document.title`; import `formatTitle` |
| `test/todo.test.js` | modified — unit tests for `formatTitle` |
| `test/app.test.js` | modified — jsdom tests for the title after mount, add, toggle, untick, delete |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | modified — the screen's title now reflects remaining tasks |
| `docs/specs/5a15cea5-a1-show-the-number-of-remaining-tasks-i/contracts/*` | new — this plan's contracts |
| `docs/specs/5a15cea5-a1-show-the-number-of-remaining-tasks-i/spec.md` | modified — `## Contracts` summary (and `## How it works` when shipped) |

`src/index.html` is not changed.

## Data

| Data | Owner | Shape | Boundary |
|---|---|---|---|
| Task list | Client state in `mount`'s closure (unchanged, owned by the to-do app) | array of `{ id, text, done }` | Unchanged. |
| Remaining count / page title | Derived from the task list on every `render()` | string | Never stored, so it cannot drift from the list. Task text never enters the title, so no user input reaches it. |

## Consumed contracts

None. No upstream system, network call or environment variable.

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| — | — | — | — |

## Entry points

| Entry point | Runs | Behaviour on failure |
|---|---|---|
| `src/index.html` (the to-do screen) | Client-side only | No new failure path: the title is a synchronous string assignment from in-memory state. |

## Accessibility

The browser tab title is announced by screen readers when the tab is focused. The
in-page `aria-live` count line is unchanged, so in-page announcements stay as they are.

## Risks

| Risk | Mitigation |
|---|---|
| A future code path changes `tasks` without calling `render()` and the title goes stale | Unchanged invariant: every handler already ends in `render()`; the jsdom tests assert the title after each action. |
| Title wording drifts from the spec (e.g. hyphen vs en dash in "To-do - all done") | Tests assert the exact strings from the spec (ASCII hyphen-minus). |
| Existing count tests break | `formatCount` output and the count element are untouched; only an extra assignment is added. |

## Test strategy

- **Unit (`test/todo.test.js`)**: `formatTitle` for `{0,0}` → `To-do - all done`,
  `{0,1}` → `(1) To-do`, `{1,3}` → `(2) To-do`, `{2,2}` → `To-do - all done`.
- **Integration (`test/app.test.js`)**: the spec's Verification sequence driven
  through real events in jsdom, asserting `document.title`: on mount `To-do - all
  done`; add → `(1) To-do`; add → `(2) To-do`; tick → `(1) To-do`; untick →
  `(2) To-do`; delete → `(1) To-do`; tick the rest → `To-do - all done`; delete all →
  `To-do - all done`. Also: deleting the last open task while a done one remains →
  `To-do - all done`.
- 100 % coverage of `src/**/*.js` stays enforced by `npm test`.
- No end-to-end browser suite: the config has no `"e2e"`.
