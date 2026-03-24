# UI Constraint Gate

## Purpose

Ensure all UI adheres strictly to the ALEC.HQ design system implemented across `tailwind.config.ts` and `src/app/globals.css`, **and** is built using **Syncfusion Essential Studio® UI Edition** as the component library.

This gate enforces visual consistency, prevents design drift, and ensures all components use approved tokens only.

---

## Component Library Requirement

All new UI components must use **Syncfusion Essential Studio® UI Edition** (EJ2 React) as the component library.

- Install packages via `npm install @syncfusion/ej2-react-*` as documented in `docs/integrations/multi-agent-essential-studio-setup.md`.
- The license key must be registered via `src/lib/syncfusion.ts` before any Syncfusion component is rendered (see setup guide).
- Do not introduce alternative component libraries (Radix UI, Headless UI, MUI, Ant Design, etc.) for new features unless a Syncfusion equivalent does not exist. Existing shadcn/ui primitives already in the codebase are grandfathered for bug fixes and maintenance of existing code only — they must not be used for new feature development.

---

## Design System Tokens

Syncfusion components must be styled to conform to the alec-hq design system. All UI — including Syncfusion components — must use the approved theme tokens, utilities, and CSS custom properties defined in `tailwind.config.ts` and `src/app/globals.css`.

### Allowed

* Background gradient: `bg-gradient-to-br from-[#0d0d1a] to-[#1a0a00]`
* Glass surfaces: `glass`
* Border radius: `rounded-glass`
* Accent: `bg-accent`, `text-accent`
* Interaction: `transition-all duration-200`
* Theme utilities and variables from `src/app/globals.css` such as `.glass`, `.glass-accent`, `.glass-success`, `.glass-warning`, `.glass-danger`, `.text-primary`, `.text-secondary`, and `.text-muted`

---

## Prohibitions

* No arbitrary Tailwind colors (e.g., `bg-gray-800`, `text-white`)
* No inline styles
* No hardcoded color values outside the approved theme sources in `tailwind.config.ts` and `src/app/globals.css`
* No undefined or non-existent design tokens
* No new UI components built without a Syncfusion component unless a Syncfusion equivalent does not exist

---

## Component Requirements

All UI must:

* Use Syncfusion Essential Studio EJ2 React components as the primary building block for new features
* Use `glass` for surfaces instead of custom backgrounds
* Use `rounded-glass` for container radius
* Use `bg-accent` or `text-accent` for highlights and interactive elements
* Reuse the shared text and glass utilities from `src/app/globals.css` when those semantics already exist
* Use consistent spacing and layout patterns

---

## Enforcement

If a component:

* Introduces unapproved styles
* Uses non-token colors
* Deviates from the defined visual system
* Introduces a new non-Syncfusion component library without documented justification

→ The change must be rejected.

No exceptions.
