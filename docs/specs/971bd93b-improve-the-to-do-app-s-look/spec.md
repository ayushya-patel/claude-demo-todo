# Improve the to-do app's look

- **Status:** Draft

## Problem

The to-do app works, but it looks plain and unfinished. The client wants it to feel polished and pleasant to use, in an iPhone-like "liquid glass" style. What the app does must not change: adding a task, marking it done, deleting it and the completed count all stay the same.

## Outcomes

- The app matches the chosen design, `designs/round-2/option-a.html` ("Light glass"): a frosted, see-through glass card over a soft pastel background.
- Adding, marking done, deleting and the "X of Y completed" count work and read exactly as they do today.
- A progress ring next to the title shows how many tasks are done at a glance.
- An empty list shows a friendly message instead of a blank space.
- Text stays readable, and keyboard and screen-reader use is at least as good as today.

## Out of scope

- Any change to what the app does: no editing tasks, saving tasks between visits (persistence), filters, reordering or due dates (ticket: "without changing what it does").
- A dark mode or theme switcher (assumption).
- New animations or transitions beyond what the design shows (assumption).
- Options A–C from round 1 and options B and C from round 2 (not chosen).

## Constraints

- Plain JavaScript with no framework. Logic stays in `src/todo.js`, page wiring in `src/app.js`, and every colour is a CSS variable in `src/styles.css`.
- No external resources: no web fonts, images or CDNs. The background, glass effect and ring are CSS only. Fonts use the system stack (`-apple-system, BlinkMacSystemFont, system-ui, sans-serif`).
- The page keeps its existing ids and structure, which the current tests use: `#todo-form`, `#todo-input`, the submit button, `#todo-list` holding `li > label > input[type=checkbox] + span` plus a `button` reading "Delete", `#todo-count`, and the `done` class.
- Every existing test in `test/` passes without being changed. `npm test` stays the test command.
- Body text, task text and the count meet WCAG AA contrast (4.5:1) against the glass as it is drawn. Where a colour in the design falls short, it is darkened just enough to pass, and that difference is allowed.

## Behaviour

### Visual design
- The build must match `designs/round-2/option-a.html` (Light glass): its layout, spacing, rounded corners, glass card, pastel background with blurred colour blobs, capsule input, blue gradient Add button, the grouped list with thin dividers, round iOS-blue checkboxes, Delete buttons as red text in a glass pill, and the count centred under the list.
- The "Empty list preview" caption and the second card in the design file only illustrate the empty state. They are not built as separate elements.
- The input shows the placeholder "Add a new task…".
- The "New task" label is hidden on screen but still read by screen readers, so the input keeps its accessible name.
- Focus rings stay visible: a 3px blue outline on the input, checkboxes and buttons.

### Progress ring
- The ring sits to the right of the "To-do" title and shows `completed/total` in its centre (for example `2/5`).
- The blue arc fills in proportion to completed ÷ total. With no tasks it shows `0/0` and an empty arc.
- It updates on every add, toggle and delete, at the same moment as the count text.
- It is hidden from screen readers (`aria-hidden="true"`). The existing `#todo-count` line, with its `aria-live` announcement, remains the accessible count.
- The calculation is a pure function in `todo.js` that returns 0 when the total is 0, and `app.js` applies the result.

### Empty state
- When there are no tasks, the list area shows "Nothing here yet — add your first task above." in muted text, with the count line still showing "0 of 0 completed".
- The message is its own element outside `#todo-list`, so the list never contains a non-task `li`. It is hidden as soon as a task exists and shown again when the last task is deleted.

### Unchanged behaviour
- Add (with the button or Enter), trimming, rejecting blank text, clearing the input, toggling, deleting, the count wording and the focus rules after toggle and delete all stay exactly as they are today.

### Edge cases

| Scenario | Behaviour |
|---|---|
| No tasks (first load, or after deleting all) | Empty-state message shows. Ring reads `0/0` with an empty arc. Count reads "0 of 0 completed". |
| All tasks done | Ring is a full circle and reads `Y/Y`. Count reads "Y of Y completed". |
| Very long task text or a single long word | Text wraps inside the row. Checkbox and Delete keep their size, and Delete stays at the right. Nothing overflows the card. |
| Many tasks (20+) | The card grows and the page scrolls. The background stays fixed behind the card. |
| Narrow screen (360px wide) | The card fits with side margins and no horizontal scroll. Input and Add stay on one row. |
| Browser without `backdrop-filter` support | Glass surfaces fall back to a near-opaque white, so text stays readable. |
| User has asked for reduced transparency (`prefers-reduced-transparency: reduce`) | Glass surfaces are drawn near-opaque, with the same layout. |
| Task text containing markup | Still shown as plain text, as today. |
| Windows high-contrast mode (`forced-colors`) | Checkboxes and buttons stay visible and usable. |

## Verification

- `npm test` passes with every existing test unchanged.
- New unit test (`todo.js`): the progress function returns 0 for 0 of 0, 0.4 for 2 of 5 and 1 for 5 of 5.
- New DOM tests (`app.js`):
  - On mount, the empty-state message is visible and the ring reads `0/0`.
  - After an add, the message is hidden and the ring reads `0/1`.
  - After a toggle, the ring reads `1/1`.
  - After deleting the last task, the message is visible again.
  - The ring has `aria-hidden="true"`.
  - The input has the placeholder "Add a new task…" and is still labelled "New task".
- Manual check in Chrome and Safari:
  - Compare side by side with `designs/round-2/option-a.html`.
  - Add 5 tasks, mark 2 done, and confirm the ring shows `2/5` with the arc about 40% full and the count reads "2 of 5 completed".
  - Delete all tasks and confirm the empty state shows.
  - Go through everything with the keyboard only and confirm focus rings are visible.
  - Check at 360px wide.
- Check contrast with a contrast tool for task text, done text, the count and the empty-state message over the glass card.

## Contracts

Detail lives in `./contracts/` — `provides.md` and `requires.md`.

- **Provides:** the same single static screen, restyled with a decorative progress ring and an empty-state message; no API, nothing consumes it.
- **Requires:** no upstream data or external resources; browser glass effects degrade to near-opaque surfaces when unsupported.
