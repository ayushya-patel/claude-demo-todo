# Make the to-do list load faster

- **Status:** Draft

## Problem

The to-do app's list rendering is slow when displaying many tasks. Initial page load and DOM updates after user actions (add, toggle, delete) can be sluggish, degrading the user experience.

## Outcomes

- List renders faster on page load
- DOM updates after add/toggle/delete actions are faster
- App remains responsive with large task lists (50+ tasks)
- All existing features and tests continue to work

## Out of scope

- Adding new features (dates, priority, categories, etc.)
- Changing the app's visual design or user interface
- Persistence or data storage
- Mobile-specific optimizations

## Constraints

- Vanilla JavaScript only (no frameworks)
- Must not break existing functionality or test coverage
- Logic stays isolated in todo.js, DOM wiring in app.js
- CSS variables in styles.css remain unchanged

## Behaviour

### Performance improvements
- List rendering uses efficient DOM methods to minimize repaints and reflows
- Only necessary DOM nodes are created and destroyed
- Event listeners are managed efficiently
- CSS selectors are optimized for fast element lookups

### Existing behaviour unchanged
- Add task, mark done, delete task, and count display work exactly as before
- Edge cases (whitespace rejection, rapid clicks, etc.) behave the same
- Visual appearance and user interactions remain identical
- Test suite passes without modification

### Edge cases

| Scenario | Behaviour |
|---|---|
| Load page with no tasks | List renders instantly |
| Add 100 tasks rapidly | No lag or visible stutter |
| Toggle done on task in large list | Checkbox updates smoothly |
| Delete multiple tasks in sequence | DOM updates without flickering |
| Focus management during rapid actions | Focus moves correctly as before |

## Verification

- `npm test` passes with no changes to test assertions
- Manual test: load page, add 50 tasks, verify no visible lag
- Manual test: toggle done/undone on various tasks in large list, verify smooth response
- Performance profiling: measure render time before/after, confirm improvement
- All existing manual tests from original spec still pass

## Contracts

No changes to contracts — `provides.md` and `requires.md` remain the same. Still one static screen with no API; still requires nothing upstream.