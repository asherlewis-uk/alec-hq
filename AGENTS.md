# AGENTS.md

Repository root is the active workspace.

## Required read order before making changes
Read these files before planning or editing code:
1. `.github/ACTIVE_EXECUTION.md`
2. `.github/CONTEXT.md`
3. `.github/execution-spec-full.md`
4. `.github/build-history.md`
5. `.github/copilot-instructions.md`
6. `.github/gates/boundary-guard.agent.md`
7. `.github/gates/ui-constraint-gate.agent.md`
8. `.github/gates/hardening-gate.prompt.md`
9. `.github/gates/verification-completion-gate.prompt.md`

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
2. `.github/ACTIVE_EXECUTION.md`
3. `.github/gates/*.agent.md`
4. `.github/gates/*.prompt.md`
5. `.github/execution-spec-full.md`
6. `.github/CONTEXT.md`
7. `.github/build-history.md`
8. `.github/copilot-instructions.md`

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

## Agentic Runtime

All agentic orchestration, automation, and multi-step task execution in this repository is bound to the **Microsoft Multi-Agent Custom Automation Engine Solution Accelerator** as the canonical agentic runtime.

- Source: <https://github.com/microsoft/Multi-Agent-Custom-Automation-Engine-Solution-Accelerator>
- Setup instructions: `docs/integrations/multi-agent-essential-studio-setup.md`
- The deployed Multi-Agent endpoint is configured via `MULTI_AGENT_API_BASE_URL` in `.env.local` / deployment environment.
- No alternative agentic orchestration framework may be introduced without an explicit operator decision recorded in `.github/ACTIVE_EXECUTION.md`.
- Agents must authenticate via Azure credentials provisioned through `azd auth login` and `azd up` as documented in the setup guide.

## UI Library

All new UI component development in this repository must use **Syncfusion Essential Studio® UI Edition** as the component library.

- 5-member team license (VSDE 6-month subscription). License key: `NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY` (see `.env.example` and `docs/integrations/multi-agent-essential-studio-setup.md`).
- Setup instructions: `docs/integrations/multi-agent-essential-studio-setup.md`
- Syncfusion components are the **component layer**. The alec-hq design system tokens (defined in `tailwind.config.ts` and `src/app/globals.css`) are the **theming layer** applied on top. Both constraints apply simultaneously.
- The `.github/gates/ui-constraint-gate.agent.md` is updated to enforce this requirement. Any new UI component that ships without a Syncfusion equivalent must include explicit justification in the PR.
- The license key must never be hardcoded. It must be read from `process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY` as shown in the setup guide.

## Suggested audit prompt
Use this workflow before changes:
- scan the required-read files
- return critical conflicts, ambiguous instructions, stale rules, canonical source for each disputed rule, and a safe implementation envelope
- do not edit code until the audit is complete if instructions conflict
