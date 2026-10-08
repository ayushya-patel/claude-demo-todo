# Tasks — Improve the to-do app's look

Derived from `plan.md` (approach A: CSS `conic-gradient` ring driven by a `--progress`
custom property; empty state toggled with `hidden`). Each task is atomic, independently
reviewable, and has one acceptance check.

Chosen design: `docs/specs/971bd93b-improve-the-to-do-app-s-look/designs/round-2/option-a.html`
("Light glass"). Markup and styling tasks must match its layout, content and styling,
except the contrast-darkened colours listed in `plan.md` → Contrast.

**Conventions every task follows** (named once here so implementers do not each pick their own):
Vanilla JavaScript ES modules (`import`/`export`, named exports only, no globals),
2-space indentation, semicolons, single quotes. Tests use the Node built-in runner
(`node:test` + `node:assert/strict`) and live in `test/`; DOM tests use jsdom through the
existing `setup()` helper in `test/app.test.js`. **Existing tests are never changed**: new
tests are appended at the end of the file. No new dependency (runtime or dev), no network
calls, no external resources (fonts, images, CDNs), no `innerHTML` (user text goes in via
`textContent`). Every colour in `src/styles.css` is a CSS variable defined in `:root`.
Keep the existing ids and structure (`#todo-form`, `#todo-input`, submit button,
`#todo-list` with `li > label > input[type=checkbox] + span` and a `button` "Delete",
`#todo-count[aria-live=polite]`, the `done` class). Comments only where the logic is not
self-evident; no `console.log`. Run every `Accept:` from the repo root (`/workspace/repo`).
`npm test` enforces 100 % line/branch/function coverage of `src/**/*.js`.

Ids are `T<number>`, with an optional letter (`T9a`) for a follow-up found mid-build. The
ai-workflow task-pipeline scripts (`waves`, `brief`) read this format: keep `Files:`, `Accept:` and
`Depends on:` as written below, and `Files: none` for a task that touches no file.

- [x] **T1 —** Add the pure export `progress({ completed, total })` to `src/todo.js` returning `completed / total`, or `0` when `total` is `0`; append unit tests to `test/todo.test.js` asserting `0` for 0 of 0, `0.4` for 2 of 5 and `1` for 5 of 5
  - Files: `src/todo.js`, `test/todo.test.js`
  - Accept: `node -e "import('./src/todo.js').then(m=>process.exit(m.progress({completed:0,total:0})===0&&m.progress({completed:2,total:5})===0.4&&m.progress({completed:5,total:5})===1?0:1))" && node --test test/todo.test.js`
- [x] **T2 —** Update `src/index.html` markup per `plan.md` → `src/index.html`: three decorative blobs `<div class="blob b1|b2|b3" aria-hidden="true">` before `<main>`; a `<header>` in `<main>` wrapping the existing `<h1>To-do</h1>` and `<div class="ring" id="todo-ring" aria-hidden="true"><span id="todo-ring-label"></span></div>`; `placeholder="Add a new task…"` on `#todo-input` (label "New task" kept); `<p id="todo-empty" class="empty">Nothing here yet — add your first task above.</p>` between `#todo-list` and `#todo-count`. Keep every existing id and element
  - Files: `src/index.html`
  - Accept: `node -e "const{JSDOM}=require('jsdom');const d=new JSDOM(require('fs').readFileSync('src/index.html','utf8')).window.document;const r=d.getElementById('todo-ring'),e=d.getElementById('todo-empty'),i=d.getElementById('todo-input');process.exit(r&&r.getAttribute('aria-hidden')==='true'&&r.closest('header')&&d.getElementById('todo-ring-label')&&e&&e.textContent==='Nothing here yet — add your first task above.'&&e.previousElementSibling.id==='todo-list'&&i.placeholder==='Add a new task…'&&d.querySelector('label[for=todo-input]').textContent==='New task'&&d.querySelectorAll('.blob[aria-hidden=true]').length===3?0:1)"`
