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

read_env_value() {
  local key="$1"
  local line
  line=$(grep -E "^${key}=" .env.local | tail -n 1 || true)
  echo "${line#*=}"
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

"${COMPOSE_CMD[@]}" run --rm app bash -lc "if [ ! -d node_modules ] || [ -z \"$(ls -A node_modules 2>/dev/null)\" ]; then npm ci; fi && npm run lint && npm run typecheck && npm run build"

E2E_WORKSPACE_A_SLUG_VALUE="$(read_env_value E2E_WORKSPACE_A_SLUG)"
E2E_WORKSPACE_A_PIN_VALUE="$(read_env_value E2E_WORKSPACE_A_PIN)"
E2E_WORKSPACE_B_SLUG_VALUE="$(read_env_value E2E_WORKSPACE_B_SLUG)"
E2E_WORKSPACE_B_PIN_VALUE="$(read_env_value E2E_WORKSPACE_B_PIN)"
E2E_BASE_URL_VALUE="$(read_env_value E2E_BASE_URL)"

if [[ -n "$E2E_WORKSPACE_A_SLUG_VALUE" && -n "$E2E_WORKSPACE_A_PIN_VALUE" && -n "$E2E_WORKSPACE_B_SLUG_VALUE" && -n "$E2E_WORKSPACE_B_PIN_VALUE" ]]; then
  "${COMPOSE_CMD[@]}" exec -T \
    -e "E2E_BASE_URL=${E2E_BASE_URL_VALUE:-http://127.0.0.1:3000}" \
    -e "E2E_BYPASS_PWA_INSTALL_GATE=1" \
    -e "E2E_WORKSPACE_A_SLUG=$E2E_WORKSPACE_A_SLUG_VALUE" \
    -e "E2E_WORKSPACE_A_PIN=$E2E_WORKSPACE_A_PIN_VALUE" \
    -e "E2E_WORKSPACE_B_SLUG=$E2E_WORKSPACE_B_SLUG_VALUE" \
    -e "E2E_WORKSPACE_B_PIN=$E2E_WORKSPACE_B_PIN_VALUE" \
    app bash -lc "npx playwright install --with-deps chromium && npm run test:smoke"
else
  echo "Skipping smoke tests because E2E_WORKSPACE_A_SLUG, E2E_WORKSPACE_A_PIN, E2E_WORKSPACE_B_SLUG, and E2E_WORKSPACE_B_PIN are not populated in .env.local."
fi
