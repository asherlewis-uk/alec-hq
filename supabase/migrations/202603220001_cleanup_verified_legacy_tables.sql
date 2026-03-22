-- Post-verification legacy cleanup migration.
-- Historical migrations 001-005 remain untouched for replayability and audit.
-- Verification confirmed that current runtime paths use:
--   - public share: catalog_assets + catalog_components
--   - workspace asset flows: workspace_asset_links + catalog_assets
--   - workspace login: workspace_credentials
-- Apply only after taking separate exports of:
--   public.assets, public.components, public.asset_logs,
--   public.wishlist_items, and public.app_pin.
-- Intentionally avoids CASCADE so unexpected dependencies fail loudly.

-- Drop child tables before the legacy parent asset table.
DROP TABLE IF EXISTS public.components;
DROP TABLE IF EXISTS public.asset_logs;
DROP TABLE IF EXISTS public.wishlist_items;

-- Drop the now-unused legacy parent/shared-auth tables last.
DROP TABLE IF EXISTS public.assets;
DROP TABLE IF EXISTS public.app_pin;
