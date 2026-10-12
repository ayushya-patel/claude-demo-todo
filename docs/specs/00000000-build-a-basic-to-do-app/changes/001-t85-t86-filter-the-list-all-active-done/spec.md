# Filter the list: All, Active, Done

- **Status:** Draft

## Problem

Users need to focus on either incomplete or completed tasks, and they need the app to remember their filter preference across sessions.

## Outcomes

- Users can filter the visible task list by All, Active (incomplete), or Done (completed) tasks
- The chosen filter persists after a page reload using localStorage
- The "N tasks left" count always displays the number of incomplete tasks, regardless of which filter is active
- Filter buttons are accessible and clearly indicate the active filter

## Out of scope

- Filtering by tags, priority, or custom categories
- Keyboard shortcuts to switch filters
- Animated transitions between filters

## Constraints

- Filter state stored in localStorage under key `todoFilter`
- Filter buttons added below the list in index.html
- No changes to todo.js logic (filter is a display-only concern)
- Filter choices: `all`, `active`, `done`

## Behaviour

### Filter buttons
- Three buttons displayed below the list: "All", "Active", "Done"
- Active filter button has a visual indicator (e.g. darker background, underline, or aria-current)
- Clicking a filter button updates the displayed list immediately
- Default filter on first load is "All"

### List display
- "All" shows all tasks (completed and incomplete)
- "Active" shows only incomplete tasks
- "Done" shows only completed tasks
- The displayed list updates when a task's done state changes, respecting the current filter

### Persistence
- Filter choice is saved to localStorage whenever a filter button is clicked
- On page reload, the app restores the saved filter and applies it to the list
- If localStorage has no saved filter, default to "All"
- If localStorage is unavailable, app still functions with "All" as the only option

### Task count
- The "N of Y completed" count always reflects all tasks in the full list, not just filtered ones
- The count updates whenever a task's state changes, regardless of active filter

### Edge cases

| Scenario | Behaviour |
|---|---|
| User clicks a filter button multiple times | No re-renders; state is stable |
| User adds a task while "Done" filter is active | New task appears in list if filter is "All", otherwise remains hidden until added task is marked done |
| User marks all tasks as done while "Active" filter is active | List becomes empty; "All" filter shows all tasks, "Done" shows all tasks |
| User adds then deletes all tasks | Count shows "0 of 0", all filter views are empty |
| localStorage is disabled or full | App functions with "All" as the active filter; no persistence occurs |
| User switches tabs, returns, and filter has changed | App loads with the saved filter applied |

## Verification

- Unit tests verify: filter button clicks update displayed list, localStorage is read/written correctly, count always shows incomplete tasks
- Integration tests verify: adding/toggling/deleting tasks respects the active filter, filter persists across page reloads
- Manual test: 
  1. Add 5 tasks, mark 2 as done
  2. Click "Done" filter, verify only 2 tasks show
  3. Click "Active" filter, verify 3 tasks show
  4. Reload the page, verify "Active" filter is still active
  5. Click "All" filter, verify count shows "2 of 5 completed"

## Contracts

- **Provides:** filtered list view with persistent filter state
- **Requires:** browser localStorage API (gracefully degrades if unavailable)