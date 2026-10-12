# Plan — Show how many tasks are left

Derived from `spec.md`. This is where implementation details are allowed.

This changes the shipped to-do app ([00000000](../00000000-build-a-basic-to-do-app/spec.md)).
`#todo-count` already exists and `render()` in `src/app.js` already writes it after
every add, toggle and delete. Today it reads `X of Y completed` (from
`formatCount(countCompleted(tasks))`); this change makes it read `1 task left` /
`N tasks left`, or nothing when no task is open. No markup, style or dependency
changes; `npm test` (100 % line, branch and function coverage of `src/**/*.js`) stays
the check.

**Behaviour change to note:** the `X of Y completed` text goes away. The spec fixes
`#todo-count` as the counter and forbids HTML changes, so there is no second element
for the old text. The decorative ring (`completed/total`, `aria-hidden`) still shows
progress visually; screen readers hear the tasks-left text through the existing
`aria-live="polite"` on `#todo-count`.

## Approaches considered

All three keep: one derivation of state (the count is computed from `tasks` on every
`render()`, never stored), the existing `render()` as the only writer of
`#todo-count`, and "hidden" meaning `textContent === ''` as the spec says.

### A. Replace `formatCount` with a pure `formatRemaining` in `todo.js` (recommended)

`src/todo.js` gets `formatRemaining({ completed, total })`, taking the same shape
`countCompleted` returns (as `formatCount` and `progress` do). It computes
`remaining = total - completed` and returns `''` when `remaining === 0`,
`'1 task left'` when `1`, else `` `${remaining} tasks left` ``. `render()` calls
`count.textContent = formatRemaining(counts)`. `formatCount` loses its only caller and
is removed with its unit test (Discipline §4: remove what your change orphaned).

- **Right design:** the wording lives with the other pure derivations in `todo.js`,
  unit-testable without a DOM; `render()` stays a thin wiring layer; one
  `countCompleted` call feeds count, ring label and ring progress.
- **Cost:** one new function (~6 lines) replacing one, one line in `app.js`, test
  updates.

### B. Change `formatCount`'s body in place

Same output as A, but keep the name `formatCount`.

- **Right design:** no — the name no longer says what it does next to a separate
  `countCompleted`, and its old unit test silently changes meaning.
- **Cost:** smallest diff (function body only, plus tests).

### C. Compute the text inline in `render()`

`render()` filters `tasks` for `!done` and builds the string itself.

- **Right design:** no — puts wording logic in the DOM layer (against the
  `todo.js`/`app.js` split the module has used since 00000000), adds a second count
  derivation next to `countCompleted`, and pluralisation can only be tested through
  jsdom.
- **Cost:** a few lines in `app.js`; `formatCount` still orphaned and removed.

**This plan follows A.**

### Hiding: empty text, not the `hidden` attribute

The spec defines hidden as an empty string. Setting the `hidden` attribute as well
would drop the paragraph's margin, but un-hiding a live region and filling it in the
same tick is not reliably announced by screen readers (the "add a task to an empty
list → 1 task left" case would go silent). So `#todo-count` stays in the tree with
empty text; its 1.1rem top margin stays, which the spec's "no styling changes" accepts.

## Touched surface

| Path | Change |
|---|---|
| `src/todo.js` | modified — add `formatRemaining`, remove `formatCount` |
| `src/app.js` | modified — import and call `formatRemaining` instead of `formatCount` |
| `test/todo.test.js` | modified — replace the `formatCount` test with `formatRemaining` cases |
| `test/app.test.js` | modified — every `#todo-count` assertion moves to the new text; new cases for the spec's edge-case table and the toggle back to incomplete |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | modified — `/` row: `X of Y completed` count → tasks-left count |
| `docs/specs/971bd93b-improve-the-to-do-app-s-look/contracts/provides.md` | modified — same phrase in its `/` row |
| `docs/specs/6c38e592-004-show-how-many-tasks-are-left-under/` | `plan.md`, `contracts/`, `## Contracts` in `spec.md` (this commit) |

Not touched: `src/index.html`, `src/styles.css` (spec: out of scope). Older specs,
plans and verify reports that quote `X of Y completed` are historical records and stay.

## Data

Client state only: the in-memory `tasks` array in `mount`'s closure, owned by
`src/app.js`. The counter text is derived from it on every `render()`; nothing is
stored or sent anywhere. No viewer receives data beyond their own page.

## Consumed contracts

None. The app reads no upstream system.

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| — | — | — | — |

## Entry points

The `/` screen (static `src/index.html`). All client-side. `render()` already runs
after add (form `submit`), toggle (list `change`) and delete (list `click`) and at
mount, so the counter updates in each of those without new wiring. Finishing an edit
redraws only its row and leaves `#todo-count` untouched (existing behaviour and test);
editing text cannot change the number of open tasks, so that stays correct.

## Risks

| Risk | Mitigation |
|---|---|
| Screen-reader users lose the spoken "X of Y completed" | The spec chose this text; tasks-left is still announced via `aria-live`. Called out above so the plan reviewer sees it. |
| A stale assertion on the old text survives somewhere | Every `count.textContent` assertion in `test/app.test.js` is updated in one task; `grep -n "completed'" test/` must find none for the count. |
| Empty paragraph leaves a 1.1rem gap under the list | Accepted: spec forbids styling changes. |

## Test strategy

- **Unit (`test/todo.test.js`):** `formatRemaining` for 0 of 0 → `''`, 3 of 3 → `''`,
  0 of 1 → `'1 task left'`, 2 of 5 → `'3 tasks left'`, 0 of 2 → `'2 tasks left'`
  (smallest plural).
- **DOM (`test/app.test.js`, jsdom per ADR 0001):** initial mount → `''`; add to empty
  → `'1 task left'`; add a second → `'2 tasks left'`; mark the only open task complete
  → `''`; mark it incomplete again → `'1 task left'`; delete an open task updates the
  count; delete a done task leaves it; delete all → `''`; 5 tasks / 2 done →
  `'3 tasks left'`. Existing tests keep their intent with the new expected strings.
- No browser step: `.claude/ai-workflow.json` has no `"e2e"`.
- Coverage stays 100 % lines/branches/functions; all three branches of
  `formatRemaining` are hit by the unit tests.

## ADRs

None. Nothing here is expensive to reverse (no dependency, data boundary, caching or
auth choice).
