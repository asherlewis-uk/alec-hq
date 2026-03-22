# AGENTS.md

Repository root is the active workspace.

## Required read order before making changes
Read these files before planning or editing code:
1. `.github/CONTEXT.md`
2. `.github/execution-spec-full.md`
3. `.github/build-history.md`
4. `.github/copilot-instructions.md`
5. `.github/gates/boundary-guard.agent.md`
6. `.github/gates/ui-constraint-gate.agent.md`
7. `.github/gates/hardening-gate.prompt.md`
8. `.github/gates/verification-completion-gate.prompt.md`

## First task on implementation requests
Before making any code changes:
1. scan the workspace for conflicting constraints
2. identify duplicate, stale, or superseded directives
3. produce a conflict report before editing code when instructions disagree

## Conflict report format
For each conflict, include:
- conflict summary
- files involved
- severity: `critical`, `major`, or `minor`
- likely canonical source
- recommended resolution
- implementation risk if the assumption is wrong

## Authority order
When instructions conflict, prefer:
1. this `AGENTS.md`
2. `.github/gates/*.agent.md`
3. `.github/gates/*.prompt.md`
4. `.github/execution-spec-full.md`
5. `.github/CONTEXT.md`
6. `.github/build-history.md`
7. `.github/copilot-instructions.md`

## Editing rules
- Keep changes minimal and local to the requested scope.
- Do not broaden scope without explicit instruction.
- Do not modify files outside the requested area.
- If constraints conflict, stop and surface the conflict before editing code.
- If runtime behavior is already correct but verification is incomplete, prefer fixing the verification gap.

## Ignore as instruction sources
Do not treat generated, local-only, or environment-specific artifacts as canonical instruction sources, including:
- `.git/`
- `.next/`
- `output/`
- `test-results/`
- `tsconfig.tsbuildinfo`
- `.env.local`
- generated service-worker build output in `public/`

## Suggested audit prompt
Use this workflow before changes:
- scan the required-read files
- return critical conflicts, ambiguous instructions, stale rules, canonical source for each disputed rule, and a safe implementation envelope
- do not edit code until the audit is complete if instructions conflict
