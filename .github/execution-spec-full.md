# Dual Workspace Catalog Execution Specification

> **Build status tracker**: [`dual-workspace-catalog-execution-spec-build-status.md`](dual-workspace-catalog-execution-spec-build-status.md)
> Every phase agent MUST update that document upon completing their phase.

## Objective

Implement a two-workspace architecture in a single Next.js application and a single Supabase project.

Target operating model:

- One deployment container.
- One Supabase database.
- One shared catalog that acts as the canonical asset library.
- Two private workspaces, each isolated from the other at the application layer and the data layer.
- Simplified authentication that always resolves a session to exactly one workspace.

This specification supersedes all prior plans that assumed either:

- one shared private workspace with attribution filters, or
- one shared PIN with two users inside the same data space.

Those models do not satisfy the actual source of truth requirement: two independent and mutually invisible private spaces over one shared asset library.

## Compressed Context

Current codebase facts that matter:

- The application is a Next.js App Router application with server route handlers under `src/app/api/**`.
- The current state model is single-owner and single-workspace.
- Private and public concerns are currently collapsed into the same `assets`, `components`, `asset_logs`, and `wishlist_items` tables.
- Route handlers currently authorize only "signed in" and do not scope reads or writes to a workspace.
- Client state currently assumes a single global asset list.

Current files demonstrating those assumptions:

- `src/app/api/assets/route.ts`
- `src/app/api/assets/[id]/route.ts`
- `src/app/api/assets/[id]/components/route.ts`
- `src/app/api/assets/[id]/logs/route.ts`
- `src/app/api/assets/[id]/wishlist/route.ts`
- `src/lib/hooks/useAssets.ts`
- `src/lib/store/useAppStore.ts`
- `src/components/dashboard/Dashboard.tsx`
- `src/lib/server/auth/token.ts`
- `src/lib/server/auth/session.ts`
- `src/lib/server/auth/owner.ts`
- `supabase/migrations/202603080001_initial_schema.sql`
- `supabase/migrations/202603080003_app_pin.sql`

## Authoritative Terminology

Use these terms consistently. Do not reintroduce ambiguous names such as "owner assets" when referring to the new model.

- `catalog`: shared, canonical, cross-workspace asset library.
- `workspace`: one private user space. Exactly one session maps to exactly one workspace.
- `workspace asset`: a private workspace-local reference to a catalog asset, including workspace-specific usage or override data.
- `workspace configuration`: a private arrangement or setup within one workspace.
- `configuration slot`: a named position inside a configuration.
- `slot assignment`: the link between a configuration slot and a catalog asset.
- `workspace log`: a private note or event scoped to one workspace.
- `workspace wishlist item`: a private workspace-scoped acquisition target, optionally linked to a catalog asset.
- `workspace session`: the authenticated runtime state carrying the active workspace identity.

## Non-Negotiable Invariants

1. A catalog asset exists once.
2. A catalog asset may be referenced by zero, one, or many workspaces.
3. A workspace may not read, enumerate, mutate, or infer another workspace's private records.
4. Public routes may expose catalog data only. Public routes may not expose private workspace overlays, logs, wishlists, or slot assignments.
5. Every private route handler must derive effective scope from the authenticated session, not from untrusted client input.
6. No private table may be queried without a `workspace_id` predicate enforced server-side.
7. The client store must not cache mixed private state across workspace boundaries.
8. Migration must preserve current app operability until the new route family is ready to take traffic.

## Agent Enforcement Directive

This phase includes a defensive hardening layer for multi-tenant classification safety.

Scope of this directive:

- database schemas
- migrations
- queries
- service routes
- data models
- catalog structures
- workspace-private structures
- overlay systems
- derived queries
- joins between catalog and workspace data

During this phase, the implementation agent is not authorized to repair or auto-correct unsafe classification changes. The agent is authorized only to:

- detect classification risks
- block unsafe modifications
- archive conflicts for investigation
- stabilize repository context

If classification safety cannot be proven, no schema edit, migration, route change, query change, or model change may proceed.

### Core Enforcement Rule

Any change affecting shared catalog data, workspace-private data, overlay structures, or their interaction boundaries is unsafe by default.

The change must pass:

- Triple Scenario Classification Validation
- all automated enforcement layers defined below

If any layer fails, the execution agent must:

1. block the commit or migration
2. abort the modification
3. archive the full failure context

The execution agent must not attempt automatic repair in response to a classification failure.

### Four Enforcement Layers

All layers must pass before a change may be accepted.

#### Layer 1: Pre-Commit Classification Scanner

Every changed file must be scanned before commit or migration application.

The scanner must detect modifications affecting:

- schema definitions
- query logic
- data access layers
- service routes
- migrations
- repository models

Each affected component must be classified as exactly one of:

```text
CATALOG_SHARED
WORKSPACE_PRIVATE
OVERLAY_STRUCTURE
UNKNOWN
```

Layer 1 rules:

- `UNKNOWN` automatically fails validation
- catalog structures must never inherit workspace scope
- private structures must explicitly declare workspace ownership
- overlay structures must declare both the referenced catalog entity and the owning workspace
- any classification ambiguity triggers a hard failure

#### Layer 2: Schema AST Inspection

All schema files must be parsed into an abstract syntax tree before approval.

Catalog table requirements:

- must not contain `workspace_id`
- must not derive scope through joins
- must not depend on session variables
- must not require workspace context for reads

Workspace-private table requirements:

- must include explicit `workspace_id`
- must have deterministic ownership
- must support isolation without multi-hop joins

Overlay table requirements:

- must contain `workspace_id`
- must contain a catalog reference column such as `catalog_asset_id`
- must make ownership explicit and deterministic

Failure conditions:

- catalog tables with workspace scoping fail
- private tables whose ownership depends on parent joins fail
- overlays lacking both workspace ownership and catalog reference fail

