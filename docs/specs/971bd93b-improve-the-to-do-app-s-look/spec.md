# Improve the to-do app's look

- **Status:** Draft

## Problem

The to-do app works, but it looks plain and unfinished. The client wants it to feel polished and pleasant to use, in an iPhone-like "liquid glass" style. What the app does must not change: adding a task, marking it done, deleting it and the completed count all stay the same.

## Outcomes

- The app matches the chosen design, `designs/round-2/option-b.html` ("Dark glass"): smoky glass panels over a deep, glowing background with neon-coloured blobs.
- Adding, marking done, deleting and the "X of Y completed" count work and read exactly as they do today.
- A progress bar under the title shows how many tasks are done at a glance.
- Each task floats as its own glass pill in a list.
- An empty list shows a friendly message instead of a blank space.
- Text stays readable, and keyboard and screen-reader use is at least as good as today.

## Out of scope

- Any change to what the app does: no editing tasks, saving tasks between visits (persistence), filters, reordering or due dates (ticket: "without changing what it does").
- A light mode or theme switcher (assumption).
- New animations or transitions beyond what the design shows (assumption).
- Options A and C from round 2 (not chosen).

## Constraints

- Plain JavaScript with no framework. Logic stays in `src/todo.js`, page wiring in `src/app.js`, and every colour is a CSS variable in `src/styles.css`.
- No external resources: no web fonts, images or CDNs. The background, glass effect and progress bar are CSS only. Fonts use the system stack (`-apple-system, BlinkMacSystemFont, system-ui, sans-serif`).
- The page keeps its existing ids and structure, which the current tests use: `#todo-form`, `#todo-input`, the submit button, `#todo-list` holding `li > label > input[type=checkbox] + span` plus a `button` reading "Delete", `#todo-count`, and the `done` class.
- Every existing test in `test/` passes without being changed. `npm test` stays the test command.
- Body text, task text and the count meet WCAG AA contrast (4.5:1) against the dark glass as it is drawn. Where a colour in the design falls short, it is lightened just enough to pass, and that difference is allowed.

## Behaviour

### Visual design
- The build must match `designs/round-2/option-b.html` (Dark glass): a very dark background with three large glowing blobs (purple, pink, orange) placed behind a dark glass card. The card holds a big title, a progress bar under it, the input form, and a list of individual task pills. Text is very light on dark.
- The "Empty list preview" caption and the second card in the design file only illustrate the empty state. They are not built as separate elements.
- The input shows the placeholder "Add a new task…".
- The "New task" label is hidden on screen but still read by screen readers, so the input keeps its accessible name.
- Focus rings stay visible: a cyan outline on the input, checkboxes and buttons.

### Progress bar
- A thin horizontal bar sits under the title and count, above the form.
- The bar's filled portion (blue-to-cyan gradient with a glow) grows from 0 to 100% width as completed tasks increase. With no tasks it shows a 0% bar.
- It updates on every add, toggle and delete, at the same moment as the count text.
- It is hidden from screen readers (`aria-hidden="true"`). The existing `#todo-count` line, with its `aria-live` announcement, remains the accessible count.
- The calculation is a pure function in `todo.js` that returns 0 when the total is 0, and `app.js` applies the result.

### Task list
- Each task floats as its own glass pill (rounded rectangle with a subtle border and inset highlight) separated by a small gap.
- Checkboxes are round and green when checked (with a glow).
- Delete buttons are small red-tinted pills.
- There is no line dividing tasks; each is a standalone card.

### Empty state
- When there are no tasks, instead of an empty list, the area shows "Nothing here yet — add your first task above." in muted text, with the count line still showing "0 of 0 completed".
- The message is its own element outside `#todo-list`, so the list never contains a non-task `li`. It is hidden as soon as a task exists and shown again when the last task is deleted.

### Unchanged behaviour
- Add (with the button or Enter), trimming, rejecting blank text, clearing the input, toggling, deleting, the count wording and the focus rules after toggle and delete all stay exactly as they are today.

### Edge cases

| Scenario | Behaviour |
|---|---|
| No tasks (first load, or after deleting all) | Empty-state message shows. Progress bar shows 0%. Count reads "0 of 0 completed". |
| All tasks done | Progress bar is 100% full and glowing. Count reads "Y of Y completed". |
| Very long task text or a single long word | Text wraps inside the pill. Checkbox and Delete keep their size, and Delete stays at the right. Nothing overflows the card. |
| Many tasks (20+) | The card grows and the page scrolls. The background (blobs and dark base) stays fixed behind the card. |
| Narrow screen (360px wide) | The card fits with side margins and no horizontal scroll. Input and Add stay on one row. |
| Browser without `backdrop-filter` support | Glass surfaces fall back to a darker semi-opaque shade, so text stays readable. |
| User has asked for reduced transparency (`prefers-reduced-transparency: reduce`) | Glass surfaces are drawn nearly solid, with the same layout. |
| Task text containing markup | Still shown as plain text, as today. |
| Windows high-contrast mode (`forced-colors`) | Checkboxes and buttons stay visible and usable. |

## Verification

- `npm test` passes with every existing test unchanged.
- New unit test (`todo.js`): the progress function returns 0 for 0 of 0, 0.4 for 2 of 5 and 1 for 5 of 5.
- New DOM tests (`app.js`):
  - On mount, the empty-state message is visible and the progress bar is at 0%.
  - After an add, the message is hidden and the progress bar shows 0/total (about 0%).
  - After a toggle, the progress bar grows (e.g., 0.2 for 1 of 5).
  - After deleting the last task, the message is visible again and the bar is at 0%.
  - The progress bar has `aria-hidden="true"`.
  - The input has the placeholder "Add a new task…" and is still labelled "New task".
- Manual check in Chrome and Safari:
  - Compare side by side with `designs/round-2/option-b.html`.
  - Add 5 tasks, mark 2 done, and confirm the progress bar is about 40% full, glowing, and the count reads "2 of 5 completed".
  - Delete all tasks and confirm the empty state shows and the bar is at 0%.
  - Go through everything with the keyboard only and confirm focus rings (cyan) are visible.
  - Check at 360px wide.
- Check contrast with a contrast tool for task text, done text, the count and the empty-state message over the dark glass card.
