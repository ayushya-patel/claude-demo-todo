# Tasks — Edit a task

Derived from `plan.md` (approach A: edit state in `mount`'s closure, rendered from
state). Each task is atomic, independently reviewable, and has one acceptance check.

**Conventions every task follows** (named once here so implementers do not each pick their own):
Vanilla JavaScript ES modules (`import`/`export`, named exports only, no globals),
2-space indentation, semicolons, single quotes — match the existing `src/app.js` and
`src/todo.js`. Tests use the Node built-in runner (`node:test` + `node:assert/strict`)
and live in `test/` (`todo.test.js` for `src/todo.js`, `app.test.js` for `src/app.js`
through jsdom, using its existing `setup()` helper). No task may add a dependency, a
network call or `innerHTML` (user text goes in via `textContent`, `value` or
`aria-label`). `npm test` enforces 100 % line/branch/function coverage of `src/`, so
every branch a task adds needs a test, and no unreachable branch may be written.
Comments only where the logic is not self-evident; no `console.log`. Test titles start
with the prefix the task names, because its `Accept:` selects tests by that prefix. Run
every `Accept:` from the repo root (`/workspace/repo`).

Ids are `T<number>`, with an optional letter (`T9a`) for a follow-up found mid-build. The
ai-workflow task-pipeline scripts (`waves`, `brief`) read this format: keep `Files:`, `Accept:` and
`Depends on:` as written below, and `Files: none` for a task that touches no file.

