-- Single-row table to store the owner's 6-digit PIN hash
create table if not exists public.app_pin (
  id boolean primary key default true check (id = true),
  pin_hash text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.app_pin enable row level security;

-- Service role (used by app server) bypasses RLS automatically.
-- No permissive policies = anon/authenticated cannot read or write.

-- Drop old rate-limiting infrastructure
drop function if exists increment_failed_attempt(text, int, int, int);
drop table if exists public.auth_attempts;
