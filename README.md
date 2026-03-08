# ALEC.HQ

Dual-workspace command center for tracking garage/rig assets, logs, configurations, and wishlist items. One shared catalog, two private workspaces with full data isolation.

## Production Architecture

- Next.js App Router + React 19
- Server-only Supabase data access (service role key never sent to browser)
- Workspace PIN auth with signed `HttpOnly` session cookie (`alec_workspace_session`)
- Brute-force protection backed by `auth_attempts` table
- Shared catalog with category-based browsing (`/catalog`)
- Workspace-private assets, configurations, logs, and wishlist
- Public share endpoint for explicitly public catalog assets (`/share/[id]`)
- PWA enabled with generated service worker at build time

## Required Environment Variables

Copy `.env.example` to `.env.local` and populate values.

| Variable                        | Purpose                                      |
| ------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`           | Canonical app URL (metadata, links)          |
| `SUPABASE_URL`                  | Supabase project URL (server-side)           |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (server-side only) |
| `SESSION_SECRET`                | HMAC secret for session cookie signing       |
| `NEXT_PUBLIC_SUPABASE_URL`      | Optional compatibility value                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional compatibility value                 |

## Local Development

```bash
npm install
npm run dev
```

## Database Setup

Use Supabase CLI from repo root:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Migrations live in `supabase/migrations/`.

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run build
npm run ci
```

## Smoke Tests (Playwright)

Set env vars and run:

```bash
set E2E_BASE_URL=http://127.0.0.1:3000
set E2E_WORKSPACE_A_SLUG=asher
set E2E_WORKSPACE_A_PIN=<workspace-a-pin>
set E2E_WORKSPACE_B_SLUG=alec
set E2E_WORKSPACE_B_PIN=<workspace-b-pin>
npm run test:smoke
```

## Deploy (Vercel)

1. Set all required env vars in Vercel project settings.
2. Ensure build command is `npm run build`.
3. Deploy.
4. Post-deploy smoke:
   - Login works (`/login` — workspace select + PIN)
   - Catalog browse works (`/catalog`)
   - Workspace CRUD works (`/workspace/*`, `/garage`, `/rig`)
   - Share route works only for public catalog assets (`/share/[id]`)
   - Workspace A data is invisible to workspace B

## Rollback

1. Roll back to previous Vercel deployment.
2. If needed, restore previous migration state via Supabase migration tooling.
3. Re-run smoke validation against rolled-back deployment.
