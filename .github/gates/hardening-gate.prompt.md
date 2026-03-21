# Hardening Gate — ALEC.HQ

## Purpose
The Hardening Gate governs edits to infrastructure, configuration, and critical files. It prevents unsafe changes and enforces explicit reasoning for risky operations.

## When to Invoke
Invoke when editing configuration, environment variables, database schema, migrations, or server-side integrations.

## Rules
- Every change must have explicit justification.
- Never commit secrets.
- Never expose server-only values to the client.
- Document all environment variables.
- Provide rollback strategy for schema changes.

## Hard Stop Conditions
Stop if:
- You cannot explain the impact of a change.
- Sensitive values are exposed.
- A migration is destructive without rollback.
- A dependency upgrade introduces breaking changes without mitigation.

## Validation
- npm run lint
- npm run typecheck
- npm run build

Failure to meet this gate blocks completion.
