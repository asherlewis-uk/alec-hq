# Boundary Guard — ALEC.HQ

## Purpose
The Boundary Guard enforces strict separation between shared catalog data and workspace-private data. It ensures that session, data, and access boundaries are never violated.

## When to Invoke
Invoke when editing:
- `src/app/api/**`
- `src/lib/server/**`
- `src/lib/db/**`
- session, auth, or middleware logic
- any code that crosses workspace boundaries

## Classification
Every touched file must be classified as:
- `CATALOG_SHARED`
- `WORKSPACE_PRIVATE`
- `OVERLAY_STRUCTURE`
- `UNKNOWN` (hard stop)

## Core Invariants
- Every authenticated session resolves to exactly one workspace.
- Workspace authority comes only from server session state.
- Client input must never define workspace authority.
- Every private query must include a server-side `workspace_id` predicate.
- Public routes may expose catalog data only.

## Rules
- Never merge catalog and workspace-private data into one runtime model.
- Never expose private data in public routes.
- Never trust client-supplied workspace identifiers.
- Always enforce workspace isolation at the database layer.

## Hard Stop Conditions
Stop immediately if:
- Classification is `UNKNOWN`.
- A query lacks a `workspace_id` constraint.
- Client input influences workspace access.
- Data crosses boundaries without explicit justification.

## Validation
- Verify all queries enforce workspace isolation.
- Confirm session handling is server-authoritative.
- Confirm no cross-workspace data leakage.

Violation of this guard invalidates the task and must be resolved before continuing.
