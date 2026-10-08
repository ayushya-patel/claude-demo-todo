# Tasks — Build a basic to-do app

Derived from `plan.md` (approach A: ES modules + jsdom for DOM tests). Each task is
atomic, independently reviewable, and has one acceptance check.

**Conventions every task follows** (named once here so implementers do not each pick their own):
Vanilla JavaScript ES modules (`"type": "module"`, `import`/`export`, no CommonJS, no
globals), 2-space indentation, semicolons, single quotes, named exports only. Tests use
the Node built-in runner (`node:test` + `node:assert/strict`) and live in `test/` as
`<name>.test.js`. The only package any task may add is `jsdom` as a devDependency (ADR
0001); no runtime dependencies, no network calls, no `innerHTML` (user text goes in via
`textContent`). npm is the package manager (`package-lock.json`). Comments only where
the logic is not self-evident; no `console.log`. Run every `Accept:` from the repo
root (`/workspace/repo`).

Ids are `T<number>`, with an optional letter (`T9a`) for a follow-up found mid-build. The
ai-workflow task-pipeline scripts (`waves`, `brief`) read this format: keep `Files:`, `Accept:` and
`Depends on:` as written below, and `Files: none` for a task that touches no file.

- [x] **T1 —** Create the npm project: `package.json` with `"type": "module"`, `"engines": { "node": ">=22.8" }`, `"private": true`, devDependency `jsdom`, script `start` = `node scripts/serve.mjs`, and script `test` = `node --test --experimental-test-coverage --test-coverage-include='src/**/*.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/` (exactly as in plan.md → Entry points); run `npm install` to produce `package-lock.json`; `.gitignore` lists `node_modules/` and `coverage/`
  - Files: `package.json`, `package-lock.json`, `.gitignore`
  - Accept: `npm ls jsdom && node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8'));process.exit(p.type==='module'&&p.scripts.start==='node scripts/serve.mjs'&&p.scripts.test.includes('--test-coverage-branches=100')&&!p.dependencies?0:1)"`
- [x] **T1a —** Raise `"engines".node` in `package.json` from `>=22.8` to `>=22.13`, because the installed devDependency jsdom 29 requires Node `^22.13` (found during T1); change nothing else in the file
  - Files: `package.json`
  - Accept: `node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8'));process.exit(p.engines.node==='>=22.13'?0:1)"`
  - Depends on: T1
