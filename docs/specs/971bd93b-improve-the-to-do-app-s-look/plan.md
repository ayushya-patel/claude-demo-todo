# Plan — Improve the to-do app's look

Derived from `spec.md`. This is where implementation details are allowed.

Chosen design: [`designs/round-2/option-a.html`](designs/round-2/option-a.html) ("Light
glass"). Every approach below produces that page's layout, content and styling; they
differ only in how the progress ring and the empty state are built and wired.

## Starting point

- `src/index.html`: `main > h1 + form#todo-form (label, input#todo-input, submit button)
  + ul#todo-list + p#todo-count[aria-live=polite]`, loads `app.js` as a module.
- `src/app.js`: `mount(document)` holds the task array in a closure and re-renders the
  list and count from it in one `render()` after every add, toggle and delete (plus
  focus restoration after toggle/delete).
- `src/todo.js`: pure functions `addTask`, `toggleTask`, `removeTask`,
  `countCompleted` → `{ completed, total }`, `formatCount`.
- `src/styles.css`: six colour variables in `:root`, minimal layout, `.done`, focus ring.
- Tests: `test/todo.test.js` (unit), `test/app.test.js` (jsdom, ADR 0001),
  `test/serve.test.js`; `npm test` enforces 100 % line/branch/function coverage of
  `src/**/*.js`. 42 tests pass on the branch head.

Because `render()` is already the single place where the count is written, the ring and
the empty state are updated there, which gives the spec's "at the same moment as the
count text" for free.

## Approaches considered

### A. CSS `conic-gradient` ring driven by a custom property; empty state toggled with `hidden` (recommended)

Markup mirrors the design file: `header > h1 + div.ring[aria-hidden] > span`. The ring's
arc is `conic-gradient(var(--color-accent) calc(var(--progress) * 1turn), var(--color-ring-track) 0)`;
`render()` sets `ring.style.setProperty('--progress', String(progress(counts)))` and the
label text `completed/total`. The empty-state message is a `<p id="todo-empty">` after
`#todo-list`; `render()` sets `empty.hidden = tasks.length > 0`.

- For: the same technique as the chosen design file, so the look matches exactly with
  the least markup; one extra line per element in `render()`; both states are plain DOM
  facts (`textContent`, a style property, the `hidden` attribute) that jsdom can assert,
  so the spec's DOM tests are straightforward (checked: jsdom round-trips
  `style.setProperty('--progress', …)` and `hidden`).
- Against: the arc's end is a hard colour stop (as in the design), not a rounded line
  cap.

### B. Inline SVG ring (`stroke-dasharray` / `stroke-dashoffset`); empty state toggled with `hidden`

The ring is an `<svg aria-hidden="true">` with a track circle and an arc circle;
`render()` sets the arc's `stroke-dashoffset` from the progress value.

- For: smooth rounded arc ends, scales crisply at any size.
- Against: departs from the design file's construction (more markup, SVG attributes to
  get right, a `transform: rotate(-90deg)` to start at 12 o'clock); the centre label
  becomes an SVG `<text>` or an overlaid element; more code for a look the design does
  not ask for.

### C. Conic ring as in A, but a CSS-only empty state (`#todo-list:empty + #todo-empty`)

No JS for the empty state: CSS shows the message whenever the list has no children.

- For: one fewer line in `app.js`.
- Against: jsdom does not apply stylesheet cascade to visibility, so the spec's DOM
  tests ("message visible / hidden") could not observe the state and would have to
  test CSS text instead; visibility would also depend on whitespace inside `<ul>`
  (`:empty` fails on a text node), which is fragile.

**This plan follows approach A.** Approving the plan picks A; request changes to pick B
or C instead.

## Approach

Approach A, as a restyle of the existing screen with two small additions to the render
cycle. No runtime or dev dependency is added; nothing here is expensive to reverse
(every choice is local CSS/markup in three files), so no ADR is needed.

### `src/index.html`

- Three decorative blobs before `<main>`: `<div class="blob b1" aria-hidden="true">`
  (and `b2`, `b3`), as in the design.
- `<header>` inside `<main>` holding the existing `<h1>To-do</h1>` and
  `<div class="ring" id="todo-ring" aria-hidden="true"><span id="todo-ring-label"></span></div>`.
- The input gains `placeholder="Add a new task…"`. The `<label for="todo-input">New task</label>`
  stays and is visually hidden by CSS (still the accessible name).
