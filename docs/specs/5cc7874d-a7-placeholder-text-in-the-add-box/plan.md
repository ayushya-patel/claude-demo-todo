# Plan — Add placeholder to input

Derived from `spec.md`. This is where implementation details are allowed.

## Approaches considered

The spec fixes the what (`placeholder="What needs doing?"` on `#todo-input` in
`src/index.html`). The approaches differ only in where the attribute comes from and
how it is tested.

### A. Static attribute in `src/index.html`, asserted in the jsdom test (recommended)

Add `placeholder="What needs doing?"` to the existing `<input id="todo-input">` in
`src/index.html`. Add one test to `test/app.test.js` that loads the page through the
existing `setup()` helper and asserts the input's `placeholder` is
`What needs doing?`, and that it is still the same after a task is added (the input is
cleared, so the placeholder shows again).

- For: exactly what the spec's Behaviour and Constraints say; one attribute, no
  script; hiding/showing on typing is native browser behaviour, so there is nothing
  to implement for the edge cases. Follows the existing test pattern (jsdom over the
  real `index.html`, ADR 0001).
- Against: jsdom does not paint, so "visible when empty / hidden when typing" is not
  observed by a test — only that the attribute is present and survives the add flow.
  The repo has no `"e2e"` browser suite to observe it either; that is accepted as
  native behaviour.

### B. Set the placeholder from `app.js` in `mount()`

`mount(document)` assigns `input.placeholder = 'What needs doing?'`.

- For: the text sits next to the other UI wiring.
- Against: contradicts the spec's constraint that the DOM lives in `src/index.html`;
  the placeholder would be missing until the script runs; adds code for something
  HTML does natively.

### C. Static attribute plus a CSS rule for the placeholder colour

As A, plus `#todo-input::placeholder { color: var(--color-muted); }` in
`src/styles.css`.

- For: placeholder colour matches the app's muted palette.
- Against: not asked for by the spec (Surgical changes); the browser default
  placeholder colour is already legible on the default input background. Can be a
  follow-up ticket if design asks for it.

**This plan follows approach A.** Approving the plan picks A; request changes to pick
B or C instead.

## Approach

Approach A: a single static `placeholder` attribute on `#todo-input` in
`src/index.html`, plus a jsdom test in `test/app.test.js`. The existing
`<label for="todo-input">New task</label>` stays the input's accessible name; the
placeholder is a hint, not a replacement for the label. No JavaScript changes, no CSS
changes, no new dependency, nothing expensive to reverse, so no ADR.

## Touched surface

| Path | Change |
|---|---|
| `src/index.html` | modified — `placeholder` attribute on `#todo-input` |
| `test/app.test.js` | modified — one test for the placeholder |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | checked, unchanged — it describes the screen as "add form, task list, count" and does not list input attributes; Consumed by is empty |

## Data

None. The placeholder is static markup; no state, no upstream data.

## Consumed contracts

None.

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| — | — | — | — |

## Entry points

The existing static page `/` (`src/index.html`), served by `npm start`. No new
routes, no server-side change, no failure path.

## Risks

| Risk | Mitigation |
|---|---|
| Placeholder taken as the input's label by assistive tech | The visible `<label for="todo-input">` stays; the test also asserts the label still names the input |
| Visible/hidden behaviour not exercised by a real browser (no `"e2e"` in config) | Native browser behaviour; verified manually in the PR if desired. Test covers presence and that it remains after the input is cleared by an add |

## Test strategy

One test in `test/app.test.js` using the existing `setup()` helper:

- `#todo-input` has `placeholder` `What needs doing?` on mount;
- after adding a task the input value is `''` and the placeholder is unchanged
  (covers the "Text cleared → placeholder returns" edge case as far as jsdom can);
- the input's label is still `New task`.

It goes red if the attribute is removed or its text changed. `npm test` keeps its
100 % coverage thresholds (no `src/**/*.js` change). Painting of the placeholder is
not tested (jsdom does not render).
