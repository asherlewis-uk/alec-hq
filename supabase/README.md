# Supabase Migrations

Apply schema and policies with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This folder is the source of truth for:

- Shared catalog tables (`catalog_assets`, `catalog_media`, `catalog_asset_values`, `catalog_components`)
- Workspace-private tables (`workspaces`, `workspace_credentials`, `workspace_asset_links`, `workspace_configurations`, `configuration_slots`, `slot_assignments`, `workspace_logs`, `workspace_wishlist_items`)
- Optional future table: `workspace_sessions`, only if later introduced for server-side revocation tracking
- Historical migration context: `202603080001_initial_schema.sql` and `202603080003_app_pin.sql` created the legacy tables, and `202603080005_drop_legacy_tables.sql` backfilled `catalog_components` while preserving them at that stage
- Current schema truth after `202603220001_cleanup_verified_legacy_tables.sql`: `assets`, `components`, `asset_logs`, `wishlist_items`, and `app_pin` are removed from the live schema
- RLS policies:
  - Anonymous users can only read public catalog data (`catalog_assets.is_public=true`)
  - Workspace-private data is scoped to `workspace_id` and enforced at application layer
  - Anonymous writes are blocked
