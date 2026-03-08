# Supabase Migrations

Apply schema and policies with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This folder is the source of truth for:

- Shared catalog tables (`catalog_assets`, `catalog_media`, `catalog_asset_values`)
- Workspace-private tables (`workspaces`, `workspace_credentials`, `workspace_asset_links`, `workspace_configurations`, `configuration_slots`, `slot_assignments`, `workspace_logs`, `workspace_wishlist_items`, `workspace_sessions`)
- Login protection support table (`auth_attempts`)
- Legacy domain tables (`assets`, `components`, `asset_logs`, `wishlist_items`) — preserved, not dropped
- RLS policies:
  - Anonymous users can only read public catalog data (`catalog_assets.is_public=true`)
  - Workspace-private data is scoped to `workspace_id` and enforced at application layer
  - Anonymous writes are blocked
