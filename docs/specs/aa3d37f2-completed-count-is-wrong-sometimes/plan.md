# Plan — Fix completed count after deleting done tasks

Derived from `spec.md`. This is where implementation details are allowed.

This is a change to the shipped to-do app (`docs/specs/00000000-build-a-basic-to-do-app`).
It follows **Approach A** below.

## What the code does today (investigation)

The planning session checked the current base branch (`dev` @ `d765ae8`) before proposing a fix:

- `src/app.js` keeps `tasks` as the single source of truth. Every change (add, toggle,
  delete) replaces the array through a pure function in `src/todo.js` and then calls
  `render()`. `render()` rebuilds the list and sets `#todo-count` to
  `formatCount(countCompleted(tasks))`. The count is never kept as a separate running
  number, so it cannot drift away from the list.
- `removeTask` filters by `id`, and `countCompleted` counts `done` over the array it is
  given. Ids come from a module-level counter, so they are unique even after deletes.
- `npm test` passes on the base branch (42 tests, 100 % line, branch and function
  coverage). Existing tests already cover "delete the only done task → 0 of 0" and
  "5 added, 3 done, delete one done → 2 of 4".
- A jsdom script ran every scenario in the spec's Verification and Edge cases sections
  (by clicking the checkbox, and by clicking the label text). All of them gave the
  expected count: `2 of 4`, `2 of 2`, `0 of 1`, `0 of 0`, `0 of 2`, `2 of 2`, `1 of 2`.

**The reported wrong count does not happen in the current code.** The bug was most likely
fixed while the app was being built (the first build added the "deleting a done task
decrements the completed count" test), or the report came from an older or cached copy
of the page. What still has to be done is the spec's third Outcome: regression tests that
lock in the correct behaviour for every case the spec lists.

## Approaches considered

### A. Regression tests only; change production code only if a test fails (recommended)

Add tests for every Verification scenario and Edge case in the spec that the current
tests do not already cover. Use both input paths (checkbox click and label click) and
the "rapid deletion of several done tasks" case. If any new test fails while it is being
written, the task fixes `src/app.js` / `src/todo.js` as little as possible to make it pass.
If every test passes, no production code changes.

- For: meets all three Outcomes and does not touch code that already works. The tests
  guard against the bug coming back. Fits the spec's Out of scope (no change to the
  wording, to when the count updates, or to how tasks are stored).
- Against: the pull request may be tests only, which can look like "nothing was fixed".
  This plan explains why (see the investigation above).

### B. Defensive refactor: compute the count from the rendered DOM

Make `render()` count the `li` items and the checked checkboxes on the page, instead of
reading the `tasks` array.

- For: what the count says always matches what the screen shows.
- Against: it goes against Behaviour step 2 of the spec (`countCompleted(tasks)` on the
  updated array). It gives the app two sources of truth and fixes no failure anyone can
  reproduce. Rejected.

### C. Hand the ticket back as "cannot reproduce"

- For: no work done on a bug that does not exist.
- Against: the spec still asks for a regression test (Outcome 3), and that is cheap and
  useful. Rejected. A reviewer who wants this outcome instead can choose **Request changes**.

## Approach

Approach A. Add the missing regression tests to `test/app.test.js` (DOM level, through
`mount` in jsdom, as ADR 0001 says) and one unit test in `test/todo.test.js`
(`countCompleted` after `removeTask` of done tasks). The tests use the spec's exact
strings. If a new test fails, the smallest fix goes in `src/app.js` or `src/todo.js`, and
the 100 % coverage gate must still pass. No ADR is needed: nothing in this change is
expensive to reverse.

## Touched surface

| Path | Change |
|---|---|
| `test/app.test.js` | modified: new regression tests for delete and count |
| `test/todo.test.js` | modified: one unit test for `countCompleted` after removing done tasks |
| `src/app.js`, `src/todo.js` | modified **only if** a new test fails; otherwise unchanged |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | unchanged: the public boundary (the static page) does not change |

## Data

No change. The task list stays in memory in `src/app.js` (`tasks`, an array of
`{ id, text, done }`) and nothing persists it. The count is always worked out from that
array.

## Consumed contracts

None. The app reads no upstream system.

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| — | — | — | — |

## Contracts

This change keeps the to-do app's public boundary as it is: the static page served from
`src/`. See `./contracts/provides.md` and `./contracts/requires.md`. Both point to the
shipped module's contracts, which do not change. (This summary is written here and not
in `spec.md`, because the spec stays exactly as it was approved.)

## Entry points

No new entry points. The Delete click handler on `#todo-list` in `src/app.js` and
`render()` are what the tests exercise. Everything runs client-side.

## Risks

| Risk | Mitigation |
|---|---|
| The real-world bug follows a path the tests do not cover (for example, a double-click on Delete deletes a second task, because that task's button moves under the pointer and takes focus) | The tests cover every scenario in the spec. A double-click deleting two tasks is a different issue: the count would still be right for the list that is left. If the reviewer sees it as the cause, it needs its own ticket, because it changes delete behaviour, which this spec does not cover. |
| The repo has no automated browser checks (`"e2e"` is not set in `.claude/ai-workflow.json`) | jsdom integration tests cover the DOM. The verify report records the spec's "test in a browser" step as a manual check (`npm start`, then the three Verification scenarios). |
| A new test duplicates an existing one | Only the scenarios that are missing get new tests. The two that already exist ("1 done, delete → 0 of 0" and "5/3, delete done → 2 of 4") are reused, not copied. |

## Test strategy

`npm test` (Node test runner, 100 % line, branch and function coverage on `src/**`).
New tests in `test/app.test.js`, each asserting the `#todo-count` text after every delete:

- 3 added, all done, delete one → `2 of 2 completed`
- 2 added, 1 done, delete the done one → `0 of 1 completed`
- Some done and some open remain, delete a done one → correct done count and total
- Delete an open task while others are done → done count stays the same, total goes down
- Delete the last done task, leaving only open tasks → `0 of N completed`
- Delete several done tasks in a row → count is right after **each** delete
- The same "delete a done task" case with the task marked done through its label text
  instead of the checkbox

Plus one unit test in `test/todo.test.js`: removing done tasks one at a time gives the
right `countCompleted` after each removal, down to `{ completed: 0, total: N }`.

Not tested: count wording or format (out of scope) and real-browser rendering (no
`"e2e"`; done as a manual check).
