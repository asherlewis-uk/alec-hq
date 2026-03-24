# ALEC.HQ

Dual-workspace command center for tracking garage/rig assets, logs, configurations, and wishlist items. One shared catalog, two private workspaces with full data isolation.

## Production Architecture

- Next.js App Router + React 19
- Server-only Supabase data access (service role key never sent to browser)
- Workspace PIN auth with signed `HttpOnly` session cookie (`alec_workspace_session`)
- Process-local server-side throttling for repeated failed workspace login attempts
- Shared catalog with category-based browsing (`/catalog`)
- Workspace-private assets, configurations, logs, and wishlist
- Public share endpoint for explicitly public catalog assets (`/share/[id]`)
- Canonical public catalog reads under `/api/catalog/**`; `/api/public/assets/[id]` remains a compatibility endpoint for the share page only
- PWA enabled with generated service worker at build time

## Required Environment Variables

Copy `.env.example` to `.env.local` and populate values.

| Variable                    | Purpose                                      |
| --------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`       | Canonical app URL (metadata, links)          |
| `NEXT_PUBLIC_SUPABASE_URL`  | Supabase project URL used by server routes   |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `SESSION_SECRET`            | HMAC secret for session cookie signing       |
| `SESSION_TTL_HOURS`         | Optional session lifetime override           |

## Optional Environment Variables

| Variable                        | Purpose                      |
| ------------------------------- | ---------------------------- |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional compatibility value |

## Optional Smoke Test Environment Variables

| Variable                      | Purpose                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| `E2E_BASE_URL`                | Base URL for Playwright smoke tests. Use `http://127.0.0.1:3000` for containerized local runs. |
| `E2E_BYPASS_PWA_INSTALL_GATE` | Set to `1` only for automation runs. For the containerized path, this must exist in `.env.local` before bootstrap so the running app process sees it. |
| `E2E_WORKSPACE_A_SLUG`        | Workspace A slug for smoke tests                                                         |
| `E2E_WORKSPACE_A_PIN`         | Workspace A PIN for smoke tests                                                          |
| `E2E_WORKSPACE_B_SLUG`        | Workspace B slug for smoke tests                                                         |
| `E2E_WORKSPACE_B_PIN`         | Workspace B PIN for smoke tests                                                          |

## Containerized Local Development (Primary Path)

Bootstrap the app in the expected agentic containerized environment:

```bash
bash scripts/bootstrap-agentic.sh
```

Expected outcome:

- the `alec-hq-app` container is built
- the app is running
- the container health check passes
- the local URL is `http://127.0.0.1:3000`

Run repository verification with the same containerized path:

```bash
bash scripts/verify-agentic.sh
```

Mandatory checks run by the verify script:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

Optional smoke execution:

- smoke runs only when all required `E2E_*` variables are populated in `.env.local`
- for containerized smoke runs, `E2E_BYPASS_PWA_INSTALL_GATE=1` must already be present in `.env.local` before running bootstrap or before restarting the app container

## Manual Local Development (Optional)

Use this only when you intentionally do not want the containerized path.

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

Populate `.env.local` with the smoke variables, ensure the app process has been started or restarted with those values present, then run:

```bash
npm run test:smoke
```

`E2E_BYPASS_PWA_INSTALL_GATE` is read in `src/app/layout.tsx` and only honored when Playwright sends `x-e2e-bypass-pwa-install-gate: 1` from `tests/smoke.spec.ts`. Leave it unset for normal deployed usage.

## Deploy (Vercel)

1. Set all required env vars in Vercel project settings.
2. Ensure build command is `npm run build`.
3. Deploy.
4. Post-deploy smoke:
   - Login works (`/login` — workspace buttons + 6-digit PIN inputs)
   - Catalog browse works (`/catalog`)
   - Workspace CRUD works (`/workspace/*`, `/garage`, `/rig`)
   - Share route works only for public catalog assets (`/share/[id]`)
   - Workspace A data is invisible to workspace B

## Rollback

1. Roll back to previous Vercel deployment.
2. If needed, restore previous migration state via Supabase migration tooling.
3. Re-run smoke validation against rolled-back deployment.

## Integrations

For wiring the **Multi-Agent Custom Automation Engine Solution Accelerator** and the **Syncfusion Essential Studio® UI Edition** (5-member team license), see:

[`docs/integrations/multi-agent-essential-studio-setup.md`](docs/integrations/multi-agent-essential-studio-setup.md)
