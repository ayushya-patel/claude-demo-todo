# Add a footer link

- **Status:** Draft

## Problem

The to-do app needs a footer with a link to provide additional context or navigation to users.

## Outcomes

- A footer appears below the to-do list on the page
- The footer contains a link to https://example.com
- The link opens in a new tab when clicked

## Out of scope

- Changing the existing to-do list functionality
- Modifying the form or input elements
- Styling changes beyond what is necessary for the footer

## Constraints

- The app is a vanilla JavaScript to-do app with no framework
- DOM wiring is in app.js; styles are CSS variables in styles.css
- The footer must be accessible and follow the existing code patterns

## Behaviour

The footer is a new `<footer>` element placed in the HTML after the `<main>` element (or inside `<main>` after all other content). It contains a single link:

```html
<footer>
  <a href="https://example.com" target="_blank" rel="noopener noreferrer">example.com</a>
</footer>
```

The footer link uses `target="_blank"` to open in a new tab and `rel="noopener noreferrer"` for security. The footer is styled subtly below the main content with muted text colour and appropriate padding, consistent with the existing design and CSS variables.

### Edge cases

| Case | Behaviour |
|------|-----------|
| User clicks the footer link | Opens https://example.com in a new tab without affecting the to-do list |
| JavaScript disabled | The footer link remains visible and clickable (no JS required) |
| Long URL in the page title | Test that text wrapping works correctly in narrow layouts |

## Verification

- The footer is visible below the to-do list in the rendered page
- The link points to https://example.com and has `target="_blank"` and `rel="noopener noreferrer"` attributes
- The link opens in a new browser tab when clicked
- The footer styling is consistent with the existing design
- All existing to-do list functionality remains unchanged
- Tests pass with `npm test`