#### Layer 3: Query Isolation Static Analysis

Every SQL statement, Supabase query builder call, or derived query path touching private data must be statically analyzed.

Required condition:

- every private query must include an explicit, deterministic, structurally verifiable `workspace_id = current workspace` predicate

Automatic failure patterns:

- missing workspace predicate
- workspace filter applied only in the calling service layer while the query itself remains unscoped
- filtering that depends on parent joins rather than direct ownership
- implicit scoping through configuration lineage alone
- derived queries that can expose private state without a direct workspace predicate

Any failure pattern requires immediate blocking.

#### Layer 4: Automatic Workspace Leak Detection

The agent must simulate possible query execution paths to detect leakage across catalog and workspace boundaries.

This layer must inspect:

- join paths
- derived query paths
- aggregation paths
- overlay resolution paths

Leak detection must prove that private data cannot escape via:

- catalog queries
- derived catalog views
- overlay joins
- cross-workspace joins

If any scenario reveals a potential escape path, validation fails.

### Triple Scenario Classification Validation

All changes must pass the following scenarios.

#### Scenario A: Catalog Integrity

Verify that catalog entities remain globally shared.

Catalog queries must not:

- require workspace context
- depend on private overlays
- inherit workspace ownership

Any violation fails validation.

#### Scenario B: Workspace Isolation

Verify that workspace-private data cannot escape isolation.

Requirements:

- explicit workspace ownership
- deterministic isolation
- no reliance on service-layer filtering alone

Any violation fails validation.

#### Scenario C: Boundary Interaction

Verify that catalog and private layers do not drift into each other.

Boundary rules:

- overlays cannot redefine catalog ownership
- catalog queries cannot reveal private state
- join chains cannot leak workspace data

Any ambiguity fails validation.

### Blocking Rules

If any enforcement layer or classification scenario fails, the pipeline state is:

```text
BLOCK_COMMIT
BLOCK_MIGRATION
ABORT_PIPELINE
```

No repository mutation may proceed beyond that point.

### Conflict Archival Protocol

When validation fails, archive the full failure context under:

```text
docs/conflict-archives/<timestamp>-classification-conflict/
```

Each archive must contain:

- `conflict_identity.md`
- `original/`
- `attempted-diff.patch`
- `validation-failure.md`
- `context.md`

Required contents:

- `conflict_identity.md`
  - affected files
  - attempted change type
  - classification category
  - failing validation scenario
  - subsystem involved
- `original/`
  - original snapshots of affected files
- `attempted-diff.patch`
  - exact proposed change
- `validation-failure.md`
  - failing enforcement layer
  - failing scenario
  - classification boundary violation
  - potential risk surface
- `context.md`
  - related schemas
  - related queries
  - related services
  - dependency graph
  - migration context

### Structural Classification Requirements

The repository must preserve explicit structural markers to make the validation deterministic.

Catalog structures:

- must be identifiable as shared, catalog, or global
- must not contain workspace ownership

Workspace-private structures:

- must include `workspace_id`
- must not rely on parent joins as the sole proof of ownership

Overlay structures:

- must include `workspace_id`
- must include a catalog reference identifier
- must make overlay ownership explicit

### Release Gate Requirement

No deployment, migration rollout, or schema-affecting refactor may proceed unless:

- Triple Scenario Classification Validation = PASS
- all four enforcement layers = PASS

This rule applies equally to:

- commits
- migrations
- refactors
- schema updates
- agent-generated code

### Operational Intent

This directive exists to eliminate classification drift, prevent cross-workspace data leaks, stabilize catalog versus workspace boundaries, and ensure deterministic ownership structures. During this phase, the agent's role is strict enforcement and documentation rather than repair. Unsafe changes must be blocked and archived, not fixed.

## Architectural Target

### Shared Data Plane

- `catalog_assets`
- `catalog_media`
- `catalog_asset_values`
- optional `catalog_tags` and `catalog_asset_tags`

### Private Data Plane

- `workspaces`
- `workspace_configurations`
- `configuration_slots`
- `workspace_asset_links`
- `slot_assignments`
- `workspace_logs`
- `workspace_wishlist_items`
- optional `workspace_asset_overrides`

### Authentication Plane

- `workspace_credentials`
- `workspace_sessions` only if server-side revocation tracking is introduced

### Presentation Plane

- Catalog browsing UI reads shared catalog endpoints.
- Private dashboard, configurations, wishlist, and logs read workspace-scoped endpoints.
- Public share routes read catalog-only resources.

## Recommended Cut Line For Initial Delivery

Implement the new data boundary first. Do not add remembered devices, approval-code enrollment, or device fingerprinting in the same tranche.

Initial delivery scope:

- two workspaces
- one PIN per workspace
- workspace-scoped sessions
- shared catalog
- private workspace logs, configurations, slot assignments, and wishlist
- public catalog only

Deferred scope:

- trusted devices
- device enrollment
- device recovery
- outbound email
- anti-spam controls
- per-record permissions within a workspace
- multi-workspace membership

## Runtime Wiring Changes

### Session Payload Contract

Replace the current single-role payload with a workspace-scoped payload.

Target interface in `src/lib/server/auth/token.ts`:

```ts
export interface WorkspaceSessionPayload {
  role: "workspace_member";
  workspaceId: string;
  workspaceSlug: string;
  iat: number;
  exp: number;
  version: 1;
}
```

Session tokens must be signed exactly as they are today, but the payload must include `workspaceId` and `workspaceSlug`.

### Session Creation Contract

Target API in `src/lib/server/auth/session.ts`:

