# Plan — Show a friendly message when the to-do list is empty

Derived from `spec.md`. This is where implementation details are allowed.

This is a change to the shipped to-do screen
([00000000-build-a-basic-to-do-app](../00000000-build-a-basic-to-do-app/plan.md)).
Today `src/app.js` → `render()` rebuilds `<ul id="todo-list">` from the task array with
`list.replaceChildren(...tasks.map(renderTask))`, so an empty array leaves an empty
`<ul>`. The list's delegated `change` / `click` handlers and the "focus the input when
the last task is deleted" logic all work off `list.querySelectorAll(...)`.

## Approaches considered

All three keep the existing DOM (`<ul id="todo-list">`, no wrapper) and leave the count
line, the form and task styling unchanged.

### A. Render a message `<li>` from `render()` when the array is empty (recommended)

`render()` gets one branch: when `tasks.length === 0` it puts a single
`<li class="todo-empty">Nothing to do yet — add your first task above</li>` in the
list; otherwise it renders the tasks as today. A new `#todo-list li.todo-empty` CSS
rule styles it as muted informational text.

- For: one source of truth — the list is still rebuilt from state on every change, so
  the message appears on mount, after deleting the last task and disappears on the
  first add with no extra bookkeeping. Smallest diff (a few lines in `app.js`, one CSS
  rule). The message `<li>` has no `data-id`, checkbox or button, so the existing
  handlers already ignore it (`closest('button')` is `null`; no `change` can fire).
- Against: the message text lives in JavaScript, not in `index.html`; tests that
  counted `li` elements as tasks must count task items instead.

### B. Static message `<li>` in `index.html`, shown/hidden by `app.js`

The message `<li hidden>` is written in `index.html` inside `#todo-list`; `mount` keeps
a reference to it and `render()` re-inserts it (toggling `hidden`) alongside the task
items on each `replaceChildren`.

- For: the copy sits in the markup.
- Against: `replaceChildren` would delete the static node, so `app.js` must hold it and
  splice it back in every render — two mechanisms (markup + script) for one element; a
  hidden `<li>` still sits in the list for `querySelectorAll('li')` callers when tasks
  exist.

### C. CSS only: `#todo-list:empty::before { content: "…" }`

- Rejected against the spec: the Behaviour requires a real `<li>` inside the list;
  generated content is not a list item, is unreliable for screen readers, and cannot be
  asserted in the jsdom tests (jsdom does not render pseudo-elements).

**This plan follows approach A.** Approving the plan picks A; request changes to pick
B instead.

## Approach

Approach A. In `src/app.js`, `render()` becomes:

- `tasks.length === 0` → `list.replaceChildren(renderEmpty())`, where `renderEmpty()`
  creates an `<li class="todo-empty">` whose `textContent` is exactly
  `Nothing to do yet — add your first task above` (em dash, U+2014). No `data-id`, no
  controls.
- otherwise → `list.replaceChildren(...tasks.map(renderTask))` (unchanged).
- The count line is updated exactly as today in both cases, so `0 of 0 completed`
  stays visible below the message.

Handlers need no change, and this is verified by tests rather than assumed:

- `click` on the message: `event.target.closest('button')` is `null` → returns early.
- Deleting the last task: after `render()` the list holds only the message, which has
  no `button`, so `buttons` is empty and focus goes to the input (existing behaviour).
- Toggling: the message has no checkbox, so no `change` event originates from it.

`src/styles.css` gets one rule scoped to the message, reusing the existing variables:
`#todo-list li.todo-empty { color: var(--color-muted); font-style: italic;
border-bottom: none; }` (final values may be tuned; it must read as neutral text, not a
task). No existing rule is edited, so task rows look the same.

No ADR: nothing here is expensive to reverse, and no dependency is added.

## Touched surface

| Path | Change |
|---|---|
| `src/app.js` | modified — `render()` renders the message `<li>` when the list is empty |
| `src/styles.css` | modified — new `#todo-list li.todo-empty` rule |
| `test/app.test.js` | modified — `items()` helper counts task items (`li[data-id]`); empty-state tests added; existing "empty list" assertions updated to expect the message |
| `docs/specs/00000000-build-a-basic-to-do-app/contracts/provides.md` | modified — the screen row mentions the empty-state message; **Consumed by** lists this change |
| `docs/specs/3dbe2deb-a6-show-a-friendly-message-when-the-to/*` | new — this plan, contracts, later tasks and verify report |

`src/index.html` and `src/todo.js` do not change.

## Data

| Data | Owner | Shape | Boundary |
|---|---|---|---|
| Task list | Client state inside `mount` (unchanged) | array of `{ id, text, done }` | unchanged |
| "List is empty" | Derived on every render from `tasks.length` | boolean, never stored | cannot drift from the list |
| Message text | Constant in `src/app.js` | string | set with `textContent` |

## Consumed contracts

None. No upstream system, network call or environment variable is involved.

| Contract | Read from | Parsed at | On shape mismatch |
|---|---|---|---|
| — | — | — | — |

## Entry points

| Entry point | Runs | Behaviour on failure |
|---|---|---|
| `src/index.html` (the to-do screen) | Client-side only | No async work; the empty state is a pure function of the in-memory list, so there is no failure path. |

## Accessibility

- The message is plain text in a list item with no controls, so it adds no tab stop and
  tab order is unchanged.
- It is distinguished from tasks by having no checkbox/Delete button and by italic text,
  not by colour alone.
- The count line keeps `aria-live="polite"`, so adding/deleting is still announced; the
  message itself is not made live (it would duplicate that announcement).

## Risks

| Risk | Mitigation |
|---|---|
| Existing tests and helpers treat every `<li>` as a task (`items().length === 0` on an empty list) | Change `items()` to `li[data-id]`; add explicit assertions that the empty list contains exactly the message `<li>`. |
| A click on the message is treated as a task action | Covered by a test: clicking the message changes nothing. |
| Deleting the last task moves focus somewhere odd now that the list is not empty | Existing test "deleting the last remaining task focuses the text input" stays and must still pass. |
| The em dash is mistyped as a hyphen | Tests assert the exact string from the spec. |
| 100 % branch coverage in `npm test` | Both branches of the new `render()` condition are exercised by the tests below. |

## Test strategy

All in `test/app.test.js` (jsdom, per ADR 0001), run by `npm test`:

- **Snapshot-style (spec "snapshot test")**: on mount, `list.innerHTML` equals the
  exact expected markup of one message `<li class="todo-empty">…</li>`, and it contains
  no `input` or `button`; after adding a task, the list contains no `.todo-empty` and no
  element with the message text. These are inline expected-markup assertions rather
  than Node's experimental snapshot files, so `npm test` needs no new flag and no
  generated snapshot directory.
- **Integration**: empty list → add a task → message gone, task shown, count
  `0 of 1 completed`; add two tasks, delete both → message back with `0 of 0 completed`;
  add, mark done, delete → message back; whitespace-only submit on an empty list →
  message stays and input is cleared; clicking the message changes nothing.
- **Existing tests**: updated only where they asserted an empty `<ul>` on an empty
  list; all others pass unchanged.
- Deliberately not tested: the CSS appearance of the message (checked by eye in the
  browser; jsdom does not compute layout).
- No end-to-end browser suite: the config has no `"e2e"`.