- `<p id="todo-empty" class="empty">Nothing here yet — add your first task above.</p>`
  between `#todo-list` and `#todo-count`, so the list never holds a non-task `li`.
- All existing ids, the submit button, the `<ul>` and the `aria-live` count stay as
  they are.

### `src/todo.js`

New pure export `progress({ completed, total })` → `completed / total`, or `0` when
`total` is `0`. It takes the same shape `countCompleted` returns, like `formatCount`.

### `src/app.js`

- `mount` also looks up `#todo-ring`, `#todo-ring-label` and `#todo-empty`.
- `render()` computes `counts = countCompleted(tasks)` once and writes: the count text
  (unchanged wording), `ringLabel.textContent = \`${completed}/${total}\``,
  `ring.style.setProperty('--progress', String(progress(counts)))`, and
  `empty.hidden = tasks.length > 0`.
- `renderTask` adds `class="del"` to the Delete button (styling hook from the design);
  text, `aria-label`, structure and focus handling are unchanged.

### `src/styles.css`

Rewritten to the design file's rules, with every colour a variable in `:root`:

- Background: the design's four radial gradients over `#eef0f8`, `background-attachment: fixed`;
  `.blob` fixed, blurred, `z-index: 0`; `main` relative, `z-index: 1`, so 20+ tasks
  scroll the card over a still background.
- Glass card, header, capsule input, gradient Add button, grouped list with
  `li + li` dividers, round `appearance: none` checkboxes with the CSS check mark,
  `.done`, `.del` glass pill, centred count, `.empty` muted and centred — values taken
  from the design file.
- `#todo-empty[hidden]` must stay hidden (the `.empty` rule must not set `display` in a
  way that overrides `hidden`; use `[hidden] { display: none }` if needed).
- Visually hidden label: the design's clip technique, scoped to `#todo-form label`.
- Long text: the task `span` gets `min-width: 0; overflow-wrap: anywhere`; the
  checkbox and `.del` get `flex-shrink: 0`, so Delete stays at the right.
- Narrow screens: `main` keeps `max-width: 34rem; margin: 3.5rem auto` and gets side
  gutters below that width (`@media (max-width: 36rem) { main { margin: 2rem 0.75rem } }`);
  the input has `min-width: 0` so input + Add stay on one row at 360px.
- Focus: `input:focus-visible, button:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 2px }`
  (covers the input, checkboxes and buttons).
- Fallbacks: `@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))`
  and `@media (prefers-reduced-transparency: reduce)` both redefine the glass variables
  to near-opaque white (e.g. `rgba(255,255,255,.92)`), same layout.
- `@media (forced-colors: active)`: checkboxes revert to `appearance: auto`; buttons and
  the input get a `1px solid ButtonText`/`CanvasText` border so they stay visible; the
  ring track/arc use system colours.

### Contrast (spec Constraints: darken just enough to pass AA)

Measured with the WCAG formula against the card as drawn (glass `rgba(255,255,255,.45)`
over the base colour plus a 70 % blob, i.e. the darkest spots; list panel adds another
40 % white):

| Use | Design colour | Ratio | Planned value | Ratio |
|---|---|---|---|---|
| Task / body text | `#1c1c1e` | ≥ 14.5 | unchanged | — |
| Muted: done text, count, empty message | `rgba(60,60,67,.6)` | ≈ 3.1–3.3 ✗ | `#5c5c61` (solid) | ≥ 5.0 |
| Delete text | `#ff3b30` | ≈ 3.3 ✗ | `#d70015` | ≈ 5.0 |
| Add button label (white on gradient) | `#2891ff → #006ef0` | 3.2–4.7 ✗ | `#0a6bd9 → #0059c7` | ≥ 5.1 |
| Ring label (decorative, `aria-hidden`) | `#007aff` | ≈ 3.7 | `#0062cc` text only; arc stays `#007aff` | ≈ 5.3 |
| Placeholder | `rgba(60,60,67,.45)` | low | `#6c6c70` | ≈ 4.0–4.6 (placeholder is a hint, not required text; kept close to design) |

Checkbox fill, arc and focus ring stay `#007aff` (non-text, ≥ 3:1). The implementer
re-checks the final values with a contrast tool during the manual check; these are the
starting values and the allowed difference from the design.

## Touched surface