```ts
import type { NextRequest, NextResponse } from "next/server";
import type { WorkspaceSessionPayload } from "@/lib/server/auth/token";

export interface AuthenticatedWorkspace {
  id: string;
  slug: string;
  name: string;
}

export async function setWorkspaceSessionCookie(
  response: NextResponse,
  workspace: AuthenticatedWorkspace,
): Promise<void>;

export async function getCurrentWorkspaceSession(): Promise<WorkspaceSessionPayload | null>;

export async function requireWorkspaceFromRequest(
  request: NextRequest,
): Promise<WorkspaceSessionPayload | null>;

export async function clearWorkspaceSessionCookie(
  response: NextResponse,
): Promise<void>;
```

### Authorization Guard Contract

Replace `ensureOwner` with workspace-aware authorization.

Target file: `src/lib/server/auth/workspace.ts`

```ts
import type { NextRequest } from "next/server";
import { apiError } from "@/lib/server/api-response";
import { requireWorkspaceFromRequest } from "@/lib/server/auth/session";

export interface WorkspaceGuardSuccess {
  ok: true;
  session: {
    workspaceId: string;
    workspaceSlug: string;
  };
}

export interface WorkspaceGuardFailure {
  ok: false;
  response: ReturnType<typeof apiError>;
}

export async function ensureWorkspaceAccess(
  request: NextRequest,
): Promise<WorkspaceGuardSuccess | WorkspaceGuardFailure> {
  const session = await requireWorkspaceFromRequest(request);
  if (!session) {
    return {
      ok: false,
      response: apiError(401, "UNAUTHORIZED", "You must be signed in."),
    };
  }

  return {
    ok: true,
    session: {
      workspaceId: session.workspaceId,
      workspaceSlug: session.workspaceSlug,
    },
  };
}
```

All private route handlers must use `ensureWorkspaceAccess` and must never accept workspace identity from request body or query string as the source of authority.

## Data Model

### New Tables

Create a new migration after `202603080003_app_pin.sql`. Do not rewrite historical migrations.

Target migration filename:

- `supabase/migrations/202603080004_dual_workspace_catalog.sql`

Migration content:

```sql
create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 3 and 32),
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workspace_credentials (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  pin_hash text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.catalog_assets (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null check (char_length(name) between 1 and 120),
  category asset_category not null,
  summary text,
  manufacturer text,
  model text,
  cover_image text,
  specs jsonb,
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists catalog_assets_category_idx
  on public.catalog_assets (category);

create index if not exists catalog_assets_public_idx
  on public.catalog_assets (is_public)
  where is_public = true;

create table if not exists public.catalog_media (
  id uuid primary key default gen_random_uuid(),
  catalog_asset_id uuid not null references public.catalog_assets(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists catalog_media_asset_idx
  on public.catalog_media (catalog_asset_id, sort_order);

create table if not exists public.catalog_asset_values (
  id uuid primary key default gen_random_uuid(),
  catalog_asset_id uuid not null references public.catalog_assets(id) on delete cascade,
  value_amount numeric(12, 2),
  value_currency text not null default 'GBP',
  source text,
  effective_at timestamptz not null default timezone('utc', now()),
  captured_at timestamptz not null default timezone('utc', now())
);

create index if not exists catalog_asset_values_asset_idx
  on public.catalog_asset_values (catalog_asset_id, effective_at desc);

create table if not exists public.workspace_configurations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  kind text not null check (char_length(kind) between 1 and 40),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists workspace_configurations_workspace_idx
  on public.workspace_configurations (workspace_id, updated_at desc);

create table if not exists public.configuration_slots (
  id uuid primary key default gen_random_uuid(),
  configuration_id uuid not null references public.workspace_configurations(id) on delete cascade,
  slot_key text not null,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (configuration_id, slot_key)
);

create index if not exists configuration_slots_configuration_idx
  on public.configuration_slots (configuration_id, sort_order);

create table if not exists public.workspace_asset_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  catalog_asset_id uuid not null references public.catalog_assets(id) on delete cascade,
  local_status asset_status not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (workspace_id, catalog_asset_id)
);

create index if not exists workspace_asset_links_workspace_idx
  on public.workspace_asset_links (workspace_id, updated_at desc);

create table if not exists public.slot_assignments (
  id uuid primary key default gen_random_uuid(),
  configuration_slot_id uuid not null references public.configuration_slots(id) on delete cascade,
  catalog_asset_id uuid not null references public.catalog_assets(id) on delete restrict,
  workspace_asset_link_id uuid references public.workspace_asset_links(id) on delete set null,
  installed_at date,
  removed_at date,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists slot_assignments_slot_idx
  on public.slot_assignments (configuration_slot_id, created_at desc);

create table if not exists public.workspace_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  workspace_asset_link_id uuid references public.workspace_asset_links(id) on delete cascade,
  slot_assignment_id uuid references public.slot_assignments(id) on delete cascade,
  type log_type not null default 'NOTE',
  title text not null check (char_length(title) between 1 and 120),
  description text,
  date date not null default current_date,
  mileage integer check (mileage is null or mileage >= 0),
  cost numeric(12, 2) check (cost is null or cost >= 0),
  performed_by text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists workspace_logs_workspace_idx
  on public.workspace_logs (workspace_id, date desc);

create table if not exists public.workspace_wishlist_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  catalog_asset_id uuid references public.catalog_assets(id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  brand text,
  url text,
  estimated_price numeric(12, 2) check (estimated_price is null or estimated_price >= 0),
  priority wishlist_priority not null default 'MEDIUM',
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists workspace_wishlist_workspace_idx
  on public.workspace_wishlist_items (workspace_id, priority, created_at desc);

alter table public.workspaces enable row level security;
alter table public.workspace_credentials enable row level security;
alter table public.catalog_assets enable row level security;
alter table public.catalog_media enable row level security;
alter table public.catalog_asset_values enable row level security;
alter table public.workspace_configurations enable row level security;
alter table public.configuration_slots enable row level security;
alter table public.workspace_asset_links enable row level security;
alter table public.slot_assignments enable row level security;
alter table public.workspace_logs enable row level security;
alter table public.workspace_wishlist_items enable row level security;

drop policy if exists "authenticated_read_catalog_assets" on public.catalog_assets;
create policy "authenticated_read_catalog_assets"
  on public.catalog_assets
  for select
  to authenticated
  using (true);

drop policy if exists "anon_read_public_catalog_assets" on public.catalog_assets;
create policy "anon_read_public_catalog_assets"
  on public.catalog_assets
  for select
  to anon
  using (is_public = true);

drop policy if exists "authenticated_read_catalog_media" on public.catalog_media;
create policy "authenticated_read_catalog_media"
  on public.catalog_media
  for select
  to authenticated
  using (true);

drop policy if exists "anon_read_catalog_media" on public.catalog_media;
create policy "anon_read_catalog_media"
  on public.catalog_media
  for select
  to anon
  using (
    exists (
      select 1
      from public.catalog_assets a
      where a.id = catalog_media.catalog_asset_id
        and a.is_public = true
    )
  );

drop policy if exists "authenticated_read_catalog_asset_values" on public.catalog_asset_values;
create policy "authenticated_read_catalog_asset_values"
  on public.catalog_asset_values
  for select
  to authenticated
  using (true);

drop policy if exists "anon_read_catalog_asset_values" on public.catalog_asset_values;
create policy "anon_read_catalog_asset_values"
  on public.catalog_asset_values
  for select
  to anon
  using (
    exists (
      select 1
      from public.catalog_assets a
      where a.id = catalog_asset_values.catalog_asset_id
        and a.is_public = true
    )
  );

-- Private tables intentionally expose no permissive anon or authenticated policies.
-- Application server uses the service role key and must enforce workspace scoping.

insert into public.workspaces (slug, name)
values
  ('asher', 'Asher Workspace'),
  ('alec', 'Alec Workspace')
on conflict (slug) do nothing;
```

