# Requires — Add dark mode toggle with persistent choice

What this module needs from outside itself, and how it behaves when that changes
underneath it.

## Upstream data

No network calls and no upstream system. The only outside read is the browser's
Web Storage.

| Client call | Entity | Fields read | Type | If missing or renamed |
|---|---|---|---|---|
| `window.localStorage.getItem('theme')` | saved theme preference | the string value | `"light"` \| `"dark"` | degrade: anything other than `"dark"`, a missing key, or storage that throws on access means the light theme |
| `window.localStorage.setItem('theme', …)` | saved theme preference | — (write) | — | degrade: a throw (disabled, quota full) is ignored; the theme changes for the page but is not remembered |

## Parsed at

| Source | Parsed in |
|---|---|
| `localStorage['theme']` | `src/theme.js` → `readTheme` |

## Other modules

| Module | Depends on | Listed in their provides? |
|---|---|---|
| `00000000-build-a-basic-to-do-app` | the `/index.html` screen this module adds the toggle to (same repo, same page; no API) | yes |

## Environment

None.

| Variable | Purpose | Required |
|---|---|---|
| — | — | — |
