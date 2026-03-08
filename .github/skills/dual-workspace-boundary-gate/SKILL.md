---
name: dual-workspace-boundary-gate
description: 'Repository-specific alec-hq workflow for dual-workspace catalog changes. Use when changing schemas, migrations, queries, route handlers, auth/session wiring, types, mappers, hooks, or tests that touch shared catalog data, workspace-private data, overlay structures, or workspace isolation. Runs a mandatory classification gate first, then proceeds with implementation only if boundary safety passes.'
argument-hint: 'Describe the planned schema, route, query, model, or migration change and the phase you want to execute.'
user-invocable: true
disable-model-invocation: false
---

# Dual Workspace Boundary Gate

Use this repo-specific skill for alec-hq changes that affect the shared catalog, workspace-private data, overlay structures, or workspace-scoped authentication.

This skill has one entry point and two stages:

1. mandatory boundary classification and safety validation
2. implementation work only after the gate passes

It is not intended to be reused across unrelated repositories without rewriting the repository assumptions, route families, and migration plan.

Preserve the boundary between:

- shared catalog data
- private workspace data
- overlay structures that connect the two

## Outcome

Produce one of two results:

1. a validated implementation plan or code change that preserves catalog/workspace separation, or
2. a blocked change with a conflict archive under `docs/conflict-archives/<timestamp>-classification-conflict/`

## Source Of Truth

Use `docs/dual-workspace-catalog-execution-spec.md` as the source of truth. This skill intentionally stays single-file and defers detailed policy, migration content, and route contracts to that spec.

Non-negotiable invariants:

- one shared catalog acts as the canonical asset library
- each authenticated session resolves to exactly one workspace
- private reads and writes derive authority from session state only
- no private query is allowed without a direct server-enforced `workspace_id` predicate
- public routes may expose catalog data only
- legacy tables remain until cutover verification completes
- classification failures are blocked and archived, not auto-repaired

## Use When

- adding or editing Supabase migrations
- changing database types or data mappers
- building or refactoring `/api/catalog/**` routes
- building or refactoring `/api/workspace/**` routes
- rewiring auth/session code to workspace-scoped sessions
- splitting shared catalog hooks from workspace-private hooks
- executing one of the migration phases after the gate has passed
- reviewing a proposed change for cross-workspace leak risk

## Do Not Use When

- making purely visual changes that do not touch data boundaries
- editing unrelated copy, styles, or metadata
- fixing generic bugs with no catalog/workspace classification impact

## Classification Gate

Before editing any schema, migration, route, query, model, mapper, or hook, classify every touched artifact as exactly one of:

- `CATALOG_SHARED`
- `WORKSPACE_PRIVATE`
- `OVERLAY_STRUCTURE`
- `UNKNOWN`

Classification rules:

- catalog structures are globally shared and must not contain `workspace_id`
- workspace-private structures must declare direct deterministic ownership via `workspace_id`
- overlay structures must declare both `workspace_id` ownership and a catalog reference such as `catalog_asset_id`
- `UNKNOWN` is an immediate failure

If the gate fails, stop. Do not continue into implementation.

## Four Enforcement Layers

Every boundary-affecting change must pass all four layers before implementation continues.

### Layer 1: Pre-Commit Classification Scan

- enumerate all touched files intersecting schema, migrations, queries, routes, models, mappers, and hooks
- classify each artifact
- fail immediately on ambiguity or `UNKNOWN`

### Layer 2: Schema AST Inspection

Verify structural ownership rules:

- catalog tables must not contain `workspace_id`
- workspace-private tables must contain explicit `workspace_id`
- overlay tables must contain both `workspace_id` and a catalog reference
- private ownership must not depend solely on parent joins

### Layer 3: Query Isolation Static Analysis

For every private query path:

- require a direct `workspace_id = current workspace` predicate in the query itself
- reject service-layer-only filtering
- reject implicit scoping through joins, lineage, or parent records alone

### Layer 4: Automatic Workspace Leak Detection

Simulate join and derivation paths to prove private data cannot escape through:

- catalog queries
- derived catalog views
- overlay joins
- cross-workspace joins

## Triple Scenario Validation

All three scenarios must pass:

### Scenario A: Catalog Integrity

- catalog reads do not require workspace context
- catalog ownership is never redefined by private overlays

### Scenario B: Workspace Isolation

- private records have explicit workspace ownership
- isolation does not depend on caller discipline alone

### Scenario C: Boundary Interaction

- catalog queries cannot reveal private overlays
- overlay joins cannot leak another workspace's state
- ambiguity is treated as failure

## Failure Protocol

If any enforcement layer or scenario fails:

