# alec-hq Workspace Instructions

These instructions apply to the default agent for this repository.

## Architecture

- The repository uses a dual-workspace architecture over one Next.js app and one Supabase project.
- One shared catalog is canonical and cross-workspace.
- Private workspace data is mutually invisible across workspaces.
- Architecture context and current boundary rules live in `.dev/CONTEXT.md`.

## Boundary Rules

For any change affecting schemas, migrations, queries, route handlers, auth/session wiring, hooks, stores, or tests that touch catalog versus workspace-private behavior:

1. Read `.dev/CONTEXT.md` first.
2. Classify each touched artifact as `CATALOG_SHARED`, `WORKSPACE_PRIVATE`, or `OVERLAY_STRUCTURE`.
3. Treat `UNKNOWN` classification as a hard stop.
4. Preserve these invariants:
   - every authenticated session resolves to exactly one workspace
   - workspace authority comes only from authenticated session state, never from client input
   - every private query must enforce a direct server-side `workspace_id` predicate
   - public routes may expose catalog data only
5. Do not merge catalog data and workspace-private data into a single runtime model.

## When Extra Validation Is Required

Use stricter review for changes under:

- `supabase/**`
- `src/app/api/**`
- `src/lib/server/**`
- `src/lib/hooks/**`
- `src/lib/store/**`
- `src/lib/types/**`
- tests or docs defining catalog versus workspace-private behavior

If classification or isolation is ambiguous, stop and resolve that first.

## When The Boundary Rules Are Not Needed

The extra boundary workflow is not required for:

- purely visual styling with no data-flow impact
- copy, metadata, or static content edits
- isolated presentation changes that do not alter data loading, auth, routing, or state boundaries
