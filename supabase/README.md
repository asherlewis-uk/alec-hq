# Supabase Migrations

Apply schema and policies with the Supabase CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This folder is the source of truth for:

- Core ALEC.HQ domain tables (`assets`, `components`, `asset_logs`, `wishlist_items`)
- Login protection support table (`auth_attempts`)
- RLS policies:
  - Anonymous users can only read public share data (`assets.is_public=true` and related `components`)
  - Anonymous writes are blocked
