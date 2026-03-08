-- Phase 1: Dual Workspace Catalog — new tables alongside legacy
-- Does NOT drop or modify any existing tables.

create extension if not exists pgcrypto;

-- =============================================================
-- WORKSPACE_PRIVATE: workspaces
-- =============================================================
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 3 and 32),
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- =============================================================
-- WORKSPACE_PRIVATE: workspace_credentials
-- =============================================================
create table if not exists public.workspace_credentials (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  pin_hash text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- =============================================================
-- CATALOG_SHARED: catalog_assets
-- =============================================================
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

-- =============================================================
-- CATALOG_SHARED: catalog_media
-- =============================================================
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

-- =============================================================
-- CATALOG_SHARED: catalog_asset_values
-- =============================================================
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

-- =============================================================
-- WORKSPACE_PRIVATE: workspace_configurations
-- =============================================================
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

-- =============================================================
-- WORKSPACE_PRIVATE: configuration_slots
-- Binding condition 1: includes direct workspace_id
-- =============================================================
create table if not exists public.configuration_slots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  configuration_id uuid not null references public.workspace_configurations(id) on delete cascade,
  slot_key text not null,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (configuration_id, slot_key)
);

create index if not exists configuration_slots_configuration_idx
  on public.configuration_slots (configuration_id, sort_order);

create index if not exists configuration_slots_workspace_idx
  on public.configuration_slots (workspace_id);

-- =============================================================
-- OVERLAY_STRUCTURE: workspace_asset_links
-- =============================================================
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

-- =============================================================
-- OVERLAY_STRUCTURE: slot_assignments
-- Binding condition 2: includes direct workspace_id
-- =============================================================
create table if not exists public.slot_assignments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
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

create index if not exists slot_assignments_workspace_idx
  on public.slot_assignments (workspace_id);

-- =============================================================
-- WORKSPACE_PRIVATE: workspace_logs
-- =============================================================
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

-- =============================================================
-- WORKSPACE_PRIVATE: workspace_wishlist_items
-- =============================================================
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

-- =============================================================
-- Row Level Security
-- =============================================================
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

-- CATALOG_SHARED: catalog_assets RLS
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

-- CATALOG_SHARED: catalog_media RLS
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

-- CATALOG_SHARED: catalog_asset_values RLS
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

-- WORKSPACE_PRIVATE & OVERLAY tables: no permissive anon/authenticated policies.
-- Application server uses the service role key and must enforce workspace scoping.

-- =============================================================
-- Seed workspaces
-- =============================================================
insert into public.workspaces (slug, name)
values
  ('asher', 'Asher Workspace'),
  ('alec', 'Alec Workspace')
on conflict (slug) do nothing;
