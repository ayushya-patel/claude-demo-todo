# Plan — Add dark mode to the to-do app

Derived from `spec.md`. This is where implementation details are allowed.

Chosen design: [`designs/round-2/option-a.html`](designs/round-2/option-a.html)
(spec Verification 8). Where the design file and the spec's written Behaviour
disagree, the spec wins. Each such point is listed under **Decisions where the
design and the spec differ** below.

## Contracts

See [`./contracts/provides.md`](contracts/provides.md) and
[`./contracts/requires.md`](contracts/requires.md). The change extends the existing
to-do screen (module `00000000-build-a-basic-to-do-app`) with a theme toggle. It
adds no route, no data API and no upstream call. (This summary lives here and not
in `spec.md`, so the approved spec stays byte-identical to the approved commit.)

## Approaches considered

All three use the same CSS. `src/styles.css` gets an
`html[data-theme="dark"]` block that redefines the existing colour variables, and
`<html>` carries `data-theme` as the spec requires. The approaches differ only in
where the toggle's JavaScript lives.

### A. New `src/theme.js` module, mounted from `index.html` (recommended)

`src/theme.js` exports `mountThemeToggle(document)`. It finds the toggle button,
flips `document.documentElement.dataset.theme` between `light` and `dark` on click,
and updates the button's icon and `aria-pressed`. The existing inline module script
in `index.html` imports it and calls it next to `mount(document)`.

- For: this matches the existing pattern (logic in `src/*.js`, exported and called
  from `index.html`), and `app.js` stays about tasks only. The theme code falls
  under the existing `src/**/*.js` coverage gate (100 %) and gets its own focused
  jsdom test file. The task-list tests are untouched.
- Against: it adds one more small file and one more import in `index.html`.

### B. Extend `mount()` in `src/app.js`

`mount(document)` also wires the theme toggle.

- For: no new file or import.
- Against: it mixes two unrelated features in one closure. Every task-list test
  would now also mount the toggle, and `mount` grows a second responsibility that
  later tickets would need to separate again.

### C. Inline `<script>` in `index.html`, as the design file does

Copy the design's script into the page.

- For: the fewest lines, and the closest copy of the design.
- Against: the code would sit outside `src/**/*.js`, so the coverage gate would not
  see it. The jsdom tests do not execute inline scripts, so the toggle would be
  untested. This conflicts with the repo's 100 % coverage rule.

**This plan follows approach A.** Approving the plan picks A. To pick B or C
instead, request changes.

## Approach

Approach A.

**Theme state** is the `data-theme` attribute on `<html>`, set to `"light"` or
`"dark"`. `src/index.html` ships with `<html lang="en" data-theme="light">`, so the
page renders light before any JavaScript runs (spec edge case "Page loads → light
mode is default"). The attribute is the single source of truth: the toggle reads it
on each click and writes the flipped value. The toggle does not keep a second copy
of the state in a JS variable.

**CSS** (`src/styles.css`):

- `:root` keeps today's light values. It gains `--color-on-accent: #ffffff` (text
  on the Add button) and `color-scheme: light`.
- `html[data-theme="dark"]` sets the spec's values: `--color-bg: #1a1a1a`,
  `--color-text: #f0f0f0`, `--color-muted: #a0a0a0` and `--color-border: #404040`.
  `--color-accent` and `--color-focus` stay `#0b5fff`. It also sets
  `color-scheme: dark`, so native controls (checkbox, text-input caret) follow the
  theme.
- Every colour goes through a variable (spec constraint). The design file
  hard-codes `#333333` for the toggle's dark hover and `white` for the Add-button
  text. The plan uses `var(--color-border)` and `var(--color-on-accent)` for these.
