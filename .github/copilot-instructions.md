# alec-hq Workspace Instructions

These instructions apply to the default agent for this repository.

## Required Gates (MANDATORY)

For any non-trivial task, the agent MUST load and comply with:

* `.github/gates/ui-constraint-gate.agent.md`
* `.github/gates/boundary-guard.agent.md`
* `.github/gates/hardening-gate.prompt.md`
* `.github/gates/verification-completion-gate.prompt.md`

## Architecture

* The repository uses a dual-workspace architecture over one Next.js app and one Supabase project.
* One shared catalog is canonical and cross-workspace.
* Private workspace data is mutually invisible across workspaces.
* Architecture context lives in `.dev/CONTEXT.md`.
* Boundary enforcement is defined by `.github/gates/boundary-guard.agent.md`.

## Boundary Rules

For any change affecting schemas, migrations, queries, route handlers, auth/session wiring, hooks, stores, or tests that touch catalog versus workspace-private behavior:

1. Read `.dev/CONTEXT.md`.
2. Load `.github/gates/boundary-guard.agent.md` and comply with it.
3. Classify each touched artifact as `CATALOG_SHARED`, `WORKSPACE_PRIVATE`, or `OVERLAY_STRUCTURE`.
4. Treat `UNKNOWN` classification as a hard stop.
5. Preserve these invariants:

   * Every authenticated session resolves to exactly one workspace.
   * Workspace authority comes only from authenticated session state, never from client input.
   * Every private query must enforce a direct server-side `workspace_id` predicate.
   * Public routes may expose catalog data only.
6. Do not merge catalog data and workspace-private data into a single runtime model.

## When Extra Validation Is Required

Use stricter review for changes under:

* `supabase/**`
* `src/app/api/**`
* `src/lib/server/**`
* `src/lib/hooks/**`
* `src/lib/store/**`
* `src/lib/types/**`
* Tests or docs defining catalog versus workspace-private behavior

If classification or isolation is ambiguous, stop and resolve that first.

## When The Boundary Rules Are Not Needed

The extra boundary workflow is not required for:

* Purely visual styling with no data-flow impact
* Copy, metadata, or static content edits
* Isolated presentation changes that do not alter data loading, auth, routing, or state boundaries

## Completion Standard

A task is not complete until the agent also complies with `.github/gates/verification-completion-gate.prompt.md`.
