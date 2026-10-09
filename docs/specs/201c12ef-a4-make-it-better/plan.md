# Plan — Add dark mode toggle with persistent choice

Derived from `spec.md`. This is where implementation details are allowed.

## Approaches considered

All three share what the spec fixes: vanilla JavaScript, a toggle in the header,
`localStorage` key `theme` with value `"light"` or `"dark"`, light by default, and the
dark palette expressed by redefining the CSS variables already in `src/styles.css`.
They also follow the existing split: pure logic in its own module (like `todo.js`),
DOM wiring in `app.js` → `mount(document)`. The spec names no design file, so the
toggle's look follows the existing page (a plain native button).

### A. `data-theme` on `<html>`, applied by `mount` (recommended)

A new `src/theme.js` holds the theme logic (read the saved value, save it, flip it),
with every `localStorage` access inside `try`/`catch`. `mount(document)` reads the saved
theme, sets `document.documentElement.dataset.theme`, and wires a header
`<button aria-pressed>` that flips the attribute and saves the new value.
`styles.css` gets a `:root[data-theme="dark"]` block that redefines each colour
variable, plus `color-scheme` so native controls (text input, buttons, checkboxes)
switch with it.

- For: one way to apply the theme, all of it in covered ES modules; follows the
  `todo.js`/`app.js` pattern; the CSS change is one block of variable overrides.
- Against: the theme is applied when the module script runs (after the HTML is
  parsed), so a reload in dark mode can briefly paint light before switching. On a
  page this small, served locally, that window is a frame at most; see Risks.

### B. As A, plus a blocking inline script in `<head>`

A classic inline `<script>` in `<head>` reads `localStorage` and sets `data-theme`
before first paint; `mount` only wires the button.

- For: no light flash on reload in dark mode.
- Against: the read-and-validate logic lives twice (inline and in `theme.js`), and the
  inline copy is outside `src/**/*.js`, so the 100 % coverage gate never sees it. The
  tests would need jsdom's `runScripts` to exercise it. A second way to do the same
  thing, for a cosmetic gain.

### C. Two stylesheets, swapped by toggling `disabled` on a `<link>`

A `dark.css` with the dark variables, enabled or disabled by the toggle.

- For: the dark palette is isolated in its own file.
- Against: contradicts the spec's constraint that `styles.css` defines both palettes;
  the second stylesheet loads only when enabled (a flash of a different kind);
  two files to keep in step.

**This plan follows approach A.** Approving the plan picks A; request changes to pick
B or C instead.

## Approach

Approach A. The current theme is **client state owned by the page**: the value of
`data-theme` on `<html>` is the single truth for what is shown, and `localStorage['theme']`
is only its persisted copy, read once in `mount` and written on each toggle.

**Markup.** The `<h1>` moves into a new `<header>` at the top of `<main>`, together with
`<button type="button" id="theme-toggle" aria-pressed="false">Dark mode</button>`.
The fixed text "Dark mode" plus `aria-pressed` gives the button an accessible name and a
state screen readers announce ("Dark mode, toggle button, pressed"); the visible text
does not change. Nothing else in the page moves. The header lays out the heading
and the button in one row (`display: flex; justify-content: space-between; align-items: center`).
The existing `button:focus-visible` rule already gives it a visible focus ring.

**`src/theme.js`** (internal to this module):

| Export | Behaviour |
|---|---|
| `readTheme(window)` | Returns `"dark"` when `window.localStorage.getItem('theme')` is exactly `"dark"`, otherwise `"light"`. A throw (storage disabled: accessing `localStorage` raises `SecurityError`) returns `"light"`. |
| `saveTheme(window, theme)` | `window.localStorage.setItem('theme', theme)`; a throw (disabled, quota full) is swallowed: the theme still changes for this page, it just is not remembered. |
| `otherTheme(theme)` | `"dark"` → `"light"`, anything else → `"dark"`. |