- [x] **T1b —** In `package.json`'s `test` script, replace the trailing bare directory `test/` with the quoted glob `'test/*.test.js'` (Node 22 treats a bare directory argument to `node --test` as a module path and fails with "Cannot find module"; found during T6); change nothing else
  - Files: `package.json`
  - Accept: `node -e "const p=JSON.parse(require('fs').readFileSync('package.json','utf8'));process.exit(p.scripts.test.endsWith(\" 'test/*.test.js'\")&&p.scripts.test.includes('--test-coverage-functions=100')?0:1)"`
  - Depends on: T1a
- [x] **T2 —** Set `"check": "npm test"` in `.claude/ai-workflow.json`, changing no other field
  - Files: `.claude/ai-workflow.json`
  - Accept: `node -e "const c=JSON.parse(require('fs').readFileSync('.claude/ai-workflow.json','utf8'));process.exit(c.check==='npm test'&&c.specs==='docs/specs'?0:1)"`
  - Depends on: T1
- [x] **T3 —** Implement the pure task-list logic in `src/todo.js` (exports `addTask`, `toggleTask`, `removeTask`, `countCompleted`, `formatCount` exactly as in plan.md → "`todo.js` surface"; every function returns a new array or a derived value and never mutates its input) with unit tests in `test/todo.test.js` covering every case listed in plan.md → Test strategy → Unit, reaching 100 % line/branch/function coverage of `src/todo.js`
  - Files: `src/todo.js`, `test/todo.test.js`
  - Accept: `node --test --experimental-test-coverage --test-coverage-include='src/todo.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/todo.test.js`
  - Depends on: T1
- [x] **T4 —** Write the page markup `src/index.html`: `<form id="todo-form">` with a visible `<label for="todo-input">`, `<input id="todo-input">` and `<button type="submit">Add</button>`; an empty `<ul id="todo-list">`; a count element `<p id="todo-count" aria-live="polite">`; links `styles.css` and loads `app.js` with `<script type="module">` that imports `mount` from `./app.js` and calls `mount(document)` (no inline logic beyond that call)
  - Files: `src/index.html`
  - Accept: `node -e "const h=require('fs').readFileSync('src/index.html','utf8');process.exit(['id=\"todo-form\"','id=\"todo-input\"','for=\"todo-input\"','id=\"todo-list\"','id=\"todo-count\"','aria-live=\"polite\"','type=\"module\"','styles.css'].every(s=>h.includes(s))?0:1)"`
- [x] **T5 —** Write `src/styles.css`: theme colours as CSS variables on `:root`; `.done` task text gets `text-decoration: line-through` plus a muted colour from a variable; a `:focus-visible` outline on inputs and buttons; no layout beyond a simple centred column
  - Files: `src/styles.css`
  - Accept: `node -e "const c=require('fs').readFileSync('src/styles.css','utf8');process.exit(/:root\s*\{[^}]*--/.test(c)&&/\.done[^{]*\{[^}]*line-through/.test(c)&&c.includes(':focus-visible')?0:1)"`
- [x] **T6 —** Implement `src/app.js` exporting `mount(document)` as described in plan.md → "`app.js` surface" (state array in the closure, form `submit` handler that always clears the input, one delegated `change`/`click` handler on the list keyed by task id, full re-render of list and count from state after every change; each `<li>` holds a checkbox labelled by the task text, the text in an element that gets class `done` when done, and a Delete button with `aria-label="Delete <text>"`) with jsdom integration tests in `test/app.test.js` that load `src/index.html` and cover every case in plan.md → Test strategy → Integration, reaching 100 % line/branch/function coverage of `src/app.js`
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node --test --experimental-test-coverage --test-coverage-include='src/app.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/app.test.js`
  - Depends on: T1, T3, T4
- [x] **T7 —** Implement the zero-dependency static dev server `scripts/serve.mjs` (`node:http`, port 8080 by default, serves files from `src/` only, `/` → `index.html`, correct `Content-Type` for `.html`/`.css`/`.js`, unknown path or any path resolving outside `src/` → 404) exporting a function the test can start on port 0, with `test/serve.test.js` asserting `/index.html` → 200 and a `..` traversal request → 404
  - Files: `scripts/serve.mjs`, `test/serve.test.js`
  - Accept: `node --test test/serve.test.js`
  - Depends on: T1, T4
- [x] **T7a —** Make `scripts/serve.mjs` listen on the fixed port 8080 instead of reading `process.env.PORT`, because `contracts/requires.md` → Environment says no variables are read (found during T7)
  - Files: `scripts/serve.mjs`
  - Accept: `node -e "const s=require('fs').readFileSync('scripts/serve.mjs','utf8');process.exit(!s.includes('process.env')&&s.includes('8080')?0:1)" && node --test test/serve.test.js`
  - Depends on: T7
- [x] **T8 —** Update `README.md` with how to run the app: `npm install`, `npm start` (then open http://localhost:8080; opening `index.html` from disk does not work because of ES modules) and `npm test`
  - Files: `README.md`
  - Accept: `node -e "const r=require('fs').readFileSync('README.md','utf8');process.exit(['npm install','npm start','npm test','localhost:8080'].every(s=>r.includes(s))?0:1)"`
- [x] **T9 —** Append a `## How it works` section to the end of `spec.md` describing the runtime flow that actually shipped (read `src/` and `scripts/serve.mjs`: page load → `mount`, where state lives, add/toggle/delete/render path, count derivation, dev server), plus one line per divergence from plan.md; do not change any existing line of the spec
  - Files: `docs/specs/00000000-build-a-basic-to-do-app/spec.md`
  - Accept: `node -e "const s=require('fs').readFileSync('docs/specs/00000000-build-a-basic-to-do-app/spec.md','utf8');process.exit(/\n## How it works\n[\s\S]*mount/.test(s)?0:1)"`
  - Depends on: T6, T7, T7a, T1b

### From the whole-diff review

- [x] **T10 —** Stop a malformed request target from crashing the dev server: in `scripts/serve.mjs` parse `req.url` with `new URL(...)` inside a `try` and answer 404 when it throws; add a raw-request test named `malformed request target` in `test/serve.test.js` with request path `http://a:b/` expecting 404 and the server still answering `/index.html` with 200 afterwards
  - Files: `scripts/serve.mjs`, `test/serve.test.js`
  - Accept: `node -e "process.exit(require('fs').readFileSync('test/serve.test.js','utf8').includes('malformed request target')?0:1)" && node --test test/serve.test.js`
  - Depends on: T7a
- [ ] **T11 —** Make the traversal test reach the path guard: add raw-request cases `/..%2fpackage.json` and `/%2e%2e%2fpackage.json` expecting 404 to `test/serve.test.js` (these return 200 if the `startsWith` guard in `scripts/serve.mjs` is removed)
  - Files: `test/serve.test.js`
  - Accept: `node -e "process.exit(require('fs').readFileSync('test/serve.test.js','utf8').includes('..%2fpackage.json')?0:1)" && node --test test/serve.test.js`
  - Depends on: T10
- [ ] **T12 —** Bind the dev server to `127.0.0.1` only (`listen(port, '127.0.0.1', ...)` in `scripts/serve.mjs`) so it is not exposed on the LAN, matching the README's `http://localhost:8080`
  - Files: `scripts/serve.mjs`
  - Accept: `node -e "const s=require('fs').readFileSync('scripts/serve.mjs','utf8');process.exit(/listen\([^)]*'127\.0\.0\.1'/.test(s)?0:1)"`
  - Depends on: T10
- [ ] **T13 —** Remove the unused `root` parameter of `createServer` in `scripts/serve.mjs` (no caller passes it; use the `src/` directory constant directly)
  - Files: `scripts/serve.mjs`
  - Accept: `node -e "const s=require('fs').readFileSync('scripts/serve.mjs','utf8');process.exit(/createServer\(\s*\)/.test(s)?0:1)" && node --test test/serve.test.js`
  - Depends on: T12
- [x] **T14 —** Keep keyboard focus after re-render in `src/app.js`: after a toggle, focus that task's checkbox; after a delete, focus the Delete button of the task that took its place (the next one, else the previous one), or the text input when the list is empty; add jsdom tests in `test/app.test.js` asserting `document.activeElement` in all three cases, keeping 100 % coverage of `src/app.js`
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node -e "process.exit(require('fs').readFileSync('test/app.test.js','utf8').includes('activeElement')?0:1)" && node --test --experimental-test-coverage --test-coverage-include='src/app.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/app.test.js`
  - Depends on: T6
- [ ] **T15 —** Add a test named `adds a task via the Add button` in `test/app.test.js` that adds a task by clicking the form's Add button (`button[type="submit"]`.click()), not by dispatching `submit` directly, and asserts the task is rendered and the input cleared
  - Files: `test/app.test.js`
  - Accept: `node -e "process.exit(require('fs').readFileSync('test/app.test.js','utf8').includes('Add button')?0:1)" && node --test test/app.test.js`
  - Depends on: T14
- [ ] **T16 —** Update `## How it works` in `spec.md` to match T10–T14: the dev server binds `127.0.0.1`, answers 404 for a malformed request target, `createServer()` takes no argument; focus handling after toggle/delete; and add the divergence line that `todo.js` keeps a module-level id counter (`nextId`) although plan.md → Approach says it has no global state. Edit only lines inside `## How it works`
  - Files: `docs/specs/00000000-build-a-basic-to-do-app/spec.md`
  - Accept: `node -e "const s=require('fs').readFileSync('docs/specs/00000000-build-a-basic-to-do-app/spec.md','utf8').split('## How it works')[1];process.exit(s.includes('127.0.0.1')&&s.includes('nextId')&&/focus/i.test(s)&&!s.includes('createServer(root')?0:1)"`
  - Depends on: T13, T14

## Outcome coverage

| Spec outcome | Task |
|---|---|
| Add a task via input and button | T3, T4, T6 |
| Mark a task done (visual indicator) | T3, T5, T6 |
| Delete a task | T3, T6 |
| Count of completed tasks | T3, T6 |
| Works in the browser without frameworks | T4, T5, T6, T7, T8 |
| Core features covered by automated tests | T1, T2, T3, T6 |

## Done when

All tasks above checked, the definition of done (ai-workflow plugin `law/definition-of-done.md`) satisfied, and `## How it
works` appended to `spec.md` via `/ai-workflow:flow`.

## Deferred

None. Everything the spec leaves out is listed in its **Out of scope**.
