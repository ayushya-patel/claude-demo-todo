# Add footer with app version

**Status:** Draft

## Problem
The app currently has no footer. Users have no way to see what version of the app they are running.

## Outcomes
- A footer appears at the bottom of the page showing the app version (1.0.0) from package.json in small, muted grey text under 12px
- The footer version text is visible on every page load
- 100% test coverage is maintained (all code paths tested)

## Out of scope
- Changing the footer text beyond the version number
- Styling changes outside the footer
- Version auto-detection from other sources

## Constraints
- Version must be read from package.json (currently 1.0.0)
- Footer text must be under 12px (e.g. 11px or smaller)
- Footer styling must use existing CSS variables for consistency
- Must maintain the existing page layout and focus management
- All code must meet the project's 100% test coverage requirement

## Behaviour

The app adds a `<footer>` element to index.html containing the text "v1.0.0" (prefixed with "v"). The footer is:
- Placed after the `<main>` element and before the closing `</body>` tag
- Styled with font-size under 12px (11px recommended)
- Styled with the `--color-muted` CSS variable (grey text) for a subtle appearance
- Centered and padded appropriately to match the page's design
- Populated with the version string from package.json by app.js during mount

### Edge cases

| Case | Behaviour |
|------|-----------|
| Page load | Footer displays "v1.0.0" on initial render with text under 12px |
| Multiple mounts | Footer version remains consistent if mount is called again |
| Missing version | Version string from package.json is always available (hardcoded or imported) |

## Verification
- Navigate to the app and confirm the footer appears at the bottom showing "v1.0.0" in grey text with font-size under 12px
- Run `npm test` and confirm 100% coverage across all metrics (lines, branches, functions)
- Verify the footer styling matches the existing design language