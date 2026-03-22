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
- Legacy compatibility tables (`assets`, `components`, `asset_logs`, `wishlist_items`, `app_pin`) are preserved; `202603080005_drop_legacy_tables.sql` backfills `catalog_components` without dropping them
- RLS policies:
  - Anonymous users can only read public catalog data (`catalog_assets.is_public=true`)
  - Workspace-private data is scoped to `workspace_id` and enforced at application layer
  - Anonymous writes are blocked