### Migration Strategy

Strict ordering is required.

1. Create new tables first.
2. Seed the two workspace rows.
3. Backfill current `assets` into `catalog_assets`.
4. Backfill current `asset_logs` and `wishlist_items` into one chosen workspace only if you intentionally want legacy data preserved inside a single private space. Otherwise leave them untouched until a manual migration decision is made.
5. Do not drop legacy tables in the same migration tranche.
6. Switch the application to new tables.
7. After verification, create a later cleanup migration to archive or drop legacy private tables.

Backfill snippet for catalog assets:

```sql
insert into public.catalog_assets (
  id,
  name,
  category,
  cover_image,
  summary,
  is_public,
  created_at,
  updated_at
)
select
  a.id,
  a.name,
  a.category,
  a.cover_image,
  a.notes,
  coalesce(a.is_public, true),
  a.created_at,
  a.updated_at
from public.assets a
on conflict (id) do nothing;
```

If legacy `components` represent shared specifications, migrate them into `catalog_media` or a future `catalog_components` table only after classification. Do not assume all current components are globally shared without review.

## Type System Changes

### Replace Current Types With Shared And Workspace-Specific Types

Update `src/lib/types/index.ts` so shared catalog and private workspace data are distinct.

Target additions:

```ts
export interface CatalogAsset {
  id: string;
  slug?: string | null;
  name: string;
  category: AssetCategory;
  summary?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  coverImage?: string | null;
  specs?: Record<string, string> | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceAssetLink {
  id: string;
  workspaceId: string;
  catalogAssetId: string;
  localStatus: AssetStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceConfiguration {
  id: string;
  workspaceId: string;
  name: string;
  kind: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigurationSlot {
  id: string;
  configurationId: string;
  slotKey: string;
  label: string;
  sortOrder: number;
  createdAt: string;
}

export interface SlotAssignment {
  id: string;
  configurationSlotId: string;
  catalogAssetId: string;
  workspaceAssetLinkId?: string | null;
  installedAt?: string | null;
  removedAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface WorkspaceLog {
  id: string;
  workspaceId: string;
  workspaceAssetLinkId?: string | null;
  slotAssignmentId?: string | null;
  type: LogType;
  title: string;
  description?: string | null;
  date: string;
  mileage?: number | null;
  cost?: number | null;
  performedBy?: string | null;
  createdAt: string;
}

export interface WorkspaceWishlistItem {
  id: string;
  workspaceId: string;
  catalogAssetId?: string | null;
  name: string;
  brand?: string | null;
  url?: string | null;
  estimatedPrice?: number | null;
  priority: WishlistPriority;
  notes?: string | null;
  createdAt: string;
}

export interface WorkspaceSummary {
  id: string;
  slug: string;
  name: string;
}
```

Do not overload the existing `Asset` interface to mean both catalog asset and workspace-specific asset usage. That ambiguity will reintroduce cross-boundary defects.

## Mapper Changes

Update `src/lib/server/mappers.ts` by adding explicit mapping families.

Required mapping groups:

- `mapCatalogAssetRow`
- `mapCatalogAssetInsert`
- `mapWorkspaceAssetLinkRow`
- `mapWorkspaceAssetLinkInsert`
- `mapWorkspaceLogRow`
- `mapWorkspaceLogInsert`
- `mapWorkspaceWishlistRow`
- `mapWorkspaceWishlistInsert`

Example mapper pattern:

```ts
type CatalogAssetRow = Database["public"]["Tables"]["catalog_assets"]["Row"];
type WorkspaceAssetLinkRow =
  Database["public"]["Tables"]["workspace_asset_links"]["Row"];

export function mapCatalogAssetRow(row: CatalogAssetRow): CatalogAsset {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    summary: row.summary,
    manufacturer: row.manufacturer,
    model: row.model,
    coverImage: row.cover_image,
    specs: (row.specs as Record<string, string> | null) ?? null,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapWorkspaceAssetLinkRow(
  row: WorkspaceAssetLinkRow,
): WorkspaceAssetLink {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    catalogAssetId: row.catalog_asset_id,
    localStatus: row.local_status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
```