- [x] **T1 —** Add the pure function `editTask(tasks, id, text)` to `src/todo.js` exactly as in plan.md → `todo.js` (trims `text`; returns the same `tasks` reference when the trimmed text is empty or the id is unknown; otherwise a new array with only that task's `text` replaced, never mutating the input), with unit tests in `test/todo.test.js` covering every `editTask` case in plan.md → Test strategy → Unit
  - Files: `src/todo.js`, `test/todo.test.js`
  - Accept: `node -e "import('./src/todo.js').then(m=>process.exit(typeof m.editTask==='function'?0:1))" && node --test --experimental-test-coverage --test-coverage-include='src/todo.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/todo.test.js`
- [x] **T2 —** Restructure the normal-mode task markup in `src/app.js` as in plan.md → `app.js` "Rendered task, normal mode": the text `<span>` moves out of the `<label>` (the checkbox gets `aria-label` = task text), an inert `<button data-action="edit" aria-label="Edit <text>">Edit</button>` is added before Delete, Delete gets `data-action="delete"`, and the list's click handler and delete-focus logic act on `button[data-action="delete"]` only. Update `test/app.test.js` helpers to select buttons by `data-action` and the accessible-name test to read the checkbox's `aria-label`; add tests titled with prefix `markup:` asserting the Edit button and its accessible name, DOM order checkbox · text · Edit · Delete, that clicking Edit changes nothing yet, and that clicking the task text does not toggle the task
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node --test-name-pattern='^markup:' test/app.test.js | grep -q '^# pass [1-9]' && node --test --experimental-test-coverage --test-coverage-include='src/app.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/app.test.js`
- [x] **T3 —** Add edit-mode entry to `src/app.js` as in plan.md → `app.js`: `let editingId = null` beside `tasks`; `renderTask` renders the edited task as only `<input type="text" class="edit" aria-label="Edit <text>">` with value = its text; `render()` focuses and `select()`s that input when present; a delegated `dblclick` on the task text span and a click on `button[data-action="edit"]` set `editingId` and re-render; the `change` handler acts only on checkboxes. A task removed from `tasks` while edited must leave no input and throw nothing. Tests titled with prefix `edit mode:` cover the entry cases in plan.md → Test strategy → Integration (double-click and Edit each enter edit mode for that task only; input holds the text, is focused and fully selected via `selectionStart`/`selectionEnd`; double-click does not toggle; `change` on the edit input does not toggle; edited-task input has an accessible name)
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node --test-name-pattern='^edit mode:' test/app.test.js | grep -q '^# pass [1-9]' && node --test --experimental-test-coverage --test-coverage-include='src/app.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/app.test.js`
  - Depends on: T1, T2
- [x] **T4 —** Add Enter-to-save and Escape-to-cancel on the edit input in `src/app.js` as in plan.md → `app.js` handler table (`keydown` Enter: `next = editTask(tasks, id, value)`; if `next === tasks` stay in edit mode with the input re-selected and no message, else save, clear `editingId`, re-render, focus that task's Edit button; `keydown` Escape: clear `editingId`, re-render, focus that task's Edit button; other keys do nothing). Tests titled with prefix `save and cancel:` cover: Enter saves trimmed text, exits edit mode, focuses the Edit button, keeps count and done state; Enter with whitespace-only text keeps edit mode, keeps the text, input focused and selected, no `alert`; Escape restores the original text and focuses the Edit button; edited markup text renders as text
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node --test-name-pattern='^save and cancel:' test/app.test.js | grep -q '^# pass [1-9]' && node --test --experimental-test-coverage --test-coverage-include='src/app.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/app.test.js`
  - Depends on: T3
- [x] **T5 —** Add cancel-on-focus-loss to `src/app.js` as in plan.md → `app.js` handler table (`focusout` on the edit input, only while `editingId` is that task: clear `editingId`, replace only that `<li>` with its normal render, focus its Edit button only when `relatedTarget === null`). Tests titled with prefix `focusout:` cover: focus leaving to nowhere cancels and focuses the Edit button; while editing task A, clicking task B's Delete removes B and clicking B's checkbox toggles B (simulate the browser order: `focusout` with `relatedTarget` = B's control, then the click/change); a stale `focusout` dispatched after Enter or Escape changes nothing
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node --test-name-pattern='^focusout:' test/app.test.js | grep -q '^# pass [1-9]' && node --test --experimental-test-coverage --test-coverage-include='src/app.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/app.test.js`
  - Depends on: T4
- [x] **T6 —** Style the edit input and row in `src/styles.css` as in plan.md → `styles.css`: `#todo-list .edit` (or `input.edit`) with `flex: 1` using the existing `--color-border` and `--color-text` variables, and the task text span taking the remaining width (`flex: 1`) so Edit and Delete stay right-aligned; no new variables, no hard-coded colours
  - Files: `src/styles.css`
  - Accept: `node -e "const c=require('fs').readFileSync('src/styles.css','utf8');const r=c.match(/\.edit[^{]*\{([^}]*)\}/);process.exit(r&&/flex:\s*1/.test(r[1])&&r[1].includes('var(--color-border)')&&!/#[0-9a-f]{3,6}/i.test(r[1])?0:1)"`
- [x] **T7 —** Append a `## How it works` section to the end of `docs/specs/7437b765-test-let-users-edit-a-task/spec.md` describing the edit flow that actually shipped (read `src/app.js` and `src/todo.js`: entry by double-click or Edit, `editingId` state, render/focus, Enter/Escape/focusout paths, `editTask`), plus one line per divergence from plan.md; do not change any existing line of the spec
  - Files: `docs/specs/7437b765-test-let-users-edit-a-task/spec.md`
  - Accept: `grep -q '^## How it works' docs/specs/7437b765-test-let-users-edit-a-task/spec.md && git diff --numstat e1b1f53 -- docs/specs/7437b765-test-let-users-edit-a-task/spec.md | awk '{exit $2==0?0:1}'`
  - Depends on: T5, T6

Follow-ups from verify round 1 (code review, spec audit, guardian):

- [x] **T8 —** Make a task row the same height in normal and edit mode in `src/styles.css`, so swapping the edited row back on focus loss does not shift the rows below it between mousedown and mouseup (code review: clicks on the row below were lost): give `#todo-list li` a `min-height` (for example `2.25rem`) and give the edit input `box-sizing: border-box` and an explicit `height` no larger than that min-height (for example `2rem`); keep the existing `.edit` rules otherwise; no new variables, no hard-coded colours
  - Files: `src/styles.css`
  - Accept: `node -e "const c=require('fs').readFileSync('src/styles.css','utf8');const li=c.match(/#todo-list li\s*\{([^}]*)\}/);const e=c.match(/\.edit[^{]*\{([^}]*)\}/);process.exit(li&&/min-height:/.test(li[1])&&e&&/(^|[;\s])height:/.test(e[1])&&/box-sizing:\s*border-box/.test(e[1])?0:1)"`
- [x] **T9 —** Ignore Enter and Escape that confirm or cancel IME composition in the edit input's `keydown` handler in `src/app.js`: return early when `event.isComposing` is true or `event.keyCode === 229`, with tests titled with prefix `ime:` showing that a composing Enter does not save (text unchanged, still in edit mode) and a composing Escape does not cancel, and that `keyCode` 229 is ignored too
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node --test-name-pattern='^ime:' test/app.test.js | grep -q '^# pass [1-9]' && node --test --experimental-test-coverage --test-coverage-include='src/app.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/app.test.js`
- [ ] **T10 —** Keep edit mode when the whole window loses focus (switching tab or window) instead of cancelling, in the edit input's `focusout` handler in `src/app.js`: return early, before any state change, when `document.hasFocus()` is false (the input regains focus with the window), with tests titled with prefix `window blur:` that stub `document.hasFocus` to return false and show a focusout keeps the input, its typed value and `editingId`, while a focusout with `hasFocus` true still cancels
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node --test-name-pattern='^window blur:' test/app.test.js | grep -q '^# pass [1-9]' && node --test --experimental-test-coverage --test-coverage-include='src/app.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/app.test.js`
  - Depends on: T9
- [ ] **T11 —** Add a test titled `edit mode: double-click selects the whole text` to `test/app.test.js` asserting that after a double-click on a task's text the edit input's `selectionStart` is 0 and `selectionEnd` equals the text length (code review: only the Edit-button path asserted selection)
  - Files: `test/app.test.js`
  - Accept: `node --test-name-pattern='^edit mode: double-click selects the whole text$' test/app.test.js | grep -q '^# pass 1'`
  - Depends on: T10
- [ ] **T12 —** Rewrite this module's `## How it works` in `docs/specs/7437b765-test-let-users-edit-a-task/spec.md` in behavioural terms only (Constitution II): no file paths, function signatures, DOM property names (`textContent`, `value`, `aria-label`, `<label>`) or CSS (`flex`, `--color-*`); describe the behaviour after T8–T10 too (rows keep their height, IME composition keys are ignored, a window or tab switch keeps edit mode). Move the divergence list out of the spec into a new `## Divergences found during the build` section at the end of `plan.md` (keeping each item, and adding: the T3 test for a removed edited task was not written; T8–T10 were added from review; `tasks.md` was also touched), and leave one line in the spec pointing to it. Change only lines inside `## How it works`; every line above it stays as it is
  - Files: `docs/specs/7437b765-test-let-users-edit-a-task/spec.md`, `docs/specs/7437b765-test-let-users-edit-a-task/plan.md`
  - Accept: `node -e "const fs=require('fs');const s=fs.readFileSync('docs/specs/7437b765-test-let-users-edit-a-task/spec.md','utf8');const h=s.split(/^## How it works$/m)[1]||'';const p=fs.readFileSync('docs/specs/7437b765-test-let-users-edit-a-task/plan.md','utf8');process.exit(h&&!/\.(js|css)\b|editTask|textContent|aria-label|--color|flex:/.test(h)&&/^## Divergences found during the build$/m.test(p)?0:1)"`
  - Depends on: T8, T10
- [x] **T13 —** Declare this module's dependency on the to-do app module in its contracts: in `docs/specs/7437b765-test-let-users-edit-a-task/contracts/requires.md` → Other modules, replace the "None" text and the `—` row with a row for `docs/specs/00000000-build-a-basic-to-do-app` (depends on: the to-do screen and its in-memory task list, which this change extends in place; listed in their provides: yes, the `/index.html` screen row; on change: this module's tests fail in `npm test`), and in this module's `contracts/provides.md` change "Nothing consumes this module; it is the only module in the repo." to "Nothing consumes this module."
  - Files: `docs/specs/7437b765-test-let-users-edit-a-task/contracts/requires.md`, `docs/specs/7437b765-test-let-users-edit-a-task/contracts/provides.md`
  - Accept: `node -e "const fs=require('fs');const r=fs.readFileSync('docs/specs/7437b765-test-let-users-edit-a-task/contracts/requires.md','utf8');const p=fs.readFileSync('docs/specs/7437b765-test-let-users-edit-a-task/contracts/provides.md','utf8');process.exit(r.includes('00000000-build-a-basic-to-do-app')&&!p.includes('only module')?0:1)"`
- [ ] **T14 —** Bring the to-do app module's docs in line with what now ships (Constitution VI): in `docs/specs/00000000-build-a-basic-to-do-app/spec.md`, append ` (added later by docs/specs/7437b765-test-let-users-edit-a-task)` to the Out of scope line "Editing existing tasks", and in its `## How it works` **Display** paragraph change "a labelled checkbox, its text … and a Delete button labelled with that task's text" to say each task shows a checkbox named by its text, its text, an Edit button and a Delete button, and that editing is described in 7437b765; in `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` change "Nothing consumes this module; it is the only module in the repo." to "Consumed by docs/specs/7437b765-test-let-users-edit-a-task, which extends the screen in place." Change no other line
  - Files: `docs/specs/00000000-build-a-basic-to-do-app/spec.md`, `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`
  - Accept: `node -e "const fs=require('fs');const s=fs.readFileSync('docs/specs/00000000-build-a-basic-to-do-app/spec.md','utf8');const p=fs.readFileSync('docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md','utf8');process.exit(/Editing existing tasks.*7437b765/.test(s)&&/Edit button/.test(s)&&!p.includes('only module')&&p.includes('7437b765')?0:1)"`

## Outcome coverage

| Spec outcome | Task |
|---|---|
| Double-click a task's text to enter edit mode | T2 (text out of label), T3 |
| Click an Edit button to enter edit mode | T2 (button), T3 |
| While editing, text is in a focused input | T3 |
| Enter saves non-blank edited text | T1, T4 |
| Escape cancels without saving | T4 |
| Blank edit rejected, edit mode stays | T1, T4 |
| After save/cancel, list re-renders and focus is managed | T4, T5 |

## Done when

All tasks above checked, the definition of done (ai-workflow plugin `law/definition-of-done.md`) satisfied, and `## How it
works` appended to `spec.md` via `/ai-workflow:flow`.

## Deferred

None.
