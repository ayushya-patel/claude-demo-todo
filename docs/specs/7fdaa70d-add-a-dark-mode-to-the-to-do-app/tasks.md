# Tasks — Add dark mode to the to-do app

Derived from `plan.md` (approach A: new `src/theme.js` module, mounted from
`index.html`). Each task is atomic, independently reviewable, and has one acceptance
check.

**Conventions every task follows** (named once here so implementers do not each pick their own):
Vanilla JavaScript ES modules (`import`/`export`, no CommonJS, no globals), 2-space
indentation, semicolons, single quotes, named exports only. Tests use the Node built-in
runner (`node:test` + `node:assert/strict`) with `jsdom` and live in `test/` as
`<name>.test.js`; the theme tests live in `test/theme.test.js`. No task may add a
dependency, a network call or `innerHTML`. Every colour in `src/styles.css` goes through
a CSS variable (spec constraint). Where the design file
`designs/round-2/option-a.html` and the spec disagree, the spec wins (see plan.md →
Decisions where the design and the spec differ). Comments only where the logic is not
self-evident; no `console.log`. `src/app.js`, `src/todo.js` and their tests are not
changed. Run every `Accept:` from the repo root (`/workspace/repo`).

Ids are `T<number>`, with an optional letter (`T9a`) for a follow-up found mid-build. The
ai-workflow task-pipeline scripts (`waves`, `brief`) read this format: keep `Files:`, `Accept:` and
`Depends on:` as written below, and `Files: none` for a task that touches no file.

- [x] **T1 —** Add the theme markup to `src/index.html`: `<html lang="en" data-theme="light">`; as the first child of `<main>` the button `<button type="button" id="theme-toggle" class="theme-toggle" aria-label="Dark mode" aria-pressed="false">🌙</button>`; `placeholder="Enter a task..."` on `#todo-input`. Do not touch the module script yet. `test/app.test.js` must stay green.
  - Files: `src/index.html`
  - Accept: `grep -q '<html lang="en" data-theme="light">' src/index.html && grep -q '<button type="button" id="theme-toggle" class="theme-toggle" aria-label="Dark mode" aria-pressed="false">🌙</button>' src/index.html && node --test test/app.test.js`
- [x] **T2 —** Create `src/theme.js` exporting `mountThemeToggle(document)` that wires the in-page toggle (no storage yet): on mount it syncs the icon and `aria-pressed` from `document.documentElement.dataset.theme`; on each click it sets `data-theme` to `dark` when it was not `dark` and to `light` otherwise, sets the button text to `☀️` in dark / `🌙` in light and `aria-pressed` to `"true"` in dark / `"false"` in light. The attribute is the only state (no JS variable copy). Add `test/theme.test.js` (jsdom loading `src/index.html`) covering plan.md → Test strategy, first group: initial light state, name "Dark mode" and `type="button"`, one click → dark, second click → light, several rapid clicks alternate, adding and completing a task with `mount` still works in dark (`done` class applied), no `tabindex` on the button.
  - Files: `src/theme.js`, `test/theme.test.js`
  - Accept: `node --test --experimental-test-coverage --test-coverage-include='src/theme.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/theme.test.js`
  - Depends on: T1
- [x] **T3 —** Add `localStorage` persistence to `mountThemeToggle` under key `todo-theme`, exactly as plan.md → Approach → Persistence: on mount read `document.defaultView.localStorage.getItem('todo-theme')` inside `try`/`catch` and set `data-theme="dark"` only if the value is exactly `"dark"`; after each click write the new value inside `try`/`catch`; failures are silent and the toggle keeps working. Add the persistence tests from plan.md → Test strategy to `test/theme.test.js` (jsdom with `url: 'http://localhost/'`; click stores `dark` then `light`; seeded `dark` starts dark with ☀️ and `aria-pressed="true"`; missing or `"blue"` starts light; `about:blank` window where storage throws starts light and still toggles; a stubbed throwing `setItem` does not stop the toggle).
  - Files: `src/theme.js`, `test/theme.test.js`
  - Accept: `node --test --test-name-pattern='todo-theme' test/theme.test.js && node --test --experimental-test-coverage --test-coverage-include='src/theme.js' --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100 test/theme.test.js`
  - Depends on: T2
- [x] **T4 —** Wire the toggle on the page: in the module script of `src/index.html`, import `mountThemeToggle` from `./theme.js` and call `mountThemeToggle(document)` next to `mount(document)`.
  - Files: `src/index.html`
  - Accept: `grep -q "import { mountThemeToggle } from './theme.js';" src/index.html && grep -q 'mountThemeToggle(document);' src/index.html`
  - Depends on: T2
- [x] **T5 —** Add the dark palette to `src/styles.css`: `:root` gains `--color-on-accent: #ffffff` and `color-scheme: light`; a new `html[data-theme="dark"]` block sets `--color-bg: #1a1a1a`, `--color-text: #f0f0f0`, `--color-muted: #a0a0a0`, `--color-border: #404040`, `--color-accent: #0b5fff`, `--color-focus: #0b5fff`, `--color-on-accent: #ffffff` and `color-scheme: dark`. Add palette tests to `test/theme.test.js` whose names contain `styles.css`, reading the file as text: the dark block defines those values, and no hex colour or `white` appears outside the `:root` and `html[data-theme="dark"]` blocks.
  - Files: `src/styles.css`, `test/theme.test.js`
  - Accept: `node --test --test-name-pattern='styles.css' test/theme.test.js`
  - Depends on: T3