## Validation Layer Changes

Update `src/lib/server/validation.ts` to add validators for catalog and workspace-local operations.

Required validators:

- `validateWorkspaceLoginInput`
- `validateCreateCatalogAssetInput`
- `validateUpdateCatalogAssetInput`
- `validateCreateWorkspaceConfigurationInput`
- `validateCreateConfigurationSlotInput`
- `validateCreateWorkspaceAssetLinkInput`
- `validateCreateWorkspaceLogInput`
- `validateCreateWorkspaceWishlistInput`

Target login validator:

```ts
export interface WorkspaceLoginInput {
  workspaceSlug: string;
  pin: string;
}

export function validateWorkspaceLoginInput(
  body: unknown,
): WorkspaceLoginInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }

  const input = body as Record<string, unknown>;
  const workspaceSlug = assertString(
    input.workspaceSlug,
    "workspaceSlug",
  ).toLowerCase();
  const pin = assertString(input.pin, "pin");

  if (!/^[a-z0-9-]{3,32}$/.test(workspaceSlug)) {
    throw new ValidationError(
      "workspaceSlug must be 3-32 characters of lowercase letters, digits, or hyphens",
    );
  }

  if (!/^\d{6}$/.test(pin)) {
    throw new ValidationError("PIN must be exactly 6 digits");
  }

  return { workspaceSlug, pin };
}
```

## API Surface

### Authentication Endpoints

Introduce a workspace-oriented auth route family.

Required routes:

- `POST /api/auth/workspace/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET /api/auth/workspaces` only if the login screen must list the two workspaces explicitly

Target login route file:

- `src/app/api/auth/workspace/login/route.ts`

Implementation:

```ts
import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/server/api-response";
import { setWorkspaceSessionCookie } from "@/lib/server/auth/session";
import {
  validateWorkspaceLoginInput,
  ValidationError,
} from "@/lib/server/validation";
import { verifyWorkspacePin } from "@/lib/server/auth/workspace-pin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = validateWorkspaceLoginInput(body);
    const workspace = await verifyWorkspacePin(input.workspaceSlug, input.pin);

    if (!workspace) {
      return apiError(
        401,
        "INVALID_CREDENTIALS",
        "Incorrect workspace or PIN.",
      );
    }

    const response = NextResponse.json({
      authenticated: true,
      workspace: {
        id: workspace.id,
        slug: workspace.slug,
        name: workspace.name,
      },
    });

    await setWorkspaceSessionCookie(response, workspace);
    return response;
  } catch (error) {
    if (error instanceof ValidationError) {
      return apiError(400, "VALIDATION_ERROR", error.message);
    }
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return apiError(400, "MALFORMED_JSON", "Invalid JSON payload provided.");
    }
    return apiError(500, "UNKNOWN_ERROR", "Unexpected server error.");
  }
}
```

Supporting auth helper in `src/lib/server/auth/workspace-pin.ts`:

```ts
import { verify } from "@node-rs/argon2";
import { getServiceSupabase } from "@/lib/server/supabase";

export interface VerifiedWorkspace {
  id: string;
  slug: string;
  name: string;
}

export async function verifyWorkspacePin(
  workspaceSlug: string,
  pin: string,
): Promise<VerifiedWorkspace | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("workspaces")
    .select("id, slug, name, workspace_credentials(pin_hash)")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (error || !data) return null;

  const pinHash = Array.isArray(data.workspace_credentials)
    ? data.workspace_credentials[0]?.pin_hash
    : data.workspace_credentials?.pin_hash;

  if (!pinHash) return null;

  try {
    const ok = await verify(pinHash, pin);
    if (!ok) return null;
  } catch {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
  };
}
```

### Catalog Endpoints

Add catalog route family under `src/app/api/catalog/**`.

Required routes:

- `GET /api/catalog/assets`
- `GET /api/catalog/assets/[id]`
- `GET /api/catalog/assets/[id]/media`
- `GET /api/catalog/assets/[id]/values`

Private write routes for catalog administration may be deferred or restricted to a single administrative workspace later.

Catalog list route contract:

```ts
export interface CatalogAssetListQuery {
  category?: AssetCategory;
  search?: string;
  publicOnly?: boolean;
}
```

### Workspace Endpoints

Create a separate route family under `src/app/api/workspace/**`.

Required routes:

- `GET /api/workspace/me`
- `GET /api/workspace/assets`
- `POST /api/workspace/assets`
- `PATCH /api/workspace/assets/[id]`
- `DELETE /api/workspace/assets/[id]`
- `GET /api/workspace/configurations`
- `POST /api/workspace/configurations`
- `GET /api/workspace/configurations/[id]/slots`
- `POST /api/workspace/configurations/[id]/slots`
- `POST /api/workspace/slots/[id]/assignments`
- `GET /api/workspace/logs`
- `POST /api/workspace/logs`
- `GET /api/workspace/wishlist`
- `POST /api/workspace/wishlist`

Do not retain the current `asset_id`-anchored child route structure for private data. Private routes must be workspace-rooted to make scoping explicit.

Example workspace assets route:

```ts
import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { ensureWorkspaceAccess } from "@/lib/server/auth/workspace";
import { getServiceSupabase } from "@/lib/server/supabase";
import {
  mapWorkspaceAssetLinkRow,
  mapCatalogAssetRow,
} from "@/lib/server/mappers";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("workspace_asset_links")
    .select(
      `
      *,
      catalog_assets (*)
    `,
    )
    .eq("workspace_id", auth.session.workspaceId)
    .order("updated_at", { ascending: false });

  if (error) {
    return apiError(
      500,
      "DB_ERROR",
      "Failed to fetch workspace assets.",
      error.message,
    );
  }

  return apiOk(
    (data ?? []).map((row) => ({
      link: mapWorkspaceAssetLinkRow(row),
      catalogAsset: row.catalog_assets
        ? mapCatalogAssetRow(row.catalog_assets)
        : null,
    })),
  );
}
```

