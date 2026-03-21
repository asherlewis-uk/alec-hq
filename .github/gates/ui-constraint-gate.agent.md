# UI Constraint Gate — ALEC.HQ

## Purpose
The UI Constraint Gate is a mandatory guardrail for all user-interface work in ALEC.HQ. It enforces the project's glassmorphic dark-gradient design system, ensures component reuse and prop correctness, prevents scope creep, and prohibits ad-hoc styles. This gate must be loaded for any task that edits visible UI.

## When to Invoke
Invoke this gate whenever editing any `.tsx` file that renders visible UI, including files under `src/components/**`, `src/app/**/page.tsx`, `src/app/**/layout.tsx`, and any new visible component or page. It also applies when adding, editing, or removing component props or `className` values, debugging visual regressions, modifying interaction states, or adding new components.

## Design System Tokens
All visible UI must use the approved Tailwind tokens and utility classes.

- **Background:** `bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00]`
- **Containers:** `glass`, `rounded-glass`, `glass-accent`
- **Text:** `text-accent`, `text-text-secondary`
- **Interactions:** `transition-all duration-200`

## Non-Negotiable Rules
- No hardcoded hex/rgb values outside the approved gradient.
- No arbitrary Tailwind colors such as `bg-gray-800`.
- No inline `style` attributes for color, border, radius, shadow, or spacing.
- If a required visual token is missing, stop and report. Do not improvise.
- Cross-check all token names against `tailwind.config.ts` before relying on them.

## Component Wiring Rules
- Read the component source before using it.
- Pass all required props and do not invent undocumented props.
- Never re-implement an existing component as raw HTML.
- Use component variants or approved Tailwind state modifiers for hover, focus, disabled, and loading states.

## Scope Lock Rules
- Only edit files explicitly named in the task.
- Do not refactor adjacent components, rename tokens, alter layout structure, or change data-fetching logic unless explicitly requested.
- If a required fix extends beyond scope, stop and report which file must change and why.
- Classify every touched file before implementation as `COMPONENT`, `PAGE`, `LAYOUT`, or `UNKNOWN`.
- `UNKNOWN` classification is a hard stop.

## Hard Stop Conditions
Stop immediately if any of the following occur:
1. Inline `style` usage for visuals.
2. Hardcoded colors outside the approved palette.
3. Re-implementing an existing component in raw HTML.
4. Using Tailwind classes that bypass required tokens.
5. Editing files outside declared scope.
6. Encountering `UNKNOWN` classification.
7. Flattening layouts that should preserve glassmorphism.
8. Discovering a missing or renamed token without updating this gate.

## Validation Checklist
Before marking a UI task complete, verify:
- All visible surfaces use approved tokens.
- All components are wired with required props only.
- No inline styles are present.
- No out-of-scope files were changed.
- Interaction states use approved tokens or variants.
- `npm run lint` and `npm run typecheck` pass.
- Residual risks are listed in the completion gate.

## Persisted Facts
- ALEC.HQ uses glassmorphism on a dark gradient.
- Page backgrounds always use the approved dark gradient.
- Cards and interactive surfaces always use `glass` and `rounded-glass`.
- Accent styling always uses the accent tokens from `tailwind.config.ts`.
- Secondary text always uses `text-text-secondary`.
- Transitions always use `transition-all duration-200`.

Failure to follow this gate invalidates the task. Stop, report, and resolve the violation before proceeding.
