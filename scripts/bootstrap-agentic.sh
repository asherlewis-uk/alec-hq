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
  local attempts=60
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
  cp .env.example .env.local
  echo "Created .env.local from .env.example." >&2
  echo "Populate NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SESSION_SECRET, then rerun." >&2
  exit 1
fi

required_vars=(
  NEXT_PUBLIC_APP_URL
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  SESSION_SECRET
)

missing_vars=()
for key in "${required_vars[@]}"; do
  value="$(read_env_value "$key")"
  if [[ -z "$value" ]]; then
    missing_vars+=("$key")
  fi
done

if (( ${#missing_vars[@]} > 0 )); then
  echo "Missing required values in .env.local:" >&2
  printf ' - %s\n' "${missing_vars[@]}" >&2
  exit 1
fi

"${COMPOSE_CMD[@]}" down --remove-orphans >/dev/null 2>&1 || true
"${COMPOSE_CMD[@]}" up --build -d app

wait_for_app_readiness

cat <<'EOF'
Bootstrap complete.
App container: alec-hq-app
Local URL: http://127.0.0.1:3000
Next step: bash scripts/verify-agentic.sh
EOF
