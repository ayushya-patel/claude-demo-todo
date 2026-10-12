# Placeholder text in the add box

- **Status:** Draft

## Problem
The new-task input field is empty with no hint text, making it unclear what users should type.

## Outcomes
- The new-task input displays placeholder text "What needs doing?" when empty

## Out of scope
- Changes to input styling or behavior
- Changes to any other UI elements

## Constraints
- No changes to logic or functionality
- No changes to existing tests required

## Behaviour
Add the placeholder attribute with value "What needs doing?" to the new-task input element in src/index.html.

### Edge cases
| Case | Behavior |
|------|----------|
| User starts typing | Placeholder disappears as normal |
| Input is cleared | Placeholder reappears |

## Verification
1. Open the app in a browser
2. Observe the new-task input field shows "What needs doing?" as placeholder text
3. Type into the field and verify placeholder disappears
4. Clear the input and verify placeholder reappears