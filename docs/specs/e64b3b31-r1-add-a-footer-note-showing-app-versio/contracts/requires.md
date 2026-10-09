# Requires — Add footer with app version

What this module needs from outside itself, and how it behaves when that changes
underneath it.

## Upstream data

No network calls. The one external value is the app version, owned by `package.json`.

| Client call | Entity | Fields read | Type | If missing or renamed |
|---|---|---|---|---|
| `readFileSync('package.json')` + `JSON.parse` in `test/app.test.js` | `package.json` | `version` | string (semver) | throw — the footer test fails, so `npm test` fails; `src/app.js`'s `VERSION` must be updated to match |

## Parsed at

| Source | Parsed in |
|---|---|
| `package.json` | `test/app.test.js` (the browser never reads it; see `plan.md` → Approach A) |

## Other modules

| Module | Depends on | Listed in their provides? |
|---|---|---|
| `claude-demo-todo/00000000-build-a-basic-to-do-app` | the `/` to-do screen (`src/index.html`, `mount` in `src/app.js`, `src/styles.css` variables) that the footer is added to | yes — the `/` screen; its provides.md is updated with this change to mention the footer |

## Environment

None.

| Variable | Purpose | Required |
|---|---|---|
| — | — | — |
