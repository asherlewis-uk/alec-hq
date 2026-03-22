# UI Constraint Gate

## Purpose

Ensure all UI adheres strictly to the ALEC.HQ design system implemented across `tailwind.config.ts` and `src/app/globals.css`.

This gate enforces visual consistency, prevents design drift, and ensures all components use approved tokens only.

---

## Design System Tokens

All UI must use the approved theme tokens, utilities, and CSS custom properties defined in `tailwind.config.ts` and `src/app/globals.css`.

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

---

## Component Requirements

All UI must:

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

→ The change must be rejected.

No exceptions.
