# Improve the to-do app's look

- **Status:** Draft

## Problem

The to-do app works, but it looks plain and unfinished. The client wants it to feel polished and pleasant to use, in an iPhone-like "liquid glass" style. What the app does must not change: adding a task, marking it done, deleting it and the completed count all stay the same.

## Outcomes

- The app matches the chosen design, `designs/round-2/option-c.html` ("iOS Reminders style"): it looks like a native iPhone Reminders app, with a big left-aligned title, the count under it, a single grouped list, and an input bar pinned to the bottom.
- Adding, marking done, deleting and the "X of Y completed" count work and read exactly as they do today.
- Each task sits in a single inset grouped list (like iOS Settings or Reminders).
- The new-task input lives in a floating glass bar at the bottom of the screen.
- An empty list shows a friendly message instead of a blank space.
- Text stays readable, and keyboard and screen-reader use is at least as good as today.

## Out of scope

- Any change to what the app does: no editing tasks, saving tasks between visits (persistence), filters, reordering or due dates (ticket: "without changing what it does").
- A dark mode or theme switcher (assumption).
- New animations or transitions beyond what the design shows (assumption).
- Options A and B from round 2 (not chosen).

## Constraints

- Plain JavaScript with no framework. Logic stays in `src/todo.js`, page wiring in `src/app.js`, and every colour is a CSS variable in `src/styles.css`.
- No external resources: no web fonts, images or CDNs. The background, glass effect and separators are CSS only. Fonts use the system stack (`-apple-system, BlinkMacSystemFont, system-ui, sans-serif`).
- The page keeps its existing ids and structure, which the current tests use: `#todo-form`, `#todo-input`, the submit button, `#todo-list` holding `li > label > input[type=checkbox] + span` plus a `button` reading "Delete", `#todo-count`, and the `done` class.
- Every existing test in `test/` passes without being changed. `npm test` stays the test command.
- Body text, task text and the count meet WCAG AA contrast (4.5:1) against the glass and background as drawn. Where a colour in the design falls short, it is darkened just enough to pass, and that difference is allowed.

## Behaviour

### Visual design
- The build must match `designs/round-2/option-c.html` (iOS Reminders style): a light background with soft colour gradients, a large title at the top, the count under it, a single grouped list of tasks in a glass card, and an input bar fixed to the bottom of the screen.
- The "Empty list preview" caption and the empty-state div in the design file only illustrate the empty state. They are not built as separate elements.
- The input shows the placeholder "New reminder…".
- The "New task" label is hidden on screen but still read by screen readers, so the input keeps its accessible name.
- Focus rings stay visible: a 3px blue outline on the input, checkboxes and buttons. On the input, the outline sits inside (offset -2px) so it doesn't cover the rounded edges.

### Layout
- The title and count sit at the top with plenty of space above them.
- The task list is a single grouped card (rounded rectangle with a glass background, thin border and shadow).
- Tasks are rows with thin dividers; the last task has no divider below.
- The input form is fixed to the bottom of the screen, centred, with space around it. It stays visible as the list scrolls.

### Task list
- Each task is a row with a round checkbox (light border, filled with blue when checked), task text, and a Delete button.
- Checked tasks are muted and struck through.
- Delete buttons are small, red text on a transparent background, with a light red tint on hover.

### Empty state
- When there are no tasks, instead of an empty list, the area shows "Nothing here yet — add your first task below." in muted text, with the count line still showing "0 of 0 completed".
- The message is its own element outside `#todo-list`, so the list never contains a non-task `li`. It is hidden as soon as a task exists and shown again when the last task is deleted.

### Unchanged behaviour
- Add (with the button or Enter), trimming, rejecting blank text, clearing the input, toggling, deleting, the count wording and the focus rules after toggle and delete all stay exactly as they are today.

### Edge cases

| Scenario | Behaviour |
|---|---|
| No tasks (first load, or after deleting all) | Empty-state message shows. Count reads "0 of 0 completed". |
| All tasks done | All tasks are muted and struck through. Count reads "Y of Y completed". |
| Very long task text or a single long word | Text wraps inside the row. Checkbox and Delete keep their size, and Delete stays at the right. |
| Many tasks (20+) | The list grows and the page scrolls. The title and input bar stay in their fixed positions (title at top, input at bottom). |
| Narrow screen (360px wide) | The list fits with side margins and no horizontal scroll. The input bar shrinks to fit. |
| Browser without `backdrop-filter` support | Glass surfaces fall back to a semi-opaque white, so text stays readable. |
| User has asked for reduced transparency (`prefers-reduced-transparency: reduce`) | Glass surfaces are drawn nearly solid, with the same layout. |
| Task text containing markup | Still shown as plain text, as today. |
| Windows high-contrast mode (`forced-colors`) | Checkboxes and buttons stay visible and usable. |

## Verification

- `npm test` passes with every existing test unchanged.
- New DOM tests (`app.js`):
  - On mount, the empty-state message is visible and the count reads "0 of 0 completed".
  - After an add, the message is hidden and the count reads "0/1".
  - After a toggle, the count reads "1/1".
  - After deleting the last task, the message is visible again.
  - The input has the placeholder "New reminder…" and is still labelled "New task".
  - The input bar has `position: fixed` (confirmed in computed styles).
  - Delete buttons do not have a `del` class (unlike earlier options).
- Manual check in Chrome and Safari:
  - Compare side by side with `designs/round-2/option-c.html`.
  - Add 5 tasks, mark 2 done, verify the count reads "2 of 5 completed", and scroll the list to confirm the title stays at the top and the input bar stays at the bottom.
  - Delete all tasks and confirm the empty state shows.
  - Go through everything with the keyboard only and confirm blue focus outlines are visible on all interactive elements.
  - Check at 360px wide, especially the input bar width.
- Check contrast with a contrast tool for task text, done text and the count over the glass card.
