-- Phase 6b: Catalog components compatibility tranche
-- Filename retained for migration-chain continuity.
-- This migration introduces catalog_components and backfills it from
-- legacy components while intentionally preserving the legacy tables.
-- Prerequisites:
--   - Public share route migrated to catalog_assets + catalog_components
--   - Data backfilled: assets → catalog_assets (migration 004)
--   - Data backfilled: components → catalog_components (below)

-- =============================================================
-- CATALOG_SHARED: catalog_components
-- Mirrors legacy components structure with catalog_asset_id FK.
-- RLS follows catalog_media pattern.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.catalog_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_asset_id uuid NOT NULL REFERENCES public.catalog_assets(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  brand text,
  model text,
  specs jsonb,
  condition component_condition NOT NULL DEFAULT 'STOCK',
  installed_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS catalog_components_asset_idx
  ON public.catalog_components (catalog_asset_id);

CREATE INDEX IF NOT EXISTS catalog_components_created_at_idx
  ON public.catalog_components (created_at DESC);

ALTER TABLE public.catalog_components ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_catalog_components" ON public.catalog_components;
CREATE POLICY "anon_read_catalog_components"
  ON public.catalog_components
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM public.catalog_assets a
      WHERE a.id = catalog_components.catalog_asset_id
        AND a.is_public = true
    )
  );

DROP POLICY IF EXISTS "authenticated_read_catalog_components" ON public.catalog_components;
CREATE POLICY "authenticated_read_catalog_components"
  ON public.catalog_components
  FOR SELECT
  TO authenticated
  USING (true);

-- =============================================================
-- Backfill: legacy components → catalog_components
-- Uses same ID for idempotency. Only copies records whose
-- asset_id exists in catalog_assets (guaranteed by migration 004).
-- =============================================================
INSERT INTO public.catalog_components (
  id, catalog_asset_id, name, brand, model, specs,
  condition, installed_date, notes, created_at
)
SELECT
  c.id,
  c.asset_id,
  c.name,
  c.brand,
  c.model,
  c.specs,
  c.condition::component_condition,
  c.installed_date,
  c.notes,
  c.created_at
FROM public.components c
WHERE EXISTS (
  SELECT 1 FROM public.catalog_assets ca WHERE ca.id = c.asset_id
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================
-- Legacy tables are intentionally preserved for compatibility.
-- No DROP TABLE statements belong in this migration.
-- =============================================================
