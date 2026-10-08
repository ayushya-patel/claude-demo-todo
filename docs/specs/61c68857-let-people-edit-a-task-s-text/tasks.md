# Tasks — Edit a task's text

Derived from `plan.md` (approach A: edit state `editingId` in `mount`'s closure, drawn
by `render()`). Each task is atomic, independently reviewable, and has one acceptance
check.

**Conventions every task follows** (named once here so implementers do not each pick their own):
Vanilla JavaScript ES modules (`import`/`export`, named exports only, no globals),
2-space indentation, semicolons, single quotes — match the existing `src/` files. Tests
use the Node built-in runner (`node:test` + `node:assert/strict`) and live in `test/`
(`test/todo.test.js` for `src/todo.js`, `test/app.test.js` for `src/app.js`, jsdom, with
the existing `setup()` helper). No task may add a dependency, a network call or
`innerHTML`: user text goes in only via `textContent` / `.value`. `npm test` enforces
100 % line, branch and function coverage of `src/**/*.js`, so every new branch needs a
test. Comments only where the logic is not self-evident; no `console.log`. Run every
`Accept:` from the repo root (`/workspace/repo`).

Ids are `T<number>`, with an optional letter (`T9a`) for a follow-up found mid-build. The
ai-workflow task-pipeline scripts (`waves`, `brief`) read this format: keep `Files:`, `Accept:` and
`Depends on:` as written below, and `Files: none` for a task that touches no file.

