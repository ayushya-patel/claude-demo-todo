# Add dark mode toggle with persistent choice

- **Status:** Draft

## Problem

Users want to switch between light and dark themes in the to-do app. Their theme preference should persist across sessions so they don't have to toggle it every time they return.

## Outcomes

- A dark mode toggle appears in the header
- Clicking the toggle switches between light and dark themes
- The user's theme choice is saved and restored on page reload
- Dark mode uses the existing CSS variable structure for colours

## Out of scope

- Syncing theme preference across devices or browsers
- Auto-detection of system theme preference
- Multiple theme options beyond light/dark
- Changing the app's layout or structure beyond the header toggle

## Constraints

- Vanilla JavaScript only (no frameworks)
- Theme preference stored in localStorage
- CSS variables in styles.css define light and dark palettes
- Toggle control must be placed in the header
- All existing to-do features (add, mark done, delete, count) must work in both themes

## Behaviour

### Header toggle
- A toggle button or switch appears in the header (visual style to be determined by design)
- Toggle label or icon clearly indicates light/dark mode
- Clicking the toggle switches the current theme immediately
- Theme change applies to the entire page

### Persistent storage
- When user toggles theme, the choice is saved to localStorage with key `theme` (value: "light" or "dark")
- On page load, the saved theme preference is read from localStorage and applied
- If no saved preference exists, default to light theme
- Clearing browser data (or localStorage) resets to light theme on next load

### Visual changes
- Dark mode inverts the colour scheme using existing CSS variables
- All task elements, input field, buttons, and count display update colours
- Toggle control remains visible and usable in both themes

### Existing behaviour unchanged
- Add task, mark done, delete task, and count display work identically in light and dark modes
- All existing functionality continues to work
- No changes to task logic or interactions

### Edge cases

| Scenario | Behaviour |
|---|---|
| Toggle theme, then reload page | Saved theme preference is applied |
| Open app in new tab after setting dark mode | New tab loads with dark mode if localStorage is shared |
| Toggle rapidly between light and dark | No lag; theme switches smoothly each time |
| localStorage is full or disabled | App still works in light mode (saved preference unavailable, but core features functional) |
| Add/delete/toggle tasks in dark mode | All operations work as before; colours update correctly |

## Verification

- `npm test` passes (no changes to core to-do logic tests)
- Manual test: load page in light mode, toggle to dark mode, reload page, verify dark mode persists
- Manual test: toggle to light mode, reload, verify light mode persists
- Manual test: clear localStorage, reload, verify default light mode applies
- Manual test: add tasks, mark done, delete tasks in both light and dark modes; verify all features work
- Visual check: toggle between themes, confirm all elements are visible and readable in both modes

## Contracts

See [`./contracts/provides.md`](./contracts/provides.md) and [`./contracts/requires.md`](./contracts/requires.md).
Still one static screen with no API, no network calls and no environment variables; the only new boundary is the saved theme in local storage, which degrades to light when missing or unavailable.