1. stop the change
2. block the schema/query/model mutation
3. archive the failure context under `docs/conflict-archives/<timestamp>-classification-conflict/`

Each archive must contain:

- `conflict_identity.md`
- `original/`
- `attempted-diff.patch`
- `validation-failure.md`
- `context.md`

Do not attempt auto-repair during the enforcement phase.

## Procedure

### Step 1: Inventory The Change

- list touched files
- note which ones affect schema, routes, auth, types, mappers, hooks, UI, docs, or tests
- classify each file before editing

Recommended commands:

```powershell
git diff --name-only
rg -n "workspace_id|catalog_asset_id|from\(|select\(|\.from\(" src supabase
```

### Step 2: Run The Classification Gate

- mark each artifact as `CATALOG_SHARED`, `WORKSPACE_PRIVATE`, `OVERLAY_STRUCTURE`, or `UNKNOWN`
- evaluate the four enforcement layers
- evaluate Scenarios A, B, and C
- if any result is fail, archive and stop

Only continue to the remaining steps if Step 2 passes.

### Step 3: Preserve Baseline

- do not delete legacy routes or legacy tables yet
- add new route families and new types beside the old ones
- keep the current app operable until the new route family is ready

### Step 4: Introduce Schema Additively

- create `supabase/migrations/202603080004_dual_workspace_catalog.sql`
- add `workspaces`, `workspace_credentials`, `catalog_assets`, and workspace-private tables
- seed exactly two workspaces
- backfill legacy `assets` into `catalog_assets`
- do not drop legacy tables in the same tranche

### Step 5: Rewire Sessions

- replace owner-scoped session payloads with workspace-scoped payloads
- add workspace login verification
- update session, logout, and proxy logic to respect exactly one active workspace per session
- derive workspace authority only from the authenticated session

### Step 6: Add New Route Families

- add `/api/catalog/**` for shared catalog reads
- add `/api/workspace/**` for private workspace reads and writes
- enforce `workspace_id` predicates on every private query
- leave legacy `/api/assets/**` in place until cutover is verified

### Step 7: Split Client State

- stop using one global private asset collection
- separate catalog hooks from workspace-private hooks
- key private state by workspace or keep it route-local

### Step 8: Migrate UI

- replace PIN-only login with workspace-select plus PIN
- build a catalog browse surface that is safe to expose publicly
- move private dashboard, logs, wishlist, and configuration screens onto workspace-scoped routes

### Step 9: Verify

- unauthenticated catalog reads expose only public catalog data where intended
- workspace A cannot read workspace B private data
- workspace B cannot read workspace A private data
- guessed ids do not reveal foreign existence through private routes
- legacy routes are no longer used by the UI

### Step 10: Update Tests And Docs

- expand Playwright coverage for both workspaces
- update `README.md`, `.env.example`, and `supabase/README.md`
- document migration ordering and shared-versus-private behavior

## Working Mode

When invoked for implementation work:

- first report the classification inventory and pass or fail status
- if the gate passes, execute only the phase requested or the smallest next safe phase
- keep changes additive until cutover verification is complete
- prefer referencing the spec over restating large policy blocks

When invoked for review work:

- identify the failing layer or scenario first
- point to the structural reason the change is unsafe
- recommend archive-and-stop when safety cannot be proven

## Completion Checks

The change is complete only when:

- both workspaces authenticate independently
- the shared catalog remains canonical and visible where intended
- private logs, wishlists, configurations, slot assignments, and workspace asset links remain mutually invisible across workspaces
- the client no longer relies on one mixed private asset list
- tests cover cross-workspace isolation
- docs reflect workspace-scoped runtime behavior

## Decision Rules

- if a change touches boundary-critical files, run the classification gate first
- if a table or query cannot be structurally classified, stop
- if a private query lacks a direct `workspace_id` predicate, stop
- if an overlay lacks both workspace ownership and catalog reference, stop
- if catalog reads can reveal private state through joins or derived views, stop

## Expected Deliverables

- classification inventory for touched artifacts
- pass or fail status for Layers 1-4
- pass or fail status for Scenarios A-C
- either implementation changes or a conflict archive

## Example Prompts

- `/dual-workspace-boundary-gate classify the files required for a new workspace wishlist route and tell me whether the change is safe to implement`
- `/dual-workspace-boundary-gate draft Phase 3 session rewiring work for auth tokens, session cookies, and proxy checks`
- `/dual-workspace-boundary-gate review this migration for catalog versus workspace-private misclassification risk`
- `/dual-workspace-boundary-gate verify that a new workspace logs query uses structural isolation instead of service-layer filtering`