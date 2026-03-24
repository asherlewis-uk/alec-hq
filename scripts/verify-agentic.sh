#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command missing: $1" >&2
    exit 1
  fi
}

require_command docker

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
else
  require_command docker-compose
  COMPOSE_CMD=(docker-compose)
fi

if [[ ! -f .env.local ]]; then
  echo ".env.local not found. Run bash scripts/bootstrap-agentic.sh first." >&2
  exit 1
fi

if ! "${COMPOSE_CMD[@]}" ps app >/dev/null 2>&1; then
  echo "App service is not available. Run bash scripts/bootstrap-agentic.sh first." >&2
  exit 1
fi

"${COMPOSE_CMD[@]}" run --rm app bash -lc "npm run lint && npm run typecheck && npm run build"

if [[ -n "${E2E_WORKSPACE_A_SLUG:-}" && -n "${E2E_WORKSPACE_A_PIN:-}" && -n "${E2E_WORKSPACE_B_SLUG:-}" && -n "${E2E_WORKSPACE_B_PIN:-}" ]]; then
  "${COMPOSE_CMD[@]}" exec -T app bash -lc "npx playwright install --with-deps chromium && E2E_BASE_URL=${E2E_BASE_URL:-http://127.0.0.1:3000} E2E_BYPASS_PWA_INSTALL_GATE=1 E2E_WORKSPACE_A_SLUG=$E2E_WORKSPACE_A_SLUG E2E_WORKSPACE_A_PIN=$E2E_WORKSPACE_A_PIN E2E_WORKSPACE_B_SLUG=$E2E_WORKSPACE_B_SLUG E2E_WORKSPACE_B_PIN=$E2E_WORKSPACE_B_PIN npm run test:smoke"
else
  echo "Skipping smoke tests because E2E_WORKSPACE_A_SLUG, E2E_WORKSPACE_A_PIN, E2E_WORKSPACE_B_SLUG, and E2E_WORKSPACE_B_PIN are not exported in the current shell."
fi
