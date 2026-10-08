# Verify report — Build a basic to-do app

Final round: 3 of 3 (head `670df82`, diff `git diff origin/dev...HEAD`).

```
PASS  check            npm test (exit 0) — 42 pass, 0 fail, 0 skipped; src/app.js and src/todo.js at 100 % line/branch/function coverage
PASS  check:00000000-build-a-basic-to-do-app   spec-auditor — nothing blocking, no open findings
PASS  code-reviewer    (verify_agents) — ready, 0 open findings
PASS  guardian         with one written exception (below); FAIL without it
Verdict: PASS (with the exception recorded below)
```

## Rounds

1. **Round 1** — check green. Guardian FAIL (3): `## How it works` named files and functions (Constitution II); the `npm start` entry branch of the dev server had no test; the approved spec's own Constraints/Verification wording (see Notes). Spec-auditor and code-reviewer found drift and doc points only. Fixed by T17–T21.
2. **Round 2** — check green; guardian and spec-auditor PASS. Code-reviewer: the entry test failed when port 8080 was taken, plus two nits. Fixed by T22, and T9/T16 were marked as superseded by T18.
3. **Round 3** — check green; spec-auditor and code-reviewer PASS. Guardian raised one FAIL, cleared by the exception below.

## Exception (Definition of done Tier 1, "no suppressions added")

`test/serve.test.js` → `serves when run directly` calls `t.skip('port 8080 in use')` when it cannot bind `127.0.0.1:8080` before starting the dev server. The skip fires only when another process already holds that port, for example a running `npm start`. It is reported as a skip, never as a pass, and the server's other behaviour (404 and content-type cases) is tested on a free port either way. With the port free, as in CI and in this run, the test runs and passes (0 skipped). The skip exists because the server listens on a fixed port: `contracts/requires.md` says no environment variables are read.

## Browser checks

Not run: `.claude/ai-workflow.json` has no `"e2e"` key, so the repo has no browser step. The spec's manual scenario (5 added, 3 done → `3 of 5 completed`; delete a done task → `2 of 4 completed`) is automated in `test/app.test.js` against jsdom. Strikethrough and focus-ring styles were not checked in a real browser.

## Review findings → tasks

The first whole-diff review found 3 major issues (server crash on a malformed request target, a traversal test that never reached the guard, keyboard focus lost after re-render) and 4 minor ones. They became T10–T16 and T13a. The verify rounds added T17–T22. Mid-build follow-ups were T1a (Node engines for jsdom 29), T1b (`npm test` glob) and T7a (fixed port, no env).

## Notes for the spec owner

- `spec.md` → Constraints and Verification (as approved at `7e3ca24`) name `styles.css`, `todo.js`, `app.js` and the Node test runner. Constitution II keeps file and library names out of specs. This build may not edit approved spec content, so moving these lines to `plan.md` (which already covers them) is the owner's call. Guardian and the spec-auditor rate this non-blocking.
- The spec's Status line still reads Draft. The spec was approved in Pulse.
