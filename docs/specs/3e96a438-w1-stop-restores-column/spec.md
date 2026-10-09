# Add a footer showing open to-do count

- **Status:** Draft

## Problem

The to-do app has no indicator of how many tasks remain incomplete. Users need a quick way to see the count of open to-dos.

## Outcomes

- A footer appears at the bottom of the to-do app
- The footer displays the number of open (incomplete) to-dos in a concise format, e.g. "3 left"
- The count updates automatically when to-dos are added, marked complete, or deleted

## Out of scope

- Changes to the main to-do list display
- Styling beyond keeping the footer minimal and unobtrusive
- Filtering or sorting by to-do status

## Constraints

- Keep the footer tiny (minimal size and styling)
- Must work with the existing vanilla JavaScript architecture (todo.js for logic, app.js for DOM wiring)
- No framework dependencies

## Behaviour

The footer element displays at the bottom of the app and shows the count of incomplete to-dos. The count updates in real time as the to-do list changes (items added, marked complete, or deleted).

The footer text format is: "{count} left" where count is the number of to-dos with `completed: false`.

### Edge cases

| Case | Behaviour |
|------|-----------|
| No to-dos exist | Footer shows "0 left" |
| All to-dos are complete | Footer shows "0 left" |
| Some to-dos are complete | Footer shows only the count of incomplete items |
| To-do is marked complete | Count decreases and footer updates immediately |
| To-do is marked incomplete | Count increases and footer updates immediately |
| New to-do is added | Count increases and footer updates immediately |
| To-do is deleted | Count decreases and footer updates immediately |

## Verification

- Footer element is present in the DOM at page load
- Footer displays the correct count of incomplete to-dos
- Footer count updates in real time as to-do states change (add, complete, delete, uncheck)
- Footer is visually minimal and does not distract from the main to-do list
- No console errors occur during normal use