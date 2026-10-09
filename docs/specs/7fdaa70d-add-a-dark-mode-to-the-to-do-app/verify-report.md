# Verify report — Add dark mode to the to-do app

Final round: 2 of 3 (head `30cbd1a`, diff `git diff origin/dev...HEAD`).

```
PASS  check            npm test (exit 0): 64 pass, 0 fail, 0 skipped; src/app.js, src/theme.js, src/todo.js at 100 % line/branch/function coverage
PASS  check:7fdaa70d-add-a-dark-mode-to-the-to-do-app   spec-auditor: no blocking findings, 1 nit open (below)
PASS  code-reviewer    (verify_agents): ready, 0 open findings
PASS  guardian         round 2 on the new commits; the round-1 Constitution II lines are about the approved spec text (see Notes)
Verdict: PASS (the spec-text note below is for the spec owner)
```

## Rounds

1. **Round 1**: check green. The whole-diff review found 2 majors and 4 minors:
   - Major: the text-input border was 1.5 : 1 / 1.7 : 1, under WCAG 1.4.11.
   - Major: hover opacity dropped button text under 4.5 : 1.
   - Minor: the stale "Consumed by" row in the 00000000 contract.
   - Minor: a narrow hard-coded-colour test.
   - Minor: the body transition could animate the reload flash.
   - Minor: commit-subject types.

   The spec-auditor found the same Consumed-by row (should fix) and 3 nits. The guardian found Constitution II in the approved `spec.md` only. Fixes became T8–T11. The transition flash is deferred as D2. Commit subjects are left as pushed, since rewriting them would need a force-push.
2. **Round 2**: check green. The guardian passes, the code-reviewer says "ready" with every round-1 finding resolved, and the spec-auditor passes all four checks.

## Browser checks

Not run: `.claude/ai-workflow.json` has no `"e2e"` key, so the repo has no browser step. Toggle state, icon, `aria-pressed`, persistence, palette values, input-border variable, no-opacity and the colour guard are automated in `test/theme.test.js` against jsdom and the stylesheet text. Real-browser rendering is not checked: emoji legibility of the toggle, the look against `designs/round-2/option-a.html`, and the reload flash (D1/D2). These are spec Verification 1–8 by hand.

## Review findings → tasks

The review found 2 majors and 4 minors, and the audit found 1 should-fix. They became T8 (input border contrast), T9 (hover contrast), T10 (Consumed-by row) and T11 (wider colour guard). One item was deferred (D2, transition on first sync) and one was declined (commit subjects).

## Notes for the spec owner

- Constitution II: `spec.md` as approved at `bf4b1e6` names `styles.css`, "vanilla JS", the `data-theme` attribute mechanism and the path `designs/round-2/option-a.html`. This build may not edit approved spec content. Moving these lines to `plan.md`, which already covers them, is the owner's call.
- Open nits, none blocking:
  - `plan.md` lists manual checks as "spec Verification 1–7", which leaves out V8 (the build follows the design file).
  - `contracts/requires.md` Other-modules row names only `/index.html`, while the 00000000 Consumed-by row also names the colour variables in `styles.css`.
  - Where `## How it works` goes is undecided while `spec.md` must stay byte-identical.
- The spec's Status line still reads Draft. The spec was approved in Pulse.