- [ ] **T3 —** Wire the ring and the empty state into `render()` in `src/app.js` per `plan.md` → `src/app.js`: compute `countCompleted(tasks)` once, write the count text (unchanged), set `#todo-ring-label` text to `completed/total`, set `--progress` on `#todo-ring` via `style.setProperty('--progress', String(progress(counts)))`, set `#todo-empty`'s `hidden` to `tasks.length > 0`; add `class="del"` to each Delete button (nothing else about it changes). Append DOM tests to `test/app.test.js` covering: on mount empty message visible and ring `0/0`; after an add message hidden and ring `0/1`; after a toggle ring `1/1`; after deleting the last task message visible again; ring has `aria-hidden="true"`; input placeholder "Add a new task…" and label still "New task"; `--progress` is `0.5` for 1 of 2
  - Files: `src/app.js`, `test/app.test.js`
  - Accept: `node --input-type=module -e "import{JSDOM}from'jsdom';import{readFileSync}from'fs';import{mount}from'./src/app.js';const w=new JSDOM(readFileSync('src/index.html','utf8')).window,d=w.document;mount(d);const l=()=>d.getElementById('todo-ring-label').textContent,e=d.getElementById('todo-empty');let ok=l()==='0/0'&&!e.hidden;d.getElementById('todo-input').value='a';d.getElementById('todo-form').dispatchEvent(new w.Event('submit',{cancelable:true}));d.getElementById('todo-input').value='b';d.getElementById('todo-form').dispatchEvent(new w.Event('submit',{cancelable:true}));d.querySelector('#todo-list input').click();ok=ok&&l()==='1/2'&&e.hidden&&d.getElementById('todo-ring').style.getPropertyValue('--progress')==='0.5'&&d.querySelector('#todo-list button').classList.contains('del');process.exit(ok?0:1)" && node --test test/app.test.js`
  - Depends on: T1, T2
- [ ] **T4 —** Rewrite `src/styles.css` to the chosen design's Light glass rules per `plan.md` → `src/styles.css` and → Contrast: every colour a `:root` variable (darkened values from the Contrast table), system font stack, fixed pastel background and `.blob`s, glass `main` card, header + `.ring` as `conic-gradient(var(--color-accent) calc(var(--progress, 0) * 1turn), var(--color-ring-track) 0)`, visually hidden form label, capsule input, gradient Add button, grouped list with `li + li` dividers, round `appearance: none` checkboxes with check mark, `.done`, `.del` glass pill, centred `#todo-count`, muted centred `.empty`, `[hidden] { display: none }`, an empty `#todo-list` draws no empty panel, long-text wrapping (`min-width: 0; overflow-wrap: anywhere` on the task span, `flex-shrink: 0` on checkbox and `.del`), 360px narrow-screen gutters with input + Add on one row and no horizontal scroll, 3px focus outline, `@supports not` backdrop-filter and `prefers-reduced-transparency: reduce` near-opaque fallbacks, `forced-colors: active` rules
  - Files: `src/styles.css`
  - Accept: `node -e "const c=require('fs').readFileSync('src/styles.css','utf8');const need=['conic-gradient','--progress','backdrop-filter','@supports not','prefers-reduced-transparency','forced-colors','[hidden]','overflow-wrap','.del','.empty','.blob','::placeholder','#5c5c61','#d70015'];const miss=need.filter(s=>!c.includes(s));const body=c.replace(/:root\s*{[^}]*}/g,'');const raw=body.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g)||[];if(miss.length||raw.length){console.error(miss,raw);process.exit(1)}"`
  - Depends on: T2
- [x] **T5 —** In `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`, change the `/` and `/index.html` row's "Returns or renders" cell to also mention the decorative progress ring (`completed/total`) and the empty-state message when there are no tasks; change nothing else
  - Files: `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`
  - Accept: `grep -q "progress ring" docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md && grep -q "empty-state" docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`
- [ ] **T6 —** Append `## How it works` to `docs/specs/971bd93b-improve-the-to-do-app-s-look/spec.md` per the ai-workflow `flow` skill (`/workspace/ai-workflow/skills/flow/SKILL.md`): describe what shipped in `src/` (render cycle, ring, empty state, CSS fallbacks), and one line per divergence from `plan.md`; do not change any existing section of the spec
  - Files: `docs/specs/971bd93b-improve-the-to-do-app-s-look/spec.md`
  - Accept: `grep -q "^## How it works" docs/specs/971bd93b-improve-the-to-do-app-s-look/spec.md`
  - Depends on: T3, T4

## Outcome coverage

| Spec outcome | Tasks |
|---|---|
| Matches the chosen design (Light glass) | T2, T4 |
| Add, done, delete and the count work and read as today | T3 (existing tests unchanged) |
| Progress ring next to the title | T1, T2, T3, T4 |
| Friendly empty-list message | T2, T3, T4 |
| Readable text; keyboard and screen-reader use at least as good | T2 (label kept, `aria-hidden` ring), T4 (contrast values, focus ring, fallbacks, forced-colors) |

## Done when

All tasks above checked, the definition of done (ai-workflow plugin `law/definition-of-done.md`) satisfied, and `## How it
works` appended to `spec.md` via `/ai-workflow:flow`.

## Deferred

None.