- [x] **T6 —** Restyle `src/styles.css` to the design file `docs/specs/7fdaa70d-add-a-dark-mode-to-the-to-do-app/designs/round-2/option-a.html` (layout and styling only, colours only through variables): `main` `position: relative`; `.theme-toggle` absolutely positioned top-right (`top: 1rem; right: 1rem`), transparent background, no border, 1.5rem font, padding, radius, `:hover` background `var(--color-border)` (no dark-only hover override with a hard-coded colour); `h1` margin; column form with gap; label weight; padded rounded text input on `--color-bg`/`--color-text`; Add button on `--color-accent` with `color: var(--color-on-accent)`; outlined muted list Delete buttons; checkbox size; `#todo-list label { flex: 1 }`; muted small `#todo-count`; 0.2s background/colour transitions. Keep the existing `.done` rule and the `input:focus-visible, button:focus-visible` outline rule.
  - Files: `src/styles.css`
  - Accept: `grep -q '\.theme-toggle' src/styles.css && grep -q 'position: absolute' src/styles.css && grep -q 'var(--color-on-accent)' src/styles.css && node --test --test-name-pattern='styles.css' test/theme.test.js`
  - Depends on: T5
- [x] **T7 —** Update `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`: the `/` and `/index.html` row also renders the sun/moon theme toggle (added by `7fdaa70d-add-a-dark-mode-to-the-to-do-app`), the Output row lists `theme.js`, and the Input section notes the theme toggle click and the browser-local `todo-theme` preference (never sent anywhere).
  - Files: `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`
  - Accept: `grep -q 'theme toggle' docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md && grep -q 'theme.js' docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`

- [x] **T8 —** Give the text input a border that meets WCAG 1.4.11 (3 : 1) in both themes: in `src/styles.css` the `input[type="text"]` rule uses `border: 1px solid var(--color-muted)` (≈ 4.5 : 1 on light `#f7f7f9`, ≈ 6.7 : 1 on dark `#1a1a1a`) instead of `--color-border`. Add a test in `test/theme.test.js` named `styles.css: text input border uses --color-muted`. (Found by the whole-diff review.)
  - Files: `src/styles.css`, `test/theme.test.js`
  - Accept: `node --test --test-name-pattern='text input border' test/theme.test.js`
- [x] **T9 —** Keep button text at ≥ 4.5 : 1 on hover: in `src/styles.css` remove the `opacity` hover fades; `#todo-list button:hover` sets `color: var(--color-text)` and `border-color: var(--color-muted)`, and `button[type="submit"]:hover` sets `text-decoration: underline` (drop the `opacity` transitions those rules no longer need). Add a test in `test/theme.test.js` named `styles.css: no opacity in any rule`. (Found by the whole-diff review.)
  - Files: `src/styles.css`, `test/theme.test.js`
  - Accept: `node --test --test-name-pattern='no opacity' test/theme.test.js`
  - Depends on: T8
- [x] **T10 —** Update the `## Consumed by` table in `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`: replace the "Nothing consumes this module" row with a row whose Module cell is exactly `7fdaa70d-add-a-dark-mode-to-the-to-do-app`, Depends on "/ and /index.html (the to-do screen) and the colour variables in styles.css", Why "extends the screen with the theme toggle and the dark palette". (Found by the spec audit and the review.)
  - Files: `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`
  - Accept: `grep -q '| 7fdaa70d-add-a-dark-mode-to-the-to-do-app |' docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md && ! grep -q 'Nothing consumes this module' docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md`
- [x] **T11 —** Widen the `styles.css` "no hard-coded colour" test in `test/theme.test.js` so that, outside the `:root` and `html[data-theme="dark"]` blocks, it also rejects `rgb(`/`rgba(`/`hsl(`/`hsla(` and named colour keywords used as whole-word values (at least `white`, `black`, `red`, `green`, `blue`, `gray`, `grey`, `silver`; but not `transparent`, `currentColor`, `inherit`, or words inside identifiers such as `white-space`). Add one test named `styles.css: colour guard rejects rgb() and named colours` that runs the guard on a small inline CSS sample and asserts it flags them. (Found by the whole-diff review.)
  - Files: `test/theme.test.js`
  - Accept: `node --test --test-name-pattern='colour guard' test/theme.test.js`
  - Depends on: T9

Outcome coverage: "toggle between light and dark with a visible control" → T1, T2, T4,
T6; "softer charcoal palette" → T5; "state persists and is instantly visible across the
page" → T3 (persists), T2 + T5 (instant switch of every colour variable).

## Done when

All tasks above checked and the definition of done (ai-workflow plugin `law/definition-of-done.md`) satisfied.
`spec.md` stays byte-identical to the approved commit.

## Deferred

- [ ] **D2 —** Suppress the 0.2s body colour transition on the first theme sync after a reload (e.g. a `theme-ready` class added by `mountThemeToggle`).
  - Why deferred: raised by the whole-diff review as inferred, not observed; it only affects the reload flash already accepted in plan.md → Risks and deferred as D1, and would add state and CSS for a cosmetic edge.
  - Revisit when: D1 is picked up, or the animated flash is observed in a real browser.
  - Cost to add later: low — one class toggle in `src/theme.js`, scoped transitions in `src/styles.css`, one test.

- [ ] **D1 —** Remove the brief light flash on reload when dark is saved (blocking inline `<head>` script).
  - Why deferred: the script would sit outside the `src/**/*.js` 100 % coverage gate (plan.md → Risks); the page is tiny so the flash is rarely visible.
  - Revisit when: users report a visible flash, or the page grows enough that the module script runs after first paint.
  - Cost to add later: low — one small inline script reading `todo-theme`, plus a way to test it.
