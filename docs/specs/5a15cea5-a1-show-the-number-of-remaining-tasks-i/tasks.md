# Tasks — Show the number of remaining tasks in the page title

Derived from `plan.md` (approach A: pure `formatTitle` in `src/todo.js`, assigned to
`document.title` in `render()`). Each task is atomic, independently reviewable, and has
one acceptance check.

**Conventions every task follows** (named once here so implementers do not each pick their own):
Vanilla JavaScript ES modules (`"type": "module"`, `import`/`export`, no CommonJS, no
globals), 2-space indentation, semicolons, single quotes, named exports only. Tests use
the Node built-in runner (`node:test` + `node:assert/strict`) and live in `test/` as
`<name>.test.js`; DOM tests use the existing `jsdom` devDependency and the `setup()`
helper in `test/app.test.js`. No task may add a dependency, a network call or
`innerHTML`; `src/index.html` is not changed, and nothing under
`docs/specs/00000000-build-a-basic-to-do-app/` is edited. Title strings are exactly
`(N) To-do` and `To-do - all done` (ASCII hyphen-minus). `npm test` enforces 100 % line,
branch and function coverage of `src/**/*.js`. Comments only where the logic is not
self-evident; no `console.log`. Run every `Accept:` from the repo root (`/workspace/repo`).

Ids are `T<number>`, with an optional letter (`T9a`) for a follow-up found mid-build. The
ai-workflow task-pipeline scripts (`waves`, `brief`) read this format: keep `Files:`, `Accept:` and
`Depends on:` as written below, and `Files: none` for a task that touches no file.

- [x] **T1 —** Add the exported pure function `formatTitle({ completed, total })` to `src/todo.js` (next to `formatCount`): `remaining = total - completed`; return `` `(${remaining}) To-do` `` when `remaining > 0`, else `'To-do - all done'`; with unit tests in `test/todo.test.js` for `{0,0}` → `To-do - all done`, `{0,1}` → `(1) To-do`, `{1,3}` → `(2) To-do`, `{2,2}` → `To-do - all done`
  - Files: `src/todo.js`, `test/todo.test.js`
  - Accept: `node --input-type=module -e "import { formatTitle } from './src/todo.js'; const ok = formatTitle({ completed: 0, total: 0 }) === 'To-do - all done' && formatTitle({ completed: 1, total: 3 }) === '(2) To-do' && formatTitle({ completed: 2, total: 2 }) === 'To-do - all done'; process.exit(ok ? 0 : 1);" && node --test test/todo.test.js`
- [x] **T2 —** In `render()` in `src/app.js`, compute `countCompleted(tasks)` once, pass it to `formatCount` for the count line, and assign `formatTitle(counts)` to `document.title` (import `formatTitle` from `./todo.js`), exactly as in plan.md → `app.js` change
  - Files: `src/app.js`
  - Accept: `node --input-type=module -e "import { readFileSync } from 'node:fs'; import { JSDOM } from 'jsdom'; import { mount } from './src/app.js'; const dom = new JSDOM(readFileSync('src/index.html', 'utf8')); const d = dom.window.document; mount(d); const t0 = d.title; d.getElementById('todo-input').value = 'a'; d.getElementById('todo-form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); process.exit(t0 === 'To-do - all done' && d.title === '(1) To-do' ? 0 : 1);"`
  - Depends on: T1
- [x] **T3 —** Add jsdom tests to `test/app.test.js` asserting `document.title` through real events, following the spec's Verification sequence: on mount `To-do - all done`; add → `(1) To-do`; add → `(2) To-do`; tick one → `(1) To-do`; untick → `(2) To-do`; delete one → `(1) To-do`; tick the rest → `To-do - all done`; delete all → `To-do - all done`; plus a separate test: with one done and one open task, deleting the open one → `To-do - all done`
  - Files: `test/app.test.js`
  - Accept: `grep -q "(2) To-do" test/app.test.js && grep -q "To-do - all done" test/app.test.js && node --test test/app.test.js`
  - Depends on: T2
- [x] **T4 —** Append a `## How it works` section to the end of this ticket's `spec.md` describing the shipped title behaviour (derived from the task list on every render, never stored; the two title forms; the static `<title>To-do</title>` is replaced on the first render), per `/workspace/ai-workflow/skills/flow/SKILL.md`, noting any divergence from plan.md in one line each; do not change any other part of `spec.md`
  - Files: `docs/specs/5a15cea5-a1-show-the-number-of-remaining-tasks-i/spec.md`
  - Accept: `grep -q "^## How it works" docs/specs/5a15cea5-a1-show-the-number-of-remaining-tasks-i/spec.md`
  - Depends on: T3
- [x] **T4a —** Rewrite the `## How it works` section of this ticket's `spec.md` (only that section, which is the last one) so it names no file paths, file names, HTML tags, library names or function names (Constitution Article II; found by the guardian in verify round 1): e.g. "the page's fixed title is replaced on the first draw", "a small formatting step called from the redraw"; keep the same behaviour description and the one-line divergence note; do not touch anything above `## How it works`
  - Files: `docs/specs/5a15cea5-a1-show-the-number-of-remaining-tasks-i/spec.md`
  - Accept: `grep -q "^## How it works" docs/specs/5a15cea5-a1-show-the-number-of-remaining-tasks-i/spec.md && ! sed -n '/^## How it works/,$p' docs/specs/5a15cea5-a1-show-the-number-of-remaining-tasks-i/spec.md | grep -Eq '\.js|\.html|<title>|src/|\(\)'`
  - Depends on: T4

## Outcome coverage

| Spec outcome | Task(s) |
|---|---|
| The page title updates dynamically to show the count of incomplete tasks | T2, T3 |
| When tasks remain, the title reads "(N) To-do" | T1, T3 |
| When all tasks are complete, the title reads "To-do - all done" | T1, T3 |
| The title updates on add, tick, untick and delete | T2, T3 |

## Done when

All tasks above checked, the definition of done (ai-workflow plugin `law/definition-of-done.md`) satisfied, and `## How it
works` appended to `spec.md` via `/ai-workflow:flow`.

## Deferred

None.