- [x] **T1 —** Add the pure export `editTask(tasks, id, text)` to `src/todo.js` as in plan.md → `todo.js` (trim `text`; empty after trim or unknown `id` → return the same `tasks` array; otherwise a new array where only that task's `text` is replaced, `id` and `done` kept, other tasks untouched, input not mutated), with unit tests in `test/todo.test.js` named `editTask …` covering every case in plan.md → Test strategy → Unit
  - Files: `src/todo.js`, `test/todo.test.js`
  - Accept: `node -e "process.exit(require('fs').readFileSync('test/todo.test.js','utf8').includes('editTask')?0:1)" && node --test --experimental-test-coverage --test-coverage-include='src/todo.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/todo.test.js`
- [x] **T2 —** Add the edit hint to `src/index.html`: directly after `<ul id="todo-list"></ul>`, insert `<p id="edit-hint" class="visually-hidden">Press Enter or double-click to edit</p>`; change nothing else
  - Files: `src/index.html`
  - Accept: `node -e "const h=require('fs').readFileSync('src/index.html','utf8');process.exit(/<p id=\"edit-hint\" class=\"visually-hidden\">Press Enter or double-click to edit<\/p>/.test(h)?0:1)"`
- [x] **T3 —** Add the edit-field styles to `src/styles.css` (plan.md → `index.html` / `styles.css`): a standard `.visually-hidden` utility (clip/1px/absolute pattern); `#todo-list .edit { flex: 1; font: inherit; }` so the edit input takes the text's place at the same font size as the task text (reviewer note); and extend the existing `:focus-visible` rule so it also covers `#todo-list span:focus-visible`. Change no other rule
  - Files: `src/styles.css`
  - Accept: `node -e "const c=require('fs').readFileSync('src/styles.css','utf8');process.exit(/\.visually-hidden\s*\{/.test(c)&&/\.edit\s*\{[^}]*flex:\s*1/.test(c)&&/\.edit\s*\{[^}]*font:\s*inherit/.test(c)&&/span:focus-visible/.test(c)?0:1)"`
- [x] **T4 —** Restructure each task row in `src/app.js` → `renderTask` to plan.md → `app.js` row markup, without adding any editing behaviour: no `<label>`; the row is `<li data-id>` › checkbox with `aria-label` = task text, `<span tabindex="0" aria-describedby="edit-hint">` with the text (keeps the `done` class), Delete button (unchanged). Update the test `checkbox and Delete button have accessible names from the task text` in `test/app.test.js` to assert the checkbox's `aria-label` equals the text, the span has `tabindex="0"` and `aria-describedby="edit-hint"`, and the checkbox has no enclosing `<label>`
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node -e "const s=require('fs').readFileSync('src/app.js','utf8');process.exit(!s.includes(\"createElement('label')\")&&s.includes('edit-hint')?0:1)" && node --test --experimental-test-coverage --test-coverage-include='src/app.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/app.test.js`
- [x] **T5 —** Enter edit mode in `src/app.js` (plan.md → approach A, Start): add `let editingId = null` in `mount`'s closure; `renderTask` draws `<input type="text" class="edit" aria-label="Edit task: <text>">` with `.value` = text in place of the span when `task.id === editingId`; delegated `dblclick` on a task's span, and `keydown` Enter on a focused span (with `preventDefault`), set `editingId`, re-render, focus the input and `select()` it. Also make the existing delegated `change` handler ignore events whose target is not a checkbox (the edit input fires `change` on blur). Add jsdom tests in `test/app.test.js` whose names contain `edit mode`: double-click enters edit mode with the input focused and its text selected (`selectionStart` 0, `selectionEnd` = length); Enter on a focused span enters edit mode; other keys on the span do nothing; the input has the `aria-label`; markup in the text stays plain text in the input's value; a `change` event from the edit input does not toggle the task
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node -e "process.exit(require('fs').readFileSync('test/app.test.js','utf8').includes('edit mode')&&require('fs').readFileSync('src/app.js','utf8').includes('dblclick')?0:1)" && node --test --experimental-test-coverage --test-coverage-include='src/app.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/app.test.js`
  - Depends on: T4
- [ ] **T6 —** Save and cancel an edit in `src/app.js` (plan.md → approach A, Save / Cancel, and Risks): `keydown` Enter in the edit input saves; `focusout` from the edit input saves; `keydown` Escape cancels. Save = read the value, `editingId = null`, `tasks = editTask(tasks, id, value)`, `render()`, focus that task's span; cancel = `editingId = null`, `render()`, focus that task's span. Clear `editingId` before any DOM change, and ignore events from an input that is no longer the current edit (no double save, no save after cancel). Add jsdom tests in `test/app.test.js` whose names contain `saves` or `cancels`: Enter saves non-blank text and shows a span with it; blur saves; empty and whitespace-only input restore the original text; Escape restores the original; a done task stays done and an open task stays open; the count text is unchanged after an edit; focus returns to the span after save and after cancel; checkbox and Delete `aria-label`s follow the saved text; the blur that follows Enter or Escape does not save again; markup typed into the input renders as text in the span; other keys in the input do nothing
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node -e "const t=require('fs').readFileSync('test/app.test.js','utf8');process.exit(t.includes('saves')&&t.includes('cancels')&&require('fs').readFileSync('src/app.js','utf8').includes('editTask')?0:1)" && node --test --experimental-test-coverage --test-coverage-include='src/app.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/app.test.js`
  - Depends on: T1, T5
- [ ] **T7 —** Cancel the edit when the row's checkbox or Delete button is pressed (plan.md → "Blur saves, but a click on the row's checkbox or Delete cancels"): a delegated `mousedown` on `#todo-list` that, while editing, cancels the edit (`editingId = null`, no save) when its target is the editing row's checkbox or Delete button, so the following blur does nothing and the existing `change` / `click` handlers then toggle or delete as today. Add jsdom tests in `test/app.test.js` whose names contain `mousedown`, dispatching `mousedown` then `click` like a browser: on the checkbox the original text is kept and the task toggles; on Delete the text change is not saved and the task is deleted; a `mousedown` elsewhere (another row, the edit input itself) or with no edit in progress changes nothing
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node -e "process.exit(require('fs').readFileSync('test/app.test.js','utf8').includes('mousedown')&&require('fs').readFileSync('src/app.js','utf8').includes('mousedown')?0:1)" && node --test --experimental-test-coverage --test-coverage-include='src/app.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/app.test.js`
  - Depends on: T6
- [x] **T8 —** In `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` → Routes / endpoints, extend the `/` and `/index.html` row's "Returns or renders" cell so it says the screen also lets the user edit a task's text inline (link `../../61c68857-let-people-edit-a-task-s-text/spec.md`); change nothing else
  - Files: `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`
  - Accept: `node -e "const s=require('fs').readFileSync('docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md','utf8');process.exit(/edit/i.test(s)&&s.includes('61c68857-let-people-edit-a-task-s-text')?0:1)"`
- [ ] **T9 —** Append a `## How it works` section to the end of `docs/specs/61c68857-let-people-edit-a-task-s-text/spec.md` describing, in behavioural terms only (no file paths, library, function or variable names — Constitution II), how editing actually shipped: how an edit starts, saving and cancelling, blank text, the checkbox/Delete-while-editing rule, where focus goes, what screen readers hear, and the visible change that a single click on the text no longer toggles the task; plus one line per divergence from plan.md (or "None"). Do not change any existing line of the spec
  - Files: `docs/specs/61c68857-let-people-edit-a-task-s-text/spec.md`
  - Accept: `node -e "const s=require('fs').readFileSync('docs/specs/61c68857-let-people-edit-a-task-s-text/spec.md','utf8');const h=s.split('\n## How it works\n')[1];process.exit(h&&!/\.m?js\b|\.html|\.css|editTask|editingId|render\(|jsdom|mount/.test(h)?0:1)"`
  - Depends on: T2, T3, T7

## Outcome coverage

| Spec outcome | Task |
|---|---|
| Edit inline by double-click or Enter on the focused text | T4, T5 |
| Saving (Enter or leaving the field) updates the task | T1, T6 |
| Escape cancels and restores the original text | T6 |
| Saving empty text is ignored, original preserved | T1, T6 |
| Works for completed and incomplete tasks | T1, T6 |
| Completed count unchanged by editing | T1, T6 |
| Keyboard and screen-reader accessible | T2, T3, T4, T5, T6 |
| Covered by automated tests | T1, T4, T5, T6, T7 |
| (Edge cases: checkbox / Delete while editing) | T7 |

## Done when

All tasks above checked, the definition of done (ai-workflow plugin `law/definition-of-done.md`) satisfied, and `## How it
works` appended to `spec.md` (T9).

## Deferred

None. Everything the spec leaves out is listed in its **Out of scope**.