| Path | Change |
|---|---|
| `src/index.html` | modified — blobs, header + ring, placeholder, empty-state paragraph |
| `src/styles.css` | modified — Light glass styling, fallbacks, forced-colors |
| `src/todo.js` | modified — new `progress()` export |
| `src/app.js` | modified — ring and empty state in `render()`, `del` class |
| `test/todo.test.js` | modified — new tests appended for `progress()`; existing tests untouched |
| `test/app.test.js` | modified — new DOM tests appended; existing tests untouched |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | modified — the `/` row also renders the progress ring and empty-state message |
| `docs/specs/971bd93b-improve-the-to-do-app-s-look/spec.md` | modified — `## Contracts` pointer (this commit) and `## How it works` (end of build) |
| `docs/specs/971bd93b-improve-the-to-do-app-s-look/contracts/*` | new — this plan's contracts |

## Data

| Data | Owner | Shape | Boundary |
|---|---|---|---|
| Task list | Client state in `mount`'s closure (unchanged) | array of `{ id, text, done }` | unchanged: trimmed/rejected in `addTask`, rendered with `textContent` only |
| Ring value and label | Derived from `countCompleted(tasks)` on every render | number in `[0, 1]`; text `completed/total` | never stored; cannot drift from the count |
| Empty-state visibility | Derived from `tasks.length` on every render | `hidden` attribute | never stored |

Nothing is persisted (spec Out of scope).

## Consumed contracts

None. The app calls no upstream system, makes no network requests and loads no
external resource (no fonts, images or CDNs: system font stack, CSS-only background,
glass and ring).

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| — | — | — | — |

## Entry points

| Entry point | Runs | Behaviour on failure |
|---|---|---|
| `src/index.html` (the one screen) | Client-side only, static files | No async work; blank input is rejected as today. Missing `backdrop-filter` or reduced transparency falls back to near-opaque glass. |
| `npm test` | Node test runner with 100 % coverage of `src/**/*.js` | Unchanged command. |

## Accessibility

- The ring is `aria-hidden="true"`; `#todo-count` with `aria-live="polite"` stays the
  accessible count, written in the same `render()`.
- The empty-state message uses the `hidden` attribute, so it is removed from the
  accessibility tree when tasks exist; it is not live (the count already announces).
- "New task" label visually hidden, not `display: none`, so the input keeps its name.
- Checkboxes keep native semantics (`appearance: none` changes only the look); focus
  ring 3px on input, checkboxes and buttons; DOM order = visual order.
- Done state stays strikethrough plus colour, plus the check mark.

## Risks

| Risk | Mitigation |
|---|---|
| Restyle breaks an existing test that relies on structure | Ids, `li > label > input + span`, `button` "Delete" and `done` class kept; new elements live outside `#todo-list`; run `npm test` after each task. |
| `.empty { display: … }` overrides `hidden` | Explicit `[hidden] { display: none }`; DOM test asserts `hidden`, manual check confirms. |
| Contrast fails on pastel spots | Darkened values in the table above; manual check with a contrast tool. |
| `appearance: none` checkboxes vanish in forced-colors | `forced-colors` media query reverts to native appearance. |
| `backdrop-filter` unsupported (older Firefox) | `@supports not` fallback to near-opaque glass. |
| Blobs cause horizontal scroll on narrow screens | `body { overflow-x: hidden }` or blobs sized within viewport; manual check at 360px. |
| New branches drop coverage below 100 % | `progress()` zero/non-zero both unit-tested; `render()` branches covered by the new DOM tests. |

## Test strategy

- **Unit (`test/todo.test.js`, appended)**: `progress` returns `0` for 0 of 0, `0.4`
  for 2 of 5 and `1` for 5 of 5.
- **DOM (`test/app.test.js`, appended, using the file's existing `setup()`)**:
  on mount the empty message is visible (`hidden === false`) and the ring label reads
  `0/0`; after an add the message is hidden and the ring reads `0/1`; after a toggle the
  ring reads `1/1`; after deleting the last task the message is visible again; the ring
  has `aria-hidden="true"`; the input has placeholder "Add a new task…" and its label
  is still "New task"; the ring's `--progress` property follows the value (e.g. `0.5`
  for 1 of 2) so the arc wiring is covered.
- **Existing tests**: all run unchanged.
- **Manual (spec Verification)**: side-by-side with the design in Chrome and Safari,
  2 of 5 ring check, empty state, keyboard-only pass, 360px width, contrast tool on task
  text, done text, count and empty message. CSS appearance is not automated (jsdom does
  no layout, ADR 0001), and the config has no `"e2e"`.
