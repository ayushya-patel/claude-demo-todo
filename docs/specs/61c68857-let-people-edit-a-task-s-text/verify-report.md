# Verify report — Edit a task's text

Final round: 2 of 3 (head `6a5b0f8`, diff `git diff origin/dev...HEAD`).

```
PASS  check            npm test (exit 0) — 84 pass, 0 fail, 0 skipped; src/app.js and src/todo.js at 100 % line/branch/function coverage
PASS  check:61c68857-let-people-edit-a-task-s-text   spec-auditor — no Blocking, no Warnings; all 16 Accepts exit 0 at HEAD
PASS  check:00000000-build-a-basic-to-do-app        spec-auditor — the How it works and provides.md edits are consistent with the shipped code
PASS  code-reviewer    (verify_agents) — ready, 0 open findings
PASS  guardian
Verdict: PASS
```

## Rounds

1. **Round 1**: check green. Guardian FAIL (3): `## How it works` named the plan file, and two approved-spec lines name source files (see Notes). Spec-auditor FAIL (1 Blocking): T2's Accept broke after T12 added `hidden` to the hint. It also gave two Warnings: a Behaviour 12 focus divergence was missing from Divergences, and the basic app's "nothing is patched in place" was out of date. Code-reviewer found 1 major: a held Enter closed the edit it had just opened. Fixed by T14–T16. T2's Accept regex was relaxed to allow the extra attribute, and the outcome-coverage table was updated.
2. **Round 2**: check green. Spec-auditor, code-reviewer and guardian all PASS.

## Browser checks

Not run: `.claude/ai-workflow.json` has no `"e2e"` key, so the repo has no browser step. All event flows (double-click, Enter, Escape, blur, mousedown before blur, focus moves) are tested in `test/app.test.js` against jsdom with dispatched events. Real-browser event ordering and the edit field's styling were not checked in a browser.

## Review findings → tasks

The whole-diff review found 2 majors: a click on another row's control was lost while editing, and a blur-save took focus back from where the user went. It also found minor and nit items: right-click cancel, IME Enter, held Enter, the hint read in browse mode, and a missing blur-focus test. These became T10–T13. The verify rounds added T14–T16.

## Known limitation

If the user presses the editing row's checkbox or Delete and drags off before releasing, the edit ends but the field stays on screen, inactive, until the next change redraws the list. This is recorded in `spec.md` → How it works → Divergences.

## Notes for the spec owner

- `spec.md` → Constraints (as approved at `3e16825`) names `app.js` and `todo.js`, and Behaviour/Verification name code details. Constitution II keeps these out of specs. This build may not edit approved spec content, so the fix is yours at the next revision. Guardian and spec-auditor rate it non-blocking for this build.
- `spec.md` → Verification asks for a test of "cancelling with blur", but Behaviour 7 says blur saves. The build follows Behaviour 7.
- Behaviour 12 says focus always returns to the text. The build returns it after Enter, Escape, Tab or a click on empty space. When the user moves to a control outside the row, focus stays there, so the build doesn't take back the user's own focus move. This is recorded in Divergences.
- The spec's Status line still reads Draft. The spec was approved in Pulse.