## Middleware And Routing

Update `src/proxy.ts` to understand the new public and private route classes.

Public route classes:

- `/login`
- `/catalog/**`
- `/share/**` only if share pages are catalog-only
- `/api/auth/workspace/login`
- `/api/auth/session`
- `/api/catalog/**`

Private route classes:

- `/`
- `/dashboard`
- `/workspace/**`
- `/api/workspace/**`

Proxy behavior:

1. Permit public catalog routes without a session.
2. If a session exists and the user hits `/login`, redirect to `/workspace`.
3. Require a valid workspace session for all private routes.
4. Preserve `next` on redirect.

Target pattern:

```ts
const publicPagePrefixes = ["/login", "/catalog", "/share"];
const publicApiPrefixes = [
  "/api/auth/workspace/login",
  "/api/auth/session",
  "/api/catalog",
];
```

Do not classify old `api/public/assets` as authoritative after the migration. Replace it with catalog routes.

## Client State Refactor

### Store Split

Current global `useAppStore` cannot survive workspace isolation because it has a single `assets` array with no workspace key.

Refactor options:

- preferred: remove the global asset store and use route-local hooks for catalog and workspace data separately
- acceptable: key the store by workspace id and domain collection

Preferred minimal store shape if Zustand remains:

```ts
interface WorkspaceScopedCollections<T> {
  [workspaceId: string]: T[] | undefined;
}

interface AppStore {
  currentWorkspace: WorkspaceSummary | null;
  catalogAssets: CatalogAsset[];
  workspaceAssetLinks: WorkspaceScopedCollections<WorkspaceAssetLink>;
  workspaceLogs: WorkspaceScopedCollections<WorkspaceLog>;
  workspaceWishlist: WorkspaceScopedCollections<WorkspaceWishlistItem>;
  isLoading: boolean;
  error: string | null;
  setCurrentWorkspace: (workspace: WorkspaceSummary | null) => void;
}
```

### Hook Split

Replace `useAssets` with:

- `useCatalogAssets`
- `useWorkspaceAssets`
- `useWorkspaceLogs`
- `useWorkspaceWishlist`
- `useWorkspaceConfigurations`

Example `useWorkspaceAssets` contract:

```ts
export interface WorkspaceAssetView {
  link: WorkspaceAssetLink;
  catalogAsset: CatalogAsset | null;
}

export function useWorkspaceAssets() {
  return {
    assets: [] as WorkspaceAssetView[],
    isLoading: false,
    error: null as string | null,
    fetchAssets: async () => {},
    createAssetLink: async (
      _catalogAssetId: string,
      _input: { localStatus: AssetStatus; notes?: string | null },
    ) => {},
    updateAssetLink: async (
      _id: string,
      _updates: Partial<Pick<WorkspaceAssetLink, "localStatus" | "notes">>,
    ) => {},
    deleteAssetLink: async (_id: string) => {},
  };
}
```

## UI Refactor

### Login Screen

Replace the current PIN-only form in `src/app/login/page.tsx` with a workspace-select plus PIN form.

Required UI states:

- workspace list loaded
- workspace selected
- PIN entry
- submission in progress
- invalid credentials
- session already active redirect

Minimal login request shape:

```json
{
  "workspaceSlug": "asher",
  "pin": "123456"
}
```

### Dashboard

Replace the current dashboard statistics that assume one global asset list. Dashboard must now summarize workspace-local data only.

Recommended dashboard cards:

- linked assets count
- active configurations count
- workspace wishlist count
- recent workspace logs count

### Catalog UI

Add a separate catalog browse surface.

Recommended top-level route:

- `src/app/(root)/catalog/page.tsx`

### Private Workspace UI

Recommended routes:

- `src/app/(root)/workspace/page.tsx`
- `src/app/(root)/workspace/configurations/page.tsx`
- `src/app/(root)/workspace/wishlist/page.tsx`
- `src/app/(root)/workspace/logs/page.tsx`

## Database Type Generation

After the migration is applied, regenerate or manually update `src/lib/types/database.ts` to include the new tables. This step is strict-ordering critical because mapper and route compilation depend on it.

If generation is manual in this repository, update the following sections:

- `Database["public"]["Tables"]`
- table `Row`, `Insert`, `Update` shapes for all newly added tables
- any removed dependency on `app_pin` if later retired

## Execution Phases

## Phase 0: Classification Hardening Gate

Strict ordering: mandatory before any schema draft, migration edit, route refactor, query rewrite, or model update.

Actions:

1. Enumerate every touched file that intersects schema, migrations, queries, routes, models, and mappers.
2. Classify each touched artifact as `CATALOG_SHARED`, `WORKSPACE_PRIVATE`, `OVERLAY_STRUCTURE`, or `UNKNOWN`.
3. Run schema-level inspection against every SQL migration and every generated or handwritten database type update.
4. Run query isolation review against every private route, mapper, helper, and hook that loads or mutates private state.
5. Simulate boundary crossings for catalog reads, overlay joins, and workspace-rooted queries.
6. If any artifact remains `UNKNOWN`, stop and archive the failure context.

Required outputs before work may continue:

- classification inventory for all affected files
- explicit pass/fail for Scenario A, Scenario B, and Scenario C
- explicit pass/fail for all four enforcement layers
- archive path prepared if any layer fails

Hard stop conditions:

- `UNKNOWN` classification
- catalog table containing `workspace_id`
- private query missing a direct `workspace_id` predicate
- overlay structure missing both workspace ownership and catalog reference
- any simulated leak path from private state into catalog-visible reads

