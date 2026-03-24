# Active Execution Contract — ALEC.HQ

## Status
Current live execution contract for agent-driven work.

This file exists because `.github/execution-spec-full.md` and `.github/build-history.md` are historical references, not the active dispatcher for current work.

## Current Objective
Raise repo executability so a prepared agent can bootstrap the workspace deterministically, run the application in a known containerized environment, verify the repository with one repeatable command path, and continue work in bounded tranches without falling back to ad hoc conversational steering.

## Proceed Semantics
When the operator says `proceed`, the implementation agent should:
1. Read `AGENTS.md` and the required gate files.
2. Read this file.
3. Verify that `.env.local` exists and required runtime variables are populated.
4. Start the containerized workspace.
5. Run verification commands.
6. Complete the next bounded tranche from the queue below.
7. Re-run verification.
8. Stop only when the tranche is complete, a hard blocker is reached, or a guard violation is detected.

## Bootstrap Contract
Primary local path: `bash scripts/bootstrap-agentic.sh`
Expected outcome: the app container is built, the app container is running, and the local URL is `http://127.0.0.1:3000`.

## Verification Contract
Primary verification path: `bash scripts/verify-agentic.sh`
Mandatory checks: `npm run lint`, `npm run typecheck`, `npm run build`.
Optional check when the required E2E variables are populated in `.env.local`: `npm run test:smoke`.

## Current Bounded Queue
### Tranche A — Execution Scaffold
Status: ACTIVE
Deliverables: `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `scripts/bootstrap-agentic.sh`, `scripts/verify-agentic.sh`.
Success condition: a prepared operator or agent can bring the repo up with one documented bootstrap path and run verification with one documented verify path.

### Tranche B — Environment Hardening
Status: NEXT
Deliverables: tighten env documentation, reduce ambiguity around required versus optional runtime values for container runs, document smoke prerequisites more explicitly.

### Tranche C — Smoke Autonomy
Status: LATER
Deliverables: remove dependence on preexisting manual private-state fixtures, make smoke setup deterministic or explicitly seed-driven, keep boundary guarantees intact.

## Hard Blockers
Stop immediately if required env vars are missing, the container cannot start, lint/typecheck/build fails, a boundary guard violation is discovered, or a task requires rewriting shared/private data boundaries without an explicit request.

## Residual Risks
This scaffold does not remove the need for valid Supabase credentials. Smoke tests still depend on workspace credentials and expected data state unless later hardened. This file is additive; `AGENTS.md` is not yet updated to include it in the required read order.
