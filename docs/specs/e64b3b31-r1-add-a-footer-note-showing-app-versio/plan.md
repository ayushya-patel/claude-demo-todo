# Plan — Add footer with app version

Derived from `spec.md`. This is where implementation details are allowed.

## Approaches considered

All three approaches share the parts the spec fixes: a `<footer>` after `<main>` in
`src/index.html`, filled with `v<version>` by `mount(document)` in `src/app.js`, styled
in `src/styles.css` at 11px with `var(--color-muted)`, centred and padded, and covered
by `npm test` at 100 %.

The one real choice is **how the browser gets the version from `package.json`**. The
dev server (`scripts/serve.mjs`) serves `src/` only and refuses anything outside it, and
there is no build step, so the browser cannot read `package.json` as things stand.

### A. Version constant in `app.js`, kept equal to `package.json` by a test (recommended)

`src/app.js` holds `const VERSION = '1.0.0';` and `mount` sets the footer's text to
`` `v${VERSION}` ``. `test/app.test.js` reads `package.json` with `readFileSync`, parses
it, and asserts the footer text is `` `v${pkg.version}` ``.

- For: smallest diff (three source files plus tests); no server change, no new browser
  feature, no async work, so no loading or error state. `package.json` stays the
  authority: bumping it without updating `app.js` fails `npm test`, so the two cannot
  ship out of step. The spec's edge-case table allows "hardcoded or imported".
- Against: the value is written twice, and a version bump touches two files (the test
  says so the moment one is missed).

### B. Import `package.json` as a JSON module and let the dev server serve it

`src/app.js` does `import pkg from '../package.json' with { type: 'json' };`.
`scripts/serve.mjs` gains an explicit allow-list entry mapping `/package.json` to the
repo-root file, with a JSON content type.

- For: a single copy of the version, read at runtime.
- Against: widens the dev server's surface beyond `src/` (the traversal guard gets an
  exception and new tests); `../package.json` from `src/` only resolves because of that
  server special case, so any other static host serving `src/` breaks the page;
  JSON import attributes need recent browsers (Chrome 123, Safari 17.2, Firefox 138);
  exposes the whole `package.json` (dependency list) to the browser.

### C. `fetch` `package.json` at mount

As B for the server, but `mount` fetches `/package.json` and fills the footer when it
resolves.

- For: a single copy; no import-attribute browser requirement.
- Against: all of B's server cost, plus async work in `mount` that needs a loading and
  a failure path (and tests for both to keep 100 % branches); the footer is empty until
  the fetch lands, which strains "visible on every page load".

**This plan follows approach A.** Approving the plan picks A; request changes to pick
B or C instead.

## Approach

Approach A.

- **Markup** (`src/index.html`): `<footer id="app-version"></footer>` directly after
  `</main>` and before the module `<script>`. It is empty in the HTML; `mount` fills it.
  It holds no controls, so tab order and focus management are unchanged.
- **Behaviour** (`src/app.js`): a module-level `const VERSION = '1.0.0';`. `mount` looks
  up `#app-version` alongside the other elements and sets
  `textContent = \`v${VERSION}\`` once, before the initial `render()`. Setting
  `textContent` (not appending) makes a second `mount` on the same document leave
  exactly `v1.0.0` (spec edge case "Multiple mounts"). No branch is added: the element
  always exists in `index.html`, so a missing-element fallback would be dead code.
- **Styling** (`src/styles.css`): one new `footer` rule — `text-align: center`,
  `padding: 1rem`, `font-size: 11px`, `color: var(--color-muted)`. `--color-muted` is
  the existing grey already used for done tasks; no new variables. Nothing outside
  the footer changes.

No ADR: every choice here is a few lines in three files and cheap to reverse. No
dependency is added.

## Touched surface

| Path | Change |
|---|---|
| `src/index.html` | modified — `<footer id="app-version">` after `<main>` |
| `src/app.js` | modified — `VERSION` constant; `mount` fills the footer |
| `src/styles.css` | modified — `footer` rule |
| `test/app.test.js` | modified — footer tests (below) |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | modified — the `/` screen now also shows the version footer |
| `docs/specs/e64b3b31-r1-add-a-footer-note-showing-app-versio/contracts/*` | new — this plan's contracts |
| `docs/specs/e64b3b31-r1-add-a-footer-note-showing-app-versio/spec.md` | modified — `## Contracts` pointer now; `## How it works` at ship time |

## Data

| Data | Owner | Shape | Boundary |
|---|---|---|---|
| App version | `package.json` → `version` | semver string, currently `1.0.0` | Mirrored as `VERSION` in `src/app.js`; `test/app.test.js` asserts the rendered footer equals `v` + `package.json`'s `version`, so `npm test` fails on drift. Rendered with `textContent`. |

## Consumed contracts

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| `package.json` → `version` | the repo's `package.json` | `test/app.test.js` (`JSON.parse`) | throw — the test fails, so `npm test` (the check) fails |

## Entry points

| Entry point | Runs | Behaviour on failure |
|---|---|---|
| `src/index.html` (the one screen) | Client-side; the footer is filled synchronously in `mount`, so it shows on every load | No async work and no input, so no failure path. |

The dev server and `npm test` are unchanged.

## Accessibility

- The footer is a `<footer>` landmark (contentinfo) outside `<main>`; it is plain text,
  not focusable, so tab order and the existing focus restoration are untouched.
- `--color-muted` (#6a737d) on `--color-bg` (#f7f7f9) is about 4.5:1. At 11px that
  meets WCAG AA for normal text only marginally; the spec asks for muted grey under
  12px, so this is accepted and noted rather than changed.

## Risks

| Risk | Mitigation |
|---|---|
| `package.json` version bumped, `app.js` forgotten | The footer test compares against `package.json`; `npm test` fails. |
| Font size or colour regresses silently (jsdom does not apply `styles.css` from `<link>`) | A test reads `src/styles.css`, takes the `footer` rule, and asserts a `font-size` in px below 12 and `color: var(--color-muted)`. |
| Footer pushes into the layout of `<main>` | It sits outside `<main>`; only a new `footer` selector is added, no existing rule changes. |

## Test strategy

In `test/app.test.js` (jsdom, existing `setup()`):

- After `mount`, `<footer>` exists, is the next element sibling of `<main>`, and its
  text is `` `v${pkg.version}` `` where `pkg` is `package.json` read and parsed in the
  test (this is also the drift check).
- Calling `mount` a second time on the same document leaves the footer text exactly
  `v1.0.0`-equivalent (`` `v${pkg.version}` ``), not duplicated.
- `src/styles.css` has a `footer` rule with `font-size` in px under 12 and
  `color: var(--color-muted)`.
- The existing tests keep passing unchanged (focus management and layout untouched).

Coverage stays at 100 %: the change adds no branch and no function. Deliberately not
tested: rendered pixel appearance (checked in the spec's manual browser step). No
browser suite: the config has no `"e2e"`.