The execution agent is not permitted to repair failures discovered in this phase. Failures are documented, archived, and escalated.

## Phase 1: Baseline Preservation

Strict ordering: required first.

Actions:

1. Preserve the current branch state.
2. Do not delete existing route handlers or tables yet.
3. Create the new migration file only.
4. Add new type definitions and new route families beside the legacy ones.

Delegation:

- Delegate schema drafting and type mapping to one subagent.
- Delegate route surface planning and client hook split to a second subagent.

Persisted context required across execution boundary:

- authoritative invariants
- route family split
- naming conventions
- decision that public share is catalog-only

> **On completion:** update `docs/dual-workspace-catalog-execution-spec-build-status.md` — Phase 1 section.

## Phase 2: Schema Introduction

Strict ordering: after Phase 0 and Phase 1, before any runtime wiring.

Actions:

1. Add `202603080004_dual_workspace_catalog.sql`.
2. Seed workspaces.
3. Backfill current `assets` into `catalog_assets`.
4. Apply migration in a disposable environment first.

Parallelizable work:

- write migration
- prepare database type updates

Validation:

- `workspaces` contains exactly two rows
- `catalog_assets` contains migrated legacy assets
- no legacy tables dropped

> **On completion:** update `docs/dual-workspace-catalog-execution-spec-build-status.md` — Phase 2 section.

## Phase 3: Session Rewire

Strict ordering: after Phase 2.

Actions:

1. Add workspace-scoped token payload.
2. Replace owner session helpers with workspace helpers.
3. Add `/api/auth/workspace/login`.
4. Update `/api/auth/session` and `/api/auth/logout` to report workspace-aware state.
5. Update `src/proxy.ts` to use workspace session checks.

Validation:

- login to workspace A yields session A
- login to workspace B yields session B
- invalid PIN rejected
- `/login` redirects when a valid session exists

> **On completion:** update `docs/dual-workspace-catalog-execution-spec-build-status.md` — Phase 3 section.

## Phase 4: New Route Families

Strict ordering: after Phase 3.

Actions:

1. Add `/api/catalog/**`.
2. Add `/api/workspace/**`.
3. Implement server-side scoping with `auth.session.workspaceId` on every private query.
4. Leave legacy `/api/assets/**` in place but unused.

Parallelizable work:

- catalog read routes
- workspace CRUD routes

Validation:

- workspace A cannot read workspace B data even if ids are guessed
- public catalog routes work unauthenticated
- workspace routes require a valid session

> **On completion:** update `docs/dual-workspace-catalog-execution-spec-build-status.md` — Phase 4 section.

## Phase 5: Client And UI Migration

Strict ordering: after Phase 4.

Actions:

1. Replace login form.
2. Replace global asset store usage.
3. Build catalog browse page.
4. Build workspace dashboard and private screens.
5. Repoint existing links and navigation.

Parallelizable work:

- login UI
- catalog pages
- workspace pages

Validation:

- user can browse catalog without leaking private data
- user sees only their own workspace logs and wishlist after sign-in
- dashboard counts differ correctly between workspace A and workspace B

> **On completion:** update `docs/dual-workspace-catalog-execution-spec-build-status.md` — Phase 5 section.

## Phase 6: Legacy Decommissioning

Strict ordering: only after all prior phases are verified.

Actions:

1. Remove or archive legacy asset routes.
2. Remove passcode-era documentation.
3. Replace stale smoke tests.
4. Add a later cleanup migration for legacy private tables only after data disposition is decided.

> **On completion:** update `docs/dual-workspace-catalog-execution-spec-build-status.md` — Phase 6 section.

## Testing Specification

### Classification Validation Matrix

1. Any changed schema artifact can be classified without ambiguity.
2. Any catalog artifact under review proves it does not require workspace context.
3. Any workspace-private artifact under review proves direct deterministic workspace ownership.
4. Any overlay artifact under review proves both `workspace_id` ownership and catalog reference.
5. Any artifact failing one of the above conditions produces an archive and terminates the pipeline without auto-repair.

### API Validation Matrix

1. Unauthenticated request to `/api/workspace/assets` returns 401.
2. Authenticated workspace A request to `/api/workspace/assets` returns only workspace A links.
3. Authenticated workspace B request to `/api/workspace/assets` returns only workspace B links.
4. Unauthenticated request to `/api/catalog/assets` succeeds and returns only public catalog rows if the route is public.
5. Unauthenticated request to private logs endpoint fails.

### Browser Validation Matrix

1. Login as workspace A and create a wishlist item.
2. Log out.
3. Login as workspace B and verify the wishlist item is absent.
4. Browse the shared catalog and verify the relevant catalog asset exists.
5. Create a workspace asset link for workspace B and verify it does not appear in workspace A.

### Fault Injection

1. Manually alter a private route request id to reference another workspace's record and verify the API returns 404 or 403 without disclosing foreign existence.
2. Expire the session and verify proxy redirect behavior.
3. Remove one workspace credential row in a test environment and verify login failure is deterministic and non-destructive.

## Playwright Expansion

Replace the current single-session smoke flow in `tests/smoke.spec.ts` with multi-workspace coverage.

Recommended environment variables:

- `E2E_WORKSPACE_A_SLUG`
- `E2E_WORKSPACE_A_PIN`
- `E2E_WORKSPACE_B_SLUG`
- `E2E_WORKSPACE_B_PIN`
- `E2E_BASE_URL`

Recommended test cases:

1. catalog browse unauthenticated
2. workspace A login and create private wishlist item
3. workspace B login and confirm workspace A item is invisible
4. workspace A create configuration and slot assignment
5. workspace B confirm the slot assignment is invisible

## Documentation Updates

Update these files in the same tranche as runtime wiring:

- `README.md`
- `.env.example`
- `supabase/README.md`

Required documentation changes:

