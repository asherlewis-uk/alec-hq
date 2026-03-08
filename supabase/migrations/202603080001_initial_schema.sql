create extension if not exists pgcrypto;

do $$
begin
  create type asset_category as enum ('VEHICLE', 'RIG', 'PERIPHERAL', 'NETWORK');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type asset_status as enum ('ACTIVE', 'STORED', 'SOLD', 'WISHLIST');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type component_condition as enum ('STOCK', 'UPGRADED', 'AFTERMARKET', 'WORN', 'FAILED');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type log_type as enum ('MAINTENANCE', 'UPGRADE', 'REPAIR', 'INSPECTION', 'NOTE');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type wishlist_priority as enum ('LOW', 'MEDIUM', 'HIGH');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  category asset_category not null,
  status asset_status not null default 'ACTIVE',
  cover_image text,
  purchase_date date,
  purchase_price numeric(12, 2) check (purchase_price is null or purchase_price >= 0),
  notes text,
  is_public boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists assets_category_idx on public.assets (category);
create index if not exists assets_status_idx on public.assets (status);
create index if not exists assets_updated_at_idx on public.assets (updated_at desc);
create index if not exists assets_public_idx on public.assets (is_public) where is_public = true;

create table if not exists public.components (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  brand text,
  model text,
  specs jsonb,
  condition component_condition not null default 'STOCK',
  installed_date date,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists components_asset_id_idx on public.components (asset_id);
create index if not exists components_created_at_idx on public.components (created_at desc);

create table if not exists public.asset_logs (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  type log_type not null default 'NOTE',
  title text not null check (char_length(title) between 1 and 100),
  description text,
  date date not null default current_date,
  mileage integer check (mileage is null or mileage >= 0),
  cost numeric(12, 2) check (cost is null or cost >= 0),
  performed_by text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists asset_logs_asset_id_idx on public.asset_logs (asset_id);
create index if not exists asset_logs_date_idx on public.asset_logs (date desc);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  brand text,
  url text,
  estimated_price numeric(12, 2) check (estimated_price is null or estimated_price >= 0),
  priority wishlist_priority not null default 'MEDIUM',
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists wishlist_asset_id_idx on public.wishlist_items (asset_id);
create index if not exists wishlist_priority_idx on public.wishlist_items (priority, created_at desc);

create table if not exists public.auth_attempts (
  ip_hash text primary key,
  window_start timestamptz not null default timezone('utc', now()),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  blocked_until timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.assets enable row level security;
alter table public.components enable row level security;
alter table public.asset_logs enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.auth_attempts enable row level security;

drop policy if exists "anon_can_read_public_assets" on public.assets;
create policy "anon_can_read_public_assets"
  on public.assets
  for select
  to anon
  using (is_public = true);

drop policy if exists "anon_can_read_components_of_public_assets" on public.components;
create policy "anon_can_read_components_of_public_assets"
  on public.components
  for select
  to anon
  using (
    exists (
      select 1
      from public.assets a
      where a.id = components.asset_id
        and a.is_public = true
    )
  );

drop policy if exists "authenticated_full_access_assets" on public.assets;
create policy "authenticated_full_access_assets"
  on public.assets
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated_full_access_components" on public.components;
create policy "authenticated_full_access_components"
  on public.components
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated_full_access_asset_logs" on public.asset_logs;
create policy "authenticated_full_access_asset_logs"
  on public.asset_logs
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated_full_access_wishlist" on public.wishlist_items;
create policy "authenticated_full_access_wishlist"
  on public.wishlist_items
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated_full_access_auth_attempts" on public.auth_attempts;
create policy "authenticated_full_access_auth_attempts"
  on public.auth_attempts
  for all
  to authenticated
  using (true)
  with check (true);