**`src/app.js`** → `mount(document)` gains, before the first `render()`:
read the theme via `readTheme(document.defaultView)`, apply it (sets `data-theme` and the
button's `aria-pressed`), and a `click` listener on the toggle that applies
`otherTheme(current)` and saves it. Applying is synchronous and only sets two
attributes, so rapid toggling never lags or falls out of step. The to-do code paths are
untouched.

**`src/styles.css`.** `:root` gains `color-scheme: light`; a new
`:root[data-theme="dark"]` block sets `color-scheme: dark` and redefines every existing
variable (`--color-bg`, `--color-text`, `--color-muted`, `--color-border`,
`--color-accent`, `--color-focus`), with text and muted colours at WCAG AA contrast
against the dark background (for example `#0d1117` / `#e6edf3` / `#8b949e` / `#30363d` /
`#4c8dff`). Every element already takes its colours from these variables or from native
control styling, which `color-scheme` switches; no per-element dark rules are needed.

No ADR: no dependency is added, and the one persisted value (`localStorage['theme']`,
its key and values) is fixed by the spec rather than chosen here. The `data-theme`
mechanism is internal and cheap to change.

## Touched surface

| Path | Change |
|---|---|
| `src/index.html` | modified: `<header>` wrapping `<h1>` and the toggle button |
| `src/styles.css` | modified: `color-scheme`, dark variable block, header row layout |
| `src/theme.js` | new: read / save / flip the theme |
| `src/app.js` | modified: apply the saved theme on mount, wire the toggle |
| `test/theme.test.js` | new: unit tests for `theme.js` |
| `test/app.test.js` | modified: integration tests for the toggle and persistence |
| `docs/specs/201c12ef-a4-make-it-better/contracts/provides.md`, `requires.md` | new (this plan) |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | modified: the screen row mentions the theme toggle and points here |
| `docs/specs/201c12ef-a4-make-it-better/spec.md` | modified: `## Contracts` summary now; `## How it works` at the end |

## Data

| Data | Owner | Shape | Boundary |
|---|---|---|---|
| Current theme | The page (client state): `data-theme` on `<html>` | `"light"` \| `"dark"` | Set only by `mount` |
| Saved preference | Browser `localStorage`, key `theme` | string; only `"dark"` means dark | Parsed in `theme.js` → `readTheme`; any other value, a missing key or unavailable storage means light (the spec's stated default, not an invented one) |

Tasks stay in memory as before; nothing about them is persisted.

## Consumed contracts

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| `localStorage['theme']` | Browser Web Storage | `src/theme.js` → `readTheme` | degrade: light theme |

No upstream system, no network calls, no environment variables.

## Entry points

The single static screen (`/index.html`), client-side only. On load, `mount` applies the
saved theme and wires the toggle. Failure: storage unavailable or full degrades to an
unremembered theme (light on each load); the to-do features are unaffected because the
theme code never throws.

## Risks

| Risk | Mitigation |
|---|---|
| Brief light paint before the module script applies dark on reload | Accepted for approach A (tiny page, local); approach B is the alternative if review finds it visible |
| `localStorage` access throws (disabled, `file://`-like opaque origins, quota) | Every access in `try`/`catch` in `theme.js`; tested with stubs that throw, and with jsdom's default `about:blank` page, whose `localStorage` getter throws `SecurityError` |
| Native controls stay light in dark mode | `color-scheme` on `:root` per theme |
| A colour variable left without a dark value | A test reads `styles.css` and checks the dark block redefines every variable `:root` declares |
| Existing tests build the page at `about:blank`, where storage throws | Intended: they then exercise the degrade path and must keep passing unchanged |

## Test strategy

`npm test` keeps its 100 % line/branch/function gate over `src/**/*.js`, so every new
branch is tested.

- `test/theme.test.js`: `readTheme` with `"dark"`, `"light"`, missing, an unknown value
  and a throwing `localStorage`; `saveTheme` writes, and swallows a throwing `setItem`;
  `otherTheme` both ways.
- `test/app.test.js` (jsdom with `url: 'http://localhost/'` where storage is needed):
  the header contains the toggle with accessible name "Dark mode" and
  `aria-pressed="false"`, `data-theme="light"` on a fresh load; a click sets
  `data-theme="dark"`, `aria-pressed="true"` and stores `"dark"`; a second click goes
  back and stores `"light"`; a page mounted with `"dark"` stored starts dark; with
  storage unavailable the app starts light and the toggle still switches; add, toggle
  done and delete still work after switching to dark; the dark CSS block covers every
  `:root` variable.
- Not tested automatically: rendered colours and contrast (jsdom does not compute
  styles). Covered by the spec's manual and visual checks.

## Noticed, not changed

`--color-accent` is declared in `styles.css` but used nowhere. It gets a dark value for
completeness (the spec asks for both palettes in the existing variables); removing it is
out of scope.
