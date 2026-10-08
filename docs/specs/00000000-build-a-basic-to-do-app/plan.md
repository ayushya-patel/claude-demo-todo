# Plan — Build a basic to-do app

Derived from `spec.md`. This is where implementation details are allowed.

## Approaches considered

The repository is empty (only `README.md`, `.claude/` and the spec) and
`.claude/ai-workflow.json` has an empty `"check"`, so this plan also sets up the
project and fills `"check"`. The config's `"code"` glob is `src/**`, so application
files live under `src/`. All three approaches share the spec's constraints: vanilla
JavaScript, `src/styles.css` with CSS variables, logic in `src/todo.js`, DOM wiring in
`src/app.js`, tests via `npm test` on the Node test runner.

### A. ES modules + jsdom for DOM tests (recommended)

`todo.js` and `app.js` are ES modules (`"type": "module"`). `todo.js` exports pure
functions over an array of tasks; `app.js` exports `mount(document)` which wires the
form, holds the task array and re-renders the list and count from it after every
change. `index.html` loads `app.js` with `<script type="module">`. Unit tests import
`todo.js` directly; integration tests build the page in jsdom (dev dependency, see
ADR 0001) and call `mount`.

- For: standard module syntax both in the browser and in Node, no globals, no build
  step; a real DOM implementation in tests means the integration tests exercise the
  same calls the browser runs.
- Against: browsers refuse ES modules over `file://`, so the page must be served. A
  zero-dependency `npm start` script (`node:http`, serves `src/` only) covers that.
  One dev dependency (jsdom).

### B. Classic scripts with globals + jsdom

`todo.js` and `app.js` are plain `<script>` files that attach functions to `window`
and, in Node, to `module.exports` behind a `typeof module` guard (CommonJS).

- For: `index.html` opens straight from disk with no server.
- Against: global names and a dual-export guard in production files are exactly the
  kind of shim the team avoids; the guard branch itself needs covering to reach the
  spec's 100 % coverage; load order between the two scripts becomes implicit.

### C. ES modules + a hand-written fake DOM

As A, but `app.js` is tested against a small fake `document` written in the test
folder instead of jsdom.

- For: zero dependencies of any kind.
- Against: the fake only implements what the tests already expect, so it cannot
  catch a wrong DOM call (for example a property jsdom/browsers do not support); it
  grows with every UI change and becomes a second, untested DOM.

**This plan follows approach A.** Approving the plan picks A; request changes to pick
B or C instead.

## Approach

Approach A. State is a plain array of `{ id, text, done }` held inside `mount`'s
closure (client state, in memory only; no persistence per Out of scope). `todo.js`
is pure: every function takes the current array and returns a new one (or a derived
value), so it has no DOM or global state and is fully unit-testable. `app.js` reads
input, calls `todo.js`, and re-renders the list and the count from the returned
array. Re-rendering from state on every change (rather than patching individual
nodes) is what keeps the DOM consistent under rapid add/delete clicks: handlers are
synchronous and identify tasks by `id`, never by list position.

Enter-to-add comes from wrapping the input and the Add button in a `<form>` and
handling `submit` (built-in browser behaviour, no key handler).

ADR: [0001 — jsdom as the DOM for integration tests](../../adr/0001-jsdom-for-dom-tests.md).
No runtime dependency is added.

### `todo.js` surface (internal to this module)

| Export | Behaviour |
|---|---|
| `addTask(tasks, text)` | Trims `text`; returns `tasks` unchanged when the result is empty, else a new array with `{ id, text, done: false }` appended. Ids are unique within the session (incrementing counter). |
| `toggleTask(tasks, id)` | New array with that task's `done` flipped; unknown id → unchanged. |
| `removeTask(tasks, id)` | New array without that task; unknown id → unchanged. |
| `countCompleted(tasks)` | `{ completed, total }`. |
| `formatCount({ completed, total })` | `"X of Y completed"` (so `"0 of 0 completed"` when empty). |

### `app.js` surface

