# alec-hq Architecture Context

## Architecture

- One Next.js App Router application.
- One Supabase project and one database.
- One shared catalog used by all workspaces.
- Two private workspaces, each isolated from the other.
- Workspace identity comes from server-signed session state only.

## Data Classification

### CATALOG_SHARED

- `catalog_assets`
- `catalog_media`
- `catalog_asset_values`
- `catalog_components`

### WORKSPACE_PRIVATE

- `workspaces`
- `workspace_credentials`
- `workspace_configurations`
- `configuration_slots`
- `workspace_logs`
- `workspace_wishlist_items`
- `workspace_sessions` if introduced later

### OVERLAY_STRUCTURE

- `workspace_asset_links`
- `slot_assignments`

## Non-Negotiable Invariants

1. A catalog asset exists once and may be referenced by many workspaces.
2. One workspace may not read, infer, enumerate, or mutate another workspace's private records.
3. Public routes expose catalog data only.
4. Private routes derive authority from authenticated session state only.
5. Every private query includes a direct server-enforced `workspace_id` predicate.
6. Catalog routes must not join to workspace-private tables.
7. The client store must not cache mixed private state across workspace boundaries.

## Route Families

- `/api/catalog/**`: shared catalog reads, public where intended
- `/api/public/**`: catalog-only public share access
- `/api/workspace/**`: private workspace reads and writes, requires `ensureWorkspaceAccess()`
- `/api/auth/workspace/login`: workspace PIN login
- `/api/auth/session`: current workspace session state
- `/api/auth/logout`: clears workspace session cookie

## Auth and Session Contracts

- Cookie name: `alec_workspace_session`
- Token payload: `workspaceId`, `workspaceSlug`, `role`, `iat`, `exp`, `version`
- Signing: HMAC-SHA256 with `SESSION_SECRET`
- PIN verification: `verifyWorkspacePin()` against `workspace_credentials`
- Route guard: `ensureWorkspaceAccess()`

## Binding Conditions To Preserve

1. `configuration_slots` has direct `workspace_id` ownership.
2. `slot_assignments` has direct `workspace_id` ownership.
3. Slot and assignment flows verify ownership chain back to the current workspace.
4. Overlay queries enforce `.eq("workspace_id", auth.session.workspaceId)` directly.
5. Catalog queries never expose private overlays or workspace state.

## Migration History

- `202603080001_initial_schema.sql`: legacy schema
- `202603080002_rate_limit_rpc.sql`: rate limiting RPC
- `202603080003_app_pin.sql`: legacy app PIN auth
- `202603080004_dual_workspace_catalog.sql`: dual-workspace catalog foundation
- `202603080005_drop_legacy_tables.sql`: catalog components backfill and legacy drop tranche

## Environment Variables

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` when needed by client code
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `SESSION_TTL_HOURS`
