# Verify report — Show the number of remaining tasks in the page title

Rounds taken: 2 (of at most 3).

## Last round (round 2)

- PASS — `npm test` (the repo's check): 45 tests pass, 0 fail; 100 % line, branch and function coverage of `src/app.js` and `src/todo.js`.
- PASS — spec audit: all 4 Outcomes and all 7 Verification steps are covered by shipped code and tests; plan, tasks, contracts and `## How it works` match the code; the approved spec text is unchanged (only `## Contracts` and `## How it works` were appended).
- PASS — code review (the config's `verify_agents`: code-reviewer): approved, no blockers or majors.
- PASS — guardian, Constitution I, III, IV, V, VI, definition of done, engineering discipline, code ownership, local rules (the repo has none).
- PASS — guardian, Constitution II, `## How it works`: it names no files or functions (fixed in round 2 by T4a).
- FAIL — guardian, Constitution II, **approved spec content (not editable by the build)**: spec.md Constraints and Behaviour (lines 24, 30, 35) name `document.title`, `render()` and `app.js`. These lines were approved in Pulse, and the build may not change approved spec content, so this is left for the human reviewer. Suggested rewrite: "every time the list is redrawn, the browser tab title is updated".

## Browser checks

Not run: the repo has no `"e2e"` in `.claude/ai-workflow.json`, so it has no browser step.

## Review findings

Round 1: the guardian flagged file names in `## How it works`, which became task T4a. It also flagged the approved spec lines, which are listed above for the reviewer. The code reviewer had two minor notes, and neither became a task. Rewriting the Pulse-authored `spec:` commits would mean rewriting history. Flipping the spec's `Status: Draft` would edit approved content. Both are left for the reviewer. The spec auditor found no issues.
