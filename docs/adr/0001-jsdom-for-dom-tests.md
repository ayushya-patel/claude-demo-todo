# 0001. jsdom as the DOM for integration tests

**Status:** Proposed · **Date:** 2026-10-08

## Context

The to-do app ([spec](../specs/00000000-build-a-basic-to-do-app/spec.md)) is vanilla
JavaScript with its DOM wiring in `src/app.js`, and the spec requires automated tests
run by `npm test` on the Node test runner with 100 % coverage of both `todo.js` and
`app.js`. Node has no DOM, so `app.js` cannot be exercised without one. Whatever
provides it shapes every integration test written from now on, so swapping it later
means rewriting those tests.

A hand-written fake `document` in the test folder was considered: it adds no package,
but it only implements what the tests already assume, so it cannot catch a DOM call a
real browser would reject, and it grows into a second, untested DOM with every UI
change. happy-dom was considered: it is faster, but it is less complete in form and
event behaviour (the app relies on form `submit` for Enter-to-add) and jsdom is the
more widely understood default. A real browser runner (Playwright) was considered:
the most faithful, but heavy to install and run for a single static screen, and the
spec asks for unit and integration tests, not an end-to-end suite.

## Decision

We use jsdom as a **dev dependency** only. Integration tests load `src/index.html`
into a jsdom window, call `mount(document)` from `src/app.js`, and drive the page with
real DOM events. Nothing in `src/` imports jsdom; the app ships with zero runtime
dependencies.

## Consequences

Integration tests use a standards-based DOM, so they catch wrong DOM calls a fake
would hide, and `app.js` stays free of test hooks. Costs: one dev dependency with its
transitive tree in `node_modules`, and slower test start-up than a fake. jsdom does
no layout or CSS rendering, so visual state (strikethrough, focus ring) is checked
manually in a browser. If jsdom becomes a burden, moving to happy-dom is a change to
the test setup file and little else; moving to a browser runner means rewriting the
integration tests as end-to-end tests.
