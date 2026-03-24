#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

APP_CONTAINER_NAME="alec-hq-app"

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
  printf '%s' "${line#*=}" | tr -d '\r'
}

wait_for_app_readiness() {
  local attempts=30
  local state
  local health

  for ((i=1; i<=attempts; i++)); do
    state="$(docker inspect -f '{{.State.Status}}' "$APP_CONTAINER_NAME" 2>/dev/null || true)"
    health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$APP_CONTAINER_NAME" 2>/dev/null || true)"

    if [[ "$state" == "running" && ( "$health" == "healthy" || "$health" == "none" ) ]]; then
      return 0
    fi

    if [[ "$state" == "exited" || "$state" == "dead" ]]; then
      echo "App container entered a failed state: $state" >&2
      docker logs --tail 200 "$APP_CONTAINER_NAME" >&2 || true
      exit 1
    fi

    sleep 2
  done

  echo "Timed out waiting for app readiness." >&2
  docker logs --tail 200 "$APP_CONTAINER_NAME" >&2 || true
  exit 1
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

wait_for_app_readiness

E2E_BASE_URL_VALUE="$(read_env_value E2E_BASE_URL)"
E2E_BYPASS_VALUE="$(read_env_value E2E_BYPASS_PWA_INSTALL_GATE)"
E2E_WORKSPACE_A_SLUG_VALUE="$(read_env_value E2E_WORKSPACE_A_SLUG)"
E2E_WORKSPACE_A_PIN_VALUE="$(read_env_value E2E_WORKSPACE_A_PIN)"
E2E_WORKSPACE_B_SLUG_VALUE="$(read_env_value E2E_WORKSPACE_B_SLUG)"
E2E_WORKSPACE_B_PIN_VALUE="$(read_env_value E2E_WORKSPACE_B_PIN)"

has_any_smoke_config=0
for value in \
  "$E2E_BYPASS_VALUE" \
  "$E2E_WORKSPACE_A_SLUG_VALUE" \
  "$E2E_WORKSPACE_A_PIN_VALUE" \
  "$E2E_WORKSPACE_B_SLUG_VALUE" \
  "$E2E_WORKSPACE_B_PIN_VALUE"
do
  if [[ -n "$value" ]]; then
    has_any_smoke_config=1
    break
  fi
done

has_full_smoke_config=0
if [[ -n "$E2E_WORKSPACE_A_SLUG_VALUE" && -n "$E2E_WORKSPACE_A_PIN_VALUE" && -n "$E2E_WORKSPACE_B_SLUG_VALUE" && -n "$E2E_WORKSPACE_B_PIN_VALUE" ]]; then
  has_full_smoke_config=1
fi

"${COMPOSE_CMD[@]}" exec -T app bash -lc "if [ ! -d node_modules ] || [ -z \"\$(ls -A node_modules 2>/dev/null)\" ]; then npm ci; fi && npm run lint && npm run typecheck && NODE_ENV=production npm run build"

if (( has_full_smoke_config )); then
  if [[ "$E2E_BYPASS_VALUE" != "1" ]]; then
    echo "Smoke configuration is incomplete: set E2E_BYPASS_PWA_INSTALL_GATE=1 in .env.local and restart the app container before running verification." >&2
    exit 1
  fi

  "${COMPOSE_CMD[@]}" exec -T \
    -e "E2E_BASE_URL=${E2E_BASE_URL_VALUE:-http://127.0.0.1:3000}" \
    app bash -lc "npx playwright install --with-deps chromium && npm run test:smoke"
elif (( has_any_smoke_config )); then
  echo "Smoke configuration is partial. Populate E2E_BYPASS_PWA_INSTALL_GATE, E2E_WORKSPACE_A_SLUG, E2E_WORKSPACE_A_PIN, E2E_WORKSPACE_B_SLUG, and E2E_WORKSPACE_B_PIN together, then restart the app container." >&2
  exit 1
else
  echo "Skipping smoke tests because smoke environment variables are not populated in .env.local."
fi