`mount(document)` finds the form, input, list and count elements by id in
`index.html`, renders the initial `0 of 0 completed`, and attaches a `submit` handler
to the form and one delegated `change`/`click` handler on the list. On submit it
always clears the input (whitespace-only input is rejected and still cleared, per the
spec's edge-case table). Each rendered task is an `<li>` containing a checkbox, the
task text, and a Delete button; a done task gets a `done` class (strikethrough + muted
colour via CSS variables) and the checkbox is checked.

## Touched surface

| Path | Change |
|---|---|
| `package.json` | new — `"type": "module"`, scripts `test` and `start`, devDependency `jsdom` |
| `package-lock.json` | new — npm lockfile |
| `.gitignore` | new — `node_modules/`, coverage output |
| `.claude/ai-workflow.json` | modified — `"check": "npm test"` (the only field changed) |
| `src/index.html` | new — page markup, links `styles.css`, loads `app.js` as a module |
| `src/styles.css` | new — CSS variables for theme colours; done-state and focus styles |
| `src/todo.js` | new — pure task-list logic |
| `src/app.js` | new — `mount(document)`: DOM wiring and rendering |
| `scripts/serve.mjs` | new — zero-dependency static server for `src/` (`npm start`) |
| `test/todo.test.js` | new — unit tests for `todo.js` |
| `test/app.test.js` | new — jsdom integration tests for `app.js` against `src/index.html` |
| `test/serve.test.js` | new — dev-server tests |
| `README.md` | modified — how to run (`npm install`, `npm start`, `npm test`) |
| `docs/adr/README.md` | new — ADR index |
| `docs/adr/0001-jsdom-for-dom-tests.md` | new — ADR |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/*` | new — this plan's contracts |

## Data

| Data | Owner | Shape | Boundary |
|---|---|---|---|
| Task list | Client state, in memory inside `mount`'s closure | array of `{ id: number, text: string, done: boolean }` | User text is trimmed and rejected when empty in `addTask`; rendered with `textContent` only (never `innerHTML`), so task text cannot inject markup. |
| Completed count | Derived from the task list on every render | `{ completed, total }` | Never stored separately, so it cannot drift from the list. |

Nothing is persisted; a reload starts empty (spec Out of scope: persistence).

## Consumed contracts

None. The app calls no upstream system, reads no environment variables and makes no
network requests.

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| — | — | — | — |

## Entry points

| Entry point | Runs | Behaviour on failure |
|---|---|---|
| `src/index.html` (one screen) | Client-side only; static files, no caching rules beyond the browser's defaults | No network or async work, so no loading/error states exist. Invalid input (empty / whitespace) is the only failure path and is handled by rejecting it. |
| `npm start` → `scripts/serve.mjs` | Local dev server on `http://localhost:8080`, serving files from `src/` only | Unknown path → 404; any path resolving outside `src/` → 404 (path-traversal guard). |
| `npm test` | `node --test` with coverage thresholds | Fails when a test fails or `src/todo.js` / `src/app.js` drop below 100 % line, branch or function coverage. |

`npm test` is:
`node --test --experimental-test-coverage --test-coverage-include='src/**/*.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/`
(Node 22 built-ins; enforces the spec's 100 % coverage of `todo.js` and `app.js`).

## Accessibility

- The input has a visible `<label>`; the Add button is a real `<button type="submit">`.
- Each checkbox is labelled by its task text; each Delete button's accessible name is
  `Delete <task text>` (`aria-label`), so screen-reader users can tell them apart.
- The count element is `aria-live="polite"` so changes are announced.
- Done state is shown by strikethrough as well as colour (colour is never the only
  carrier); `:focus-visible` outline on all controls; DOM order = visual order.

## Risks

| Risk | Mitigation |
|---|---|
| Opening `index.html` from disk fails silently (modules blocked on `file://`) | `npm start` serves it; README says so. |
| Integration tests pass in jsdom but break in a real browser | Use only standard DOM APIs (`querySelector`, `createElement`, `textContent`, `classList`, events); manual test from the spec's Verification in a browser before the PR. |
| Coverage flags not available on the Node in use | They exist in Node ≥ 22.8; `package.json` declares `"engines": { "node": ">=22.8" }`. |
| Rapid clicks act on a task that was already removed | Handlers look tasks up by `id`; `toggleTask` / `removeTask` return the list unchanged for an unknown id; tested. |
| Static server serves files outside `src/` | Resolve the request path against `src/` and reject anything not under it; tested with a `..` request. |

## Test strategy

- **Unit (`test/todo.test.js`)**: every `todo.js` export — add (normal, trimmed,
  empty, whitespace-only), toggle on/off, toggle unknown id, remove (open, done,
  unknown id), counts after each operation, `formatCount` for `0 of 0`, `3 of 5`,
  `Y of Y`.
- **Integration (`test/app.test.js`)**: load `src/index.html` into jsdom, call
  `mount`, then drive it through real events: add via submit (input clears, item
  rendered with unchecked checkbox and Delete button), whitespace rejected and input
  cleared, check/uncheck (class + count), delete open and done tasks (count), delete
  all → `0 of 0 completed`, many rapid add/delete events keep list and count
  consistent, task text containing markup renders as text, accessible names present.
  The spec's manual scenario (5 added, 3 done → `3 of 5 completed`; delete one done →
  `2 of 4 completed`) is automated here too.
- **`scripts/serve.mjs`**: one test that starts it on a free port, fetches
  `/index.html` (200) and a traversal path (404). It is dev tooling, so it is outside
  the 100 % coverage include.
- Deliberately not tested: CSS appearance (checked in the manual browser run).
- No end-to-end browser suite: the config has no `"e2e"`, and the spec asks for unit
  and integration tests only.

## Divergences found during the build

- `engines.node` is `>=22.13`, not `>=22.8`: jsdom 29 requires it.
- The `npm test` script ends in `'test/*.test.js'` instead of `test/`: on Node 22 a bare directory argument is not expanded to the test files.
- `scripts/serve.mjs` exports `createServer()` so `test/serve.test.js` can start it on a free port; it binds `127.0.0.1` (not all interfaces, dev tool only) and answers 404 for malformed request targets.
- `src/todo.js` keeps a module-level id counter (`nextId`), so it is not free of global state as Approach says; ids must stay unique across calls. Cheap to reverse, so no ADR.
- After toggle/delete, `src/app.js` restores keyboard focus (the checkbox, the next Delete button, or the input): added from review, not in the plan's `app.js` surface.
