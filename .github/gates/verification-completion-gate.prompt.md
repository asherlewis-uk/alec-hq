# Verification and Completion Gate — ALEC.HQ

## Purpose
Defines the final completion criteria for any change before merge.

## Required Checks
- npm run lint
- npm run typecheck
- npm run build
- smoke test critical flows

## Cross-Gate Compliance
- UI Constraint Gate followed
- Boundary Guard followed
- Hardening Gate followed

## Residual Risk Assessment
List:
- unverified assumptions
- fragile areas
- missing tests
- possible failure points

Do not restate completed work.

## Hard Stop Conditions
- failing build or tests
- missing residual risk list
- guard violations

A task is not complete without passing this gate.