- replace passcode terminology with workspace PIN terminology
- replace single-owner language with dual-workspace language
- document migration ordering
- document new E2E variables
- document that the catalog is shared while workspace data is private

## Operational Commands

Validation gate sequence before mutation:

```powershell
git diff --name-only
rg -n "workspace_id|catalog_asset_id|from\(|select\(|\.from\(" src supabase
```

Use the validation gate output to produce a classification inventory before writing or applying any migration.

Run sequence:

```powershell
npm run lint
npm run typecheck
npm run build
```

Database application sequence:

```powershell
supabase link --project-ref <project-ref>
supabase db push
```

If a disposable environment is available, run migrations there first.

Archive-on-failure sequence:

```powershell
New-Item -ItemType Directory -Force docs/conflict-archives/<timestamp>-classification-conflict
```

Populate the archive with the required files from the directive before resuming any planning activity.

## Failure Handling

### Failure Mode: Session Routing Defect

Symptom:

- valid logins redirect incorrectly or private routes deny access

Mitigation:

1. Disable new private route navigation in the UI.
2. Revert `src/proxy.ts`, `src/lib/server/auth/session.ts`, and `src/lib/server/auth/token.ts` to the prior release state.
3. Leave new tables in place. They are additive and non-destructive.

### Failure Mode: Workspace Data Leakage

Symptom:

- one workspace can observe another workspace's data

Mitigation:

1. Treat as release-blocking.
2. Stop rollout.
3. Audit all private route handlers for missing `workspace_id` predicates.
4. Add regression tests before resuming.
5. If the leak emerged during the classification hardening gate, archive the failure and stop rather than patching forward.

### Failure Mode: Catalog/Private Model Misclassification

Symptom:

- current legacy components or logs were migrated into the wrong layer

Mitigation:

1. Preserve legacy tables until post-cutover validation is complete.
2. Re-run only the classification/backfill step.
3. Do not drop source tables until manual spot-checks pass.
4. If misclassification is discovered before mutation, create the conflict archive and abort the pipeline.

## Delegation Plan For Agentic Execution

### Delegate In Parallel

- Subagent A: schema migration and `database.ts` updates
- Subagent B: auth/session runtime wiring and proxy changes
- Subagent C: client hook split and store refactor
- Subagent D: documentation and test rewrite

### Enforce Strict Order

1. classification hardening gate
2. baseline preservation
3. schema introduction
4. database type updates
5. auth/session runtime wiring
6. route family implementation
7. client migration
8. documentation and tests
9. cleanup

### Persist Across Execution Boundaries

Any agent handoff must carry these exact facts:

- sessions are scoped to one workspace
- catalog is shared and canonical
- private data is workspace-scoped and mutually invisible
- private queries must derive scope from session, never from client authority
- legacy tables remain until cutover verification completes
- classification failures are blocked and archived, never auto-repaired in the enforcement phase

## File-Level Change Map

Create or update these files:

- `supabase/migrations/202603080004_dual_workspace_catalog.sql`
- `src/lib/server/auth/token.ts`
- `src/lib/server/auth/session.ts`
- `src/lib/server/auth/workspace.ts`
- `src/lib/server/auth/workspace-pin.ts`
- `src/proxy.ts`
- `src/lib/types/index.ts`
- `src/lib/types/database.ts`
- `src/lib/server/mappers.ts`
- `src/lib/server/validation.ts`
- `src/app/api/auth/workspace/login/route.ts`
- `src/app/api/catalog/assets/route.ts`
- `src/app/api/catalog/assets/[id]/route.ts`
- `src/app/api/workspace/assets/route.ts`
- `src/app/api/workspace/assets/[id]/route.ts`
- `src/app/api/workspace/configurations/route.ts`
- `src/app/api/workspace/configurations/[id]/slots/route.ts`
- `src/app/api/workspace/slots/[id]/assignments/route.ts`
- `src/app/api/workspace/logs/route.ts`
- `src/app/api/workspace/wishlist/route.ts`
- `src/lib/hooks/useCatalogAssets.ts`
- `src/lib/hooks/useWorkspaceAssets.ts`
- `src/lib/hooks/useWorkspaceLogs.ts`
- `src/lib/hooks/useWorkspaceWishlist.ts`
- `src/lib/hooks/useWorkspaceConfigurations.ts`
- `src/app/login/page.tsx`
- `src/components/dashboard/Dashboard.tsx`
- `tests/smoke.spec.ts`
- `README.md`
- `supabase/README.md`
- `.env.example`

## Completion Criteria

The implementation is complete only when all of the following are true:

1. Both workspaces can authenticate independently.
2. Shared catalog data is visible to both workspaces and optionally to anonymous users where marked public.
3. Workspace A cannot see workspace B logs, wishlist items, configurations, slot assignments, or local asset links.
4. Workspace B cannot see workspace A private data.
5. The client no longer relies on a single global asset list for private screens.
6. Tests cover cross-workspace isolation.
7. Legacy routes are no longer used by the UI.
8. Documentation matches runtime behavior.

## Operator Notes

This implementation is a boundary correction, not an incremental auth tweak. The critical success factor is keeping the shared catalog and private workspace overlays distinct in schema, code, and runtime authorization. Any shortcut that merges those layers will reintroduce the original design error.

Operator runbook:

1. Start every tranche by running the classification hardening gate and recording the artifact classifications before editing schema, queries, or routes.
2. If any artifact is ambiguous, stop immediately and archive the failure under `docs/conflict-archives/<timestamp>-classification-conflict/`.
3. Do not allow service-layer-only filtering to stand in for structural workspace ownership.
4. Do not drop legacy tables until both workspace isolation tests and catalog integrity checks pass.
5. Treat any observed cross-workspace read, inferred existence leak, or ambiguous overlay ownership as release-blocking.
6. Resume implementation only after the hardening gate returns a full pass across all scenarios and enforcement layers.