- Layout and styling are taken from the design file: `main` is
  `position: relative`, and `.theme-toggle` is absolutely positioned top-right of
  the content column with a transparent background, a 1.5rem icon, a hover
  background and a `:focus-visible` outline. Also from the design: `h1` margin, a
  column form layout with gap, padded and rounded text input on `--color-bg` /
  `--color-text`, Add button on `--color-accent`, outlined muted Delete buttons,
  the list label `flex: 1`, a muted small `#todo-count`, and 0.2s
  background/colour transitions. The existing `.done` rule (strikethrough +
  `--color-muted`) and the `:focus-visible` outline rules stay. Both pick up the
  dark values through the variables (spec edge cases: completed tasks and focus).

**Markup** (`src/index.html`): `data-theme="light"` on `<html>`. As the first child of
`<main>` (design order), add
`<button type="button" id="theme-toggle" class="theme-toggle" aria-label="Dark mode" aria-pressed="false">🌙</button>`.
Also add `placeholder="Enter a task..."` on the text input (design content). The
module script also imports `mountThemeToggle` from `./theme.js` and calls it.

### `theme.js` surface (internal to this module)

| Export | Behaviour |
|---|---|
| `mountThemeToggle(document)` | Finds `#theme-toggle` and attaches a `click` handler. On each click it sets `document.documentElement.dataset.theme` to `dark` when it was `light` (and to `light` otherwise), sets the button's text to `☀️` in dark and `🌙` in light, and sets `aria-pressed` to `"true"` in dark and `"false"` in light. It also syncs the icon and `aria-pressed` once from the current attribute on mount. |

Keyboard: the control is a native `<button>`, so Tab reaches it and Enter/Space
activate it with no extra key handling (spec constraint).

### Decisions where the design and the spec differ

| Point | Design file | Spec | Plan follows |
|---|---|---|---|
| Where the state lives | `html.dark-mode` class | `data-theme` attribute on `<html>` | Spec: `data-theme="light" \| "dark"` |
| Dark text / border colours | `#e8e8e8` / `#333333` | `#f0f0f0` / `#404040` | Spec |
| Dark accent / focus | `#4d9aff` | stays `#0b5fff` | Spec. `#0b5fff` on `#1a1a1a` gives ≈ 3.4 : 1, which meets WCAG 1.4.11's 3 : 1 for focus indicators. On `#f7f7f9` it gives ≈ 4.8 : 1. |
| Icon per state | ☀️ in light, 🌙 in dark | moon in light, sun in dark | Spec: 🌙 in light, ☀️ in dark |
| Hard-coded colours (`#333333` hover, `white` button text) | present | "CSS variables define all colours" | Spec: variables only |
| Toggle position | top-right of the centred content column | "top-right corner of the page" | Design. The spec names the design file as the build's layout, and on narrow screens the two are the same. |

### Persistence: a reading of the spec to confirm

The spec's Outcome says the toggle state "persists and is instantly visible across
the page". Its edge case says "Page loads → Light mode is default". Read together,
the plan takes this to mean: the chosen theme holds for the life of the page, and
every part of the page switches at once. A reload starts in light mode again. The
plan therefore stores nothing (no `localStorage`). Remembering the choice across
reloads would contradict the "Page loads → light" edge case. If that is wanted,
request changes on this plan and it will add `localStorage` with light as the
first-visit default.

ADR: none. Nothing here is expensive to reverse: there is no dependency, no stored
data and no new boundary, and the attribute name is the spec's own.

## Touched surface

| Path | Change |
|---|---|
| `src/theme.js` | new: `mountThemeToggle(document)` |
| `src/index.html` | modified: `data-theme="light"` on `<html>`, toggle button, input placeholder, imports and calls `mountThemeToggle` |
| `src/styles.css` | modified: dark-theme variable block, `--color-on-accent`, `color-scheme`, toggle styles, design-file layout and styling |
| `test/theme.test.js` | new: jsdom tests for the toggle, and checks of the dark palette in `styles.css` |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | modified: the screen now also renders the theme toggle |
| `docs/specs/7fdaa70d-add-a-dark-mode-to-the-to-do-app/contracts/*` | new: this plan's contracts |

