# Footer with app version
- **Status:** Draft
- **Keyword:** SAXOPHONE

## Problem
The to-do app has no version indicator visible to the user.

## Outcomes
- Footer displays 'v1.0' in small grey text at the bottom of the page.

## Out of scope
- Version management or dynamic version reading.
- Footer on every page (applies only to the main page structure).

## Constraints
- Footer must use existing CSS variables for colour and typography.
- Must not break existing tests.

## Behaviour
- A `<footer>` element is added to `index.html` after the `<main>` element.
- Footer contains the text 'v1.0'.
- Footer uses CSS variable `--color-muted` for text colour.
- Font size is smaller than body text (e.g. 0.875rem or equivalent).

### Edge cases
| Case | Behaviour |
|------|-----------|
| Very narrow viewport | Footer text remains readable and does not wrap awkwardly. |
| Dark mode (future CSS vars) | Footer uses `--color-muted` so it adapts automatically. |

## Verification
- Footer renders in the browser below the main content.
- 'v1.0' is visible and readable in grey.
- Existing tests still pass (`npm test`).
