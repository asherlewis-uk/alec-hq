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

cat <<'EOF'
Bootstrap complete.
App container: alec-hq-app
Local URL: http://127.0.0.1:3000
Next step: bash scripts/verify-agentic.sh
EOF