`src/app.js`, `src/todo.js` and their tests are not changed. `app.test.js` loads
`src/index.html`, so the new button must not break it. The button sits outside
`#todo-list` and `#todo-form`, and the existing selectors are scoped to those.

## Data

| Data | Owner | Shape | Boundary |
|---|---|---|---|
| Current theme | Client state: the `data-theme` attribute on `<html>`, for the page's lifetime | `"light"` or `"dark"` | Only `mountThemeToggle` writes it, and only from a click. Nothing is persisted or read from outside the page. |

## Consumed contracts

None. The toggle reads no upstream system, no storage and no environment.

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| — | — | — | — |

## Entry points

| Entry point | Runs | Behaviour on failure |
|---|---|---|
| `src/index.html` (the to-do screen) | Client-side only: static files served by `npm start`, unchanged | No network or async work. If `theme.js` failed to load, the page still renders in light mode from the static `data-theme="light"`. |

## Accessibility

- The toggle is a native `<button type="button">` with the accessible name "Dark
  mode". It uses `aria-pressed` (`false` in light, `true` in dark), so assistive tech
  announces its state. The emoji is only a visual cue, and `aria-label` overrides it
  as the name.
- Focus: a 3px `--color-focus` outline on `:focus-visible` in both themes (contrast
  above). Tab order: toggle, then input, Add, list. This matches the design's
  DOM order: the toggle comes first in `<main>` and sits at the top of the screen.
- Text contrast. Dark: `#f0f0f0` on `#1a1a1a` ≈ 15 : 1, and muted `#a0a0a0` on
  `#1a1a1a` ≈ 6.6 : 1. Light (unchanged): muted ≈ 4.9 : 1. White on `#0b5fff`
  ≈ 5.1 : 1.
- Completed tasks still show strikethrough as well as the muted colour, so colour
  is never the only carrier.

## Risks

| Risk | Mitigation |
|---|---|
| The design-file restyle (form layout, buttons) breaks existing behaviour or tests | CSS only, with the same element ids and selectors. `npm test` runs `app.test.js` against the edited `index.html`. |
| Emoji icons render differently across OSes | Accepted: the design uses emoji. State is also exposed via `aria-pressed`, and the icon is not the only cue (the whole palette changes). |
| Theme code untested because it sits in HTML | Approach A keeps it in `src/theme.js` under the 100 % coverage gate. |
| CSS appearance cannot be fully checked in jsdom | Tests assert the dark-palette values in `styles.css` text and the attribute/icon state in the DOM. The look is checked by hand against the design file in a browser (spec Verification 1–7). |

## Test strategy

- **`test/theme.test.js` (jsdom, loads `src/index.html`, calls `mountThemeToggle`)**:
  - On load, `data-theme` is `light`, the button shows 🌙, `aria-pressed="false"`,
    the accessible name is "Dark mode" and `type="button"`.
  - One click gives `dark`, ☀️ and `aria-pressed="true"`.
  - A second click returns to light. Several rapid clicks alternate on each click
    (edge case "toggles multiple times").
  - The toggle does not disturb the task list: after `mount` and
    `mountThemeToggle`, adding and completing a task still works in dark mode, and
    the `done` class is applied.
  - The toggle is reachable by keyboard: it is a `<button>` with no `tabindex`
    removing it.
- **Palette checks (same file, reading `src/styles.css` as text)**: an
  `html[data-theme="dark"]` block defines `#1a1a1a`, `#f0f0f0`, `#a0a0a0`,
  `#404040`, and `#0b5fff` for accent and focus. No hex colour or `white` appears
  outside the variable blocks.
- `src/theme.js` must reach 100 % line, branch and function coverage under the
  existing `npm test` gate.
- Deliberately not automated: the visual look and real-browser contrast. The config
  has no `"e2e"`. These are checked by hand against the design file and spec
  Verification 1–7.
