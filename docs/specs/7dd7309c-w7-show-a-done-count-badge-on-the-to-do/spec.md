# Show a done-count badge on the to-do list header

- **Status:** Draft

## Problem

The to-do app currently displays completion progress as prose at the bottom of the list ("3 of 5 completed"). Users need a quick visual indicator of done items in a more prominent location.

## Outcomes

- A badge appears next to the list header showing the count of done items (e.g. "3 done")
- The badge is hidden when the count is zero
- The badge updates in real-time when any to-do is toggled complete or incomplete
- The badge is visible on all screen sizes, including mobile

## Out of scope

- Changing the existing "X of Y completed" count text
- Animating the badge update

## Constraints

- Must use vanilla JavaScript (no framework)
- Must work with the existing DOM structure and event handlers in app.js
- Must follow the app's existing CSS variable colour palette
- Badge uses the blue accent colour (`--color-accent: #0b5fff`)

## Behaviour

The badge displays immediately after the `<h1>To-do</h1>` header as an inline element styled with the blue accent colour. The badge contains text "N done" where N is the count of tasks with `done: true`. When a task is toggled via the checkbox, the badge count updates immediately. When count reaches zero, the badge is hidden (display: none). When it rises above zero again, it becomes visible. The badge appears on all screen sizes.

### Edge cases

| Case | Behaviour |
|------|-----------|
| No tasks added | Badge hidden (count = 0) |
| Some tasks, none done | Badge hidden (count = 0) |
| All tasks done | Badge shows total count |
| Task toggled from done to not done | Count decrements, may hide badge if reaches zero |
| Task toggled from not done to done | Count increments, badge shows |
| Task deleted while done | Count updates or badge hides if reaches zero |
| Mobile device | Badge displays same as desktop |

## Verification

- Load the app with an empty list; badge is not visible
- Add three tasks, toggle one as done; badge shows "1 done" in blue
- Toggle another as done; badge shows "2 done"
- Toggle both back to not done; badge is hidden
- Test on mobile device; badge is visible and updates correctly
- Refresh the page; badge state reflects current tasks (empty list = hidden badge)
