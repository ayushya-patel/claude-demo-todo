# Plan — Show item count in the page title

Derived from `spec.md`. This is where implementation details are allowed.

This is a change to the shipped to-do app (`docs/specs/00000000-build-a-basic-to-do-app`).
It edits that module's files in place; it adds no new module, screen or dependency.
`npm test` passes on the branch head before any change (42 tests, 100 % coverage).

## Approaches considered

All three set `document.title` to `To-do (N)`, N = number of tasks whose `done` is
`false`, from the same task list the page already re-renders from.

### A. Pure `countOpen` in `todo.js`, title set in `render()` (recommended)

Add `countOpen(tasks)` to `src/todo.js` (returns the number of tasks with `done ===
false`). In `src/app.js`, `render()` — which already runs on mount and after every add,
toggle and delete — also sets `document.title = \`To-do (${countOpen(tasks)})\``. In the
submit handler, call `render()` before clearing the input, so the title updates before
the input clears (spec edge case).

- For: follows the existing pattern exactly (pure count in `todo.js`, DOM writes in
  `render()`), so the title is derived from the list on every change and cannot drift;
  matches the spec's Verification (`countOpen()` unit test, `render()` integration
  test); about five lines of production code.
- Against: the title text is formatted in `app.js` rather than in a pure helper; it is
  one template literal with one caller, so a helper would be an abstraction for one use.

### B. Derive N from the existing `countCompleted` (`total - completed`)

No new `todo.js` export; `render()` computes `total - completed` from
`countCompleted(tasks)`.

- For: no new function.
- Against: the spec's Verification names a unit-tested `countOpen()`; the subtraction
  is an arithmetic step that lives in DOM code, untested on its own.

### C. Title updated in each event handler (incremental counter)

Keep an `openCount` variable and adjust it by ±1 in the submit, change and click
handlers, mirroring the spec's Behaviour bullets literally.

- For: maps one-to-one onto the Behaviour list.
- Against: a second, stored count that can drift from the list (for example on a
  rejected blank add or an unknown id); the app deliberately never stores counts
  (see the to-do app's `plan.md` → Data). Rejected.

**This plan follows approach A.** Approving the plan picks A; request changes to pick
B or C instead.

## Approach

Approach A.

- `src/todo.js`: new export `countOpen(tasks)` → `tasks.filter((task) => !task.done).length`.
  Pure, no mutation, `0` for an empty list.
- `src/app.js`: import `countOpen`; at the end of `render()` set
  `document.title = \`To-do (${countOpen(tasks)})\``. `document` is the one already
  passed to `mount(document)`, so tests drive it through jsdom.
- Submit handler order becomes `tasks = addTask(...)`, `render()`, `input.value = ''`
  (currently the input is cleared before `render()`). Nothing else in `render()` reads
  the input, so the visible result is unchanged; only the ordering the spec asks for is
  added. Blank input is still rejected and still cleared.
- The static `<title>To-do</title>` in `src/index.html` is left alone: `mount` calls
  `render()` immediately, so the title reads `To-do (0)` as soon as the script runs.
  The heading, the `X of Y completed` line and every other element are unchanged (spec
  Out of scope).

No ADR: nothing here is expensive to reverse — no dependency, no data boundary, no
persisted state.

## Touched surface

| Path | Change |
|---|---|
| `src/todo.js` | modified — add `countOpen(tasks)` |
| `src/app.js` | modified — `render()` sets `document.title`; submit handler renders before clearing the input |
| `test/todo.test.js` | modified — unit tests for `countOpen` |
| `test/app.test.js` | modified — integration tests for the title |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | modified — the to-do screen's title now carries the open count |
| `docs/specs/17ad0a1b-a7-show-item-count-in-the-page-title/spec.md` | modified — `## Contracts` summary now; `## How it works` at ship time |
| `docs/specs/17ad0a1b-a7-show-item-count-in-the-page-title/contracts/*` | new — this change's contracts |

## Data

| Data | Owner | Shape | Boundary |
|---|---|---|---|
| Task list | Client state in `mount`'s closure (unchanged) | array of `{ id, text, done }` | unchanged |
| Open count | Derived from the task list on every `render()` | number | Never stored, so it cannot drift from the list. |
| Page title | The browser document, written only by `render()` | string `To-do (N)` | Contains only the fixed text and a number — no user text, so nothing to escape. |

## Consumed contracts

None. No upstream system, network call or environment variable.

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| — | — | — | — |

## Entry points

| Entry point | Change | Behaviour on failure |
|---|---|---|
| `src/index.html` (the one screen) | Tab title becomes `To-do (N)` once the script runs, and after every add, toggle and delete | No async work and no new input; no new failure path. |

## Risks

| Risk | Mitigation |
|---|---|
| Reordering the submit handler changes existing add behaviour | Existing add / blank-input / Add-button tests stay green unmodified; a new test pins the order. |
| The title updates on some paths but not others | `render()` is the single place the DOM is updated after every change; integration tests cover mount, add, toggle on/off, delete open, delete done, delete all. |
| Coverage drops below the 100 % gate | Every new line and branch is covered by the tests below. |

## Test strategy

- **Unit (`test/todo.test.js`)**: `countOpen` is `0` for an empty list; counts follow
  add, toggle on/off and remove (open and done); `0` when every task is done; does not
  mutate its input.
- **Integration (`test/app.test.js`)**, through jsdom and real events:
  - mount → `document.title` is `To-do (0)`;
  - add → `To-do (1)`, `To-do (2)`; blank add leaves it unchanged;
  - toggle done → decrements; toggle back → increments; all done → `To-do (0)`;
  - delete an open task → decrements; delete a done task → unchanged; delete all →
    `To-do (0)`;
  - title updates before the input clears: the test wraps the document's `title`
    setter to record `input.value` at the moment of the write, and asserts the
    submitted text was still in the input.
- Existing tests are not modified (spec Constraint: must not break existing tests).
- Not automated: the real browser tab (the spec's manual check). The config has no
  `"e2e"`.
