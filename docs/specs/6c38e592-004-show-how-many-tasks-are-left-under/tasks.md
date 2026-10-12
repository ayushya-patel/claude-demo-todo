# Tasks — Show how many tasks are left

Derived from `plan.md` (approach A). Each task is atomic, independently reviewable, and
has one acceptance check.

**Conventions every task follows** (named once here so implementers do not each pick their own):
Plain ES modules (`"type": "module"`), 2-space indent, single quotes, semicolons, no
build step. Tests use `node:test` + `node:assert/strict` in `test/*.test.js`; DOM tests
use jsdom through the existing helpers in `test/app.test.js` (ADR 0001). No new
dependency, no network call, no change to `src/index.html` or `src/styles.css`.
Comments only where the logic is not obvious (the existing code has almost none).
Counter text is exactly `''` (no open task), `'1 task left'`, or `'<N> tasks left'`.
Run an `Accept:` from the repo root; the full `npm test` (100 % coverage) runs at verify.

Ids are `T<number>`, with an optional letter (`T9a`) for a follow-up found mid-build. The
ai-workflow task-pipeline scripts (`waves`, `brief`) read this format: keep `Files:`, `Accept:` and
`Depends on:` as written below, and `Files: none` for a task that touches no file.

- [x] **T1 —** Add the pure export `formatRemaining({ completed, total })` to `src/todo.js` (after `formatCount`, same argument shape as `countCompleted` returns): `remaining = total - completed`; return `''` when `remaining === 0`, `'1 task left'` when `1`, else `` `${remaining} tasks left` ``. Add one unit test in `test/todo.test.js` named `formatRemaining is empty with no open task, singular for 1, plural otherwise` covering 0 of 0 → `''`, 3 of 3 → `''`, 0 of 1 → `'1 task left'`, 0 of 2 → `'2 tasks left'`, 2 of 5 → `'3 tasks left'`. Leave `formatCount` in place
  - Files: `src/todo.js`, `test/todo.test.js`
  - Accept: `node -e "import('./src/todo.js').then(({formatRemaining:f})=>process.exit(f({completed:0,total:0})===''&&f({completed:3,total:3})===''&&f({completed:0,total:1})==='1 task left'&&f({completed:2,total:5})==='3 tasks left'?0:1))"`
- [x] **T2 —** Make `render()` in `src/app.js` write `formatRemaining(counts)` to `#todo-count` instead of `formatCount(counts)` (import `formatRemaining`; drop `formatCount` from the import), and update `test/app.test.js` so every `count.textContent` assertion expects the new text (`'0 of N completed'`-style strings become the tasks-left text for the same state; `'Y of Y completed'` and `'0 of 0 completed'` become `''`). Add DOM tests for the spec's Verification list not already covered: add to empty list → `'1 task left'`; a second add → `'2 tasks left'`; mark the only open task complete → `''` then mark it incomplete → `'1 task left'`; 5 tasks with 2 done → `'3 tasks left'`; deleting an open task decrements the count; deleting a done task leaves it unchanged. Keep each existing test's intent and name except where the name quotes the old text (rename those to the new text)
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `grep -q 'formatRemaining(counts)' src/app.js && node --test test/app.test.js`
  - Depends on: T1
- [x] **T3 —** Remove the now-unused `formatCount` export from `src/todo.js` and its import and test (`formatCount formats 0 of 0, 3 of 5 and Y of Y`) from `test/todo.test.js`
  - Files: `src/todo.js`, `test/todo.test.js`
  - Accept: `! grep -n 'formatCount' src/todo.js src/app.js test/todo.test.js && node --test test/todo.test.js`
  - Depends on: T2
- [x] **T4 —** In `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`, `/` route row, replace `` `X of Y completed` count `` with `` tasks-left count (`1 task left` / `N tasks left`, empty when no task is open; see [show how many tasks are left](../../6c38e592-004-show-how-many-tasks-are-left-under/spec.md)) ``; change nothing else
  - Files: `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`
  - Accept: `grep -q 'N tasks left' docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md && ! grep -q 'X of Y completed' docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`
- [x] **T5 —** In `docs/specs/971bd93b-improve-the-to-do-app-s-look/contracts/provides.md`, `/` route row, replace `` `X of Y completed` count `` with `` tasks-left count (`1 task left` / `N tasks left`, empty when no task is open) ``; change nothing else
  - Files: `docs/specs/971bd93b-improve-the-to-do-app-s-look/contracts/provides.md`
  - Accept: `grep -q 'N tasks left' docs/specs/971bd93b-improve-the-to-do-app-s-look/contracts/provides.md && ! grep -q 'X of Y completed' docs/specs/971bd93b-improve-the-to-do-app-s-look/contracts/provides.md`
- [x] **T6 —** Stop depending on 00000000's internal `render()` (spec-audit, guardian, verify round 1): in `docs/specs/6c38e592-004-show-how-many-tasks-are-left-under/contracts/requires.md`, Other modules row, change "The `/` screen's `#todo-count` element and the `render()` cycle that writes it." to "The `/` screen's `#todo-count` element, which is redrawn whenever the list changes."; in the same folder's `spec.md` `## Contracts` section only, change the **Requires** bullet to "the to-do screen and its counter line from 00000000; no upstream data." and the **Provides** bullet's "`#todo-count` now shows tasks left" to "the counter line now shows tasks left", and insert one blank line before `## Contracts`. Change nothing above `## Contracts` in `spec.md`
  - Files: `docs/specs/6c38e592-004-show-how-many-tasks-are-left-under/contracts/requires.md`, `docs/specs/6c38e592-004-show-how-many-tasks-are-left-under/spec.md`
  - Accept: `! grep -q 'render()' docs/specs/6c38e592-004-show-how-many-tasks-are-left-under/contracts/requires.md && ! sed -n '/^## Contracts/,$p' docs/specs/6c38e592-004-show-how-many-tasks-are-left-under/spec.md | grep -q 'render()\|#todo-count'`
- [x] **T7 —** Add a Consumed-by row for this change (spec-audit, verify round 1): in `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` → `## Consumed by` table, append the row `` | `6c38e592-004-show-how-many-tasks-are-left-under` | The `/` screen's `#todo-count` element | Shows the tasks-left count in it. | ``; change nothing else
  - Files: `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`
  - Accept: `grep -q '^| `6c38e592-004-show-how-many-tasks-are-left-under`' docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`
- [x] **T8 —** Rename the two DOM tests whose names still say "completed count" (spec-audit, verify round 1) in `test/app.test.js`: `deleting an open task removes it and keeps the completed count` → a name stating what it now asserts about the tasks-left count (read the test body), and `deleting a done task decrements the completed count` → likewise. Rename only; do not change test bodies
  - Files: `test/app.test.js`
  - Accept: `! grep -q 'completed count' test/app.test.js && node --test test/app.test.js`

Outcome coverage: counter under the list showing open tasks → T1, T2; updates on
add/complete/incomplete/delete → T2; singular/plural → T1, T2; hidden when no open task →
T1, T2. Contract docs kept true → T4, T5; orphan removed → T3.

## Done when

All tasks above checked, the definition of done (ai-workflow plugin `law/definition-of-done.md`) satisfied, and `## How it
works` appended to `spec.md` via `/ai-workflow:flow`.

## Deferred

None.
