# Add dark mode to the to-do app

- **Status:** Draft

## Problem

Users work on the to-do app at night and find the bright page harsh on the eyes. They need a dark mode option for comfortable evening use.

## Outcomes

- Users can toggle between light and dark themes with a visible control
- Dark mode uses a softer charcoal palette to reduce eye strain
- The toggle state persists and is instantly visible across the page

## Out of scope

- System preference detection (prefers-color-scheme)
- Automatic theme switching based on time of day
- Per-task or per-section theme overrides

## Constraints

- Must work with the existing vanilla JS architecture (no framework)
- CSS variables in styles.css define all colours; dark mode reuses this system
- Toggle must be accessible and keyboard-navigable
- No external libraries or APIs

## Behaviour

The app displays a sun/moon icon button in the top-right corner of the page. Clicking it toggles between light and dark themes. The icon changes to reflect the current state (moon for light mode, sun for dark mode).

In dark mode:
- Background: `#1a1a1a` (charcoal)
- Text: `#f0f0f0` (light gray)
- Muted text: `#a0a0a0` (mid gray)
- Borders: `#404040` (dark gray)
- Accent and focus remain blue (`#0b5fff`)

The toggle button itself is styled to be visible in both themes, with appropriate contrast. The current theme state is stored in a `data-theme` attribute on the `<html>` element, allowing CSS to switch all colour variables via attribute selector or class.

### Edge cases

| Case | Behaviour |
|------|-----------|
| Page loads | Light mode is default |
| User toggles multiple times | State updates immediately each time |
| User completes/uncompletes task in dark mode | Colours adjust correctly (strikethrough, muted text) |
| Focus on input or button in dark mode | Focus outline remains visible with sufficient contrast |

## Verification

1. Light mode displays all text readable on light gray background
2. Dark mode displays all text readable on charcoal background
3. Toggle button is clearly visible and clickable in both themes
4. Clicking toggle instantly switches all page colours
5. Icon changes to show current state (moon when light, sun when dark)
6. Completed tasks show strikethrough in both themes with appropriate muted colour
7. Focus outlines meet WCAG contrast requirements in both themes
8. Build uses design file: `designs/round-2/option-a.html`