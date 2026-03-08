# alec-hq Workspace Instructions

These instructions apply to the default agent for this repository.

## Dual-Workspace Gate Is Mandatory

Before making, proposing, or reviewing any boundary-affecting change, invoke the dual-workspace hardening gate first.

Boundary-affecting work includes any change to:

- Supabase schemas or migrations under `supabase/**`
- database types, mappers, validation, or server data-access code under `src/lib/**`
- route handlers under `src/app/api/**`
- auth, session, login, logout, proxy, or request-scoping logic
- client hooks, stores, or UI flows that change how catalog and workspace-private data are loaded, cached, or combined
- tests or docs that define or verify catalog versus workspace-private behavior

Treat the following repository files as the authoritative dual-workspace execution surface:

- `.github/skills/dual-workspace-boundary-gate/SKILL.md`
- `.github/prompts/run-dual-workspace-hardening-gate.prompt.md`
- `.github/agents/dual-workspace-boundary-guard.agent.md`
- `.github/agents/dual-workspace-implementation.agent.md`
- `docs/dual-workspace-catalog-execution-spec.md`

Do not replace, compress, or reinterpret those files with a weaker summary. Use them together.

## Required Invocation Order

For any boundary-affecting task, the default agent must do one of the following before editing files:

1. If validating the current working tree or a proposed diff, run the prompt `/run-dual-workspace-hardening-gate`.
2. If the task is a planned migration slice or scoped design/change request, invoke the skill `/dual-workspace-boundary-gate` with the exact scope.
3. If operating through the custom implementation agent, invoke the `Dual Workspace Boundary Guard` agent before implementation.

Do not proceed to implementation until the guard result is PASS.

## Hard Stop Conditions

If the gate or guard returns FAIL, or if classification cannot be proven:

- stop the change
- do not edit schema, migration, route, query, model, mapper, validation, hook, auth, or store files
- do not auto-repair the failure in the same step
- follow the archive-and-stop behavior defined by the skill and execution spec

`UNKNOWN` classification is a hard failure.

## Repository Invariants

When reasoning about any dual-workspace change, preserve these invariants:

- one shared catalog is canonical and cross-workspace
- private workspace data is mutually invisible across workspaces
- every authenticated session resolves to exactly one workspace
- workspace authority comes only from authenticated session state, never from client input
- every private query must enforce a direct server-side `workspace_id` predicate
- public routes may expose catalog data only
- legacy tables and legacy route families remain until cutover verification is complete

## When The Gate Is Not Required

The default agent does not need to run the dual-workspace gate for changes that are clearly out of scope, such as:

- purely visual styling with no data-flow impact
- copy, metadata, or static content edits
- isolated component presentation changes that do not alter data loading, auth, routing, or state boundaries

If there is any doubt about whether a change is boundary-affecting, run the gate.
