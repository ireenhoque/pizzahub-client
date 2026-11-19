# PizzaHub Design System

Design source of truth for this project. Brand: **PizzaHub — premium neighborhood pizza marketplace** (editorial food-magazine feel, warm and appetizing, not tech-cold).

The `design-reference/*.jpeg` mockups are **inspiration only** — they are studied for hierarchy, spacing, and interaction patterns, then reinterpreted with our own identity. Never reproduce a screenshot pixel-by-pixel or copy any reference's full layout, branding, illustrations, colors, or component arrangement.

## Visual identity

| Token | Value | Usage |
| --- | --- | --- |
| Primary | `#E65A32` | Primary CTAs, active states, brand accents, eyebrow labels |
| Ink (Secondary) | `#24211F` | Headlines, body text, dark buttons/pills, dark surfaces |
| Background | `#FFF8EF` | Page canvas (cream, not white) |
| Accent | `#F4B544` | Highlights, badges ("Most popular"), hover glints |
| Card | `#FFFDF9` | Cards, modals, popovers (slightly lighter than canvas) |
| Muted sand | `#F2E9DC` | Icon chips, avatar tiles, soft fills |
| Muted text | `#6E635A` | Captions, secondary copy, meta rows |
| Border | `#EFE3D3` | Warm hairlines, dividers, card borders |
| Success | `#2F7D4F` | Approved / success pills |
| Destructive | `#C2412E` | Rejected / blocked / delete actions |

All tokens live as oklch CSS variables in `src/app/globals.css` (light in `:root`, warm dark in `.dark`). Use semantic utilities (`bg-primary`, `text-muted-foreground`, `border-border`, …) — never hardcode hex values in components.

## Typography

- **Manrope** (700/800, tight tracking) — headings, display lines, stat numbers. Use the `font-heading` utility.
- **Inter** (400/500/600) — body copy, UI labels, forms. Default via `font-sans`.
- Display scale (storefront): eyebrow `text-xs font-semibold uppercase tracking-[0.14em] text-primary` → display `text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight` → lead `text-base md:text-lg text-muted-foreground max-w-prose`.
- **Signature motif**: a two-line display headline where the final phrase is colored in primary (e.g. ink first line, primary second line) and set lighter/smaller — our equivalent of the references' serif-with-italic-accent, achieved with weight + color instead of a serif.
- Dashboard headers: eyebrow (uppercase micro-label) → `text-3xl font-heading font-bold` → one-line caption in muted, with an outline "Edit profile" button top-right.

## Layout & spacing

- Page canvas: cream `background`. Content max-width `max-w-6xl` (storefront) / `max-w-7xl` (dashboards), horizontal padding `px-4 sm:px-6 lg:px-8` — wrap every page in `<PageContainer>` (`size="wide"` for dashboards).
- Spacing conventions: vertical rhythm in multiples of 4 (Tailwind's 4px scale) — `gap-3` inside cards/list rows, `gap-6` between blocks, sections `py-12 md:py-16`.
- Radii: cards/modals `rounded-xl`–`rounded-2xl`, chips/pills `rounded-full`, buttons use the token scale (`--radius: 0.75rem`).
- Borders are 1px warm hairlines; elevation comes from the cream canvas + warm shadow tokens (`shadow-card` at rest, `shadow-lift` on hover, `shadow-lg` on modals) — not heavy drop shadows.

## Core patterns (original recipes)

**Storefront hero** — full-bleed food photography with a left-to-right dark gradient (ink 80% → transparent) for text legibility; eyebrow with a short rule; two-line display headline (second line in primary); short lead; primary CTA + inline text link CTA; social-proof row (overlapping avatar circles + star rating + count); small floating status card bottom-right; below the hero, a trust strip of 4 icon+label items separated by hairline dividers.

**Product card** (equal height, `h-full flex flex-col`) — photo top (`aspect-[4/3]`, rounded, `overflow-hidden`, hover `scale-105` on the image) with a favorite heart button top-right and a category chip bottom-left overlaid; body: name + price row, then shop meta (avatar tile + shop name + location) with star rating right; footer row after a hairline divider: "View details" link + arrow that nudges right on hover. Whole card is keyboard-reachable via the link.

**Browse menu bar** — search input + location select + sort select on one row; category pills beneath (selected pill = filled `bg-secondary text-secondary-foreground`, unselected = outline); results count + right-aligned caption above the grid.

**Dashboard shell** (shared by admin & vendor) — cream sidebar: identity block (avatar tile + name + account-type caption), `WORKSPACE` micro-label, nav items (icon + label; active = soft peach fill `sidebar-accent` + primary text), small warm card with sparkle icon + friendly copy near the bottom, then Profile settings / Sign out. Main area: header block, then white cards. Overview = row of 4 stat cards (label, big `font-heading` number, caption) + a content card with a list; vendor overview adds a warm primary-gradient promo panel to the right.

**Status pills** — `rounded-full px-2.5 py-0.5 text-xs font-medium`: success `bg-success/10 text-success`, pending `bg-accent/15 text-accent-foreground`, danger `bg-destructive/10 text-destructive`.

**Modals** — centered card, logo top-left, close button top-right; two-column split for order forms (photo left, form right on `md+`, stacked on mobile); full-width primary CTA with the amount; demo/test-mode disclaimers in `text-xs text-muted-foreground`; success state = check icon + serif-style short headline + caption.

## Motion

Subtle and purposeful only (`tw-animate-css` is available):
- Modals/popovers: fade + 4–8px rise, 150–200ms ease-out.
- Cards: hover lift (`hover:-translate-y-0.5`, `shadow-sm→md`, 150ms) + image zoom; arrow icons translate-x on hover.
- Never animate layout-critical properties; respect `prefers-reduced-motion` (Tailwind's `motion-safe:` variants where custom animations are added).

## Accessibility

- WCAG AA contrast: ink on cream, cream on primary both pass; never place muted text on photos without a gradient scrim.
- Full keyboard navigation: visible focus rings (`ring` token), logical tab order in cards (single focusable link per card where possible), modals trap focus and close on Esc, favorite/heart buttons have accessible names.
- Touch targets ≥ 40px on mobile; form fields have labels, not just placeholders.

## Component inventory

- **Existing `components/ui/*`**: `Button` (Base UI — default/outline/secondary/ghost/destructive/link, sizes xs→lg + icon), `Input`, `Label`, `Select` (trigger/items/content), `Card` (+Header/Title/Description/Action/Content/Footer), `Badge` (default/secondary/outline/ghost/link + status variants `success`/`pending`/`destructive`), `Skeleton`, `ThemeProvider` (next-themes), `cn` from `src/lib/utils.ts`.
- **Still to build as `components/ui/*`** (shadcn `base-nova` / Base UI — add via `npx shadcn@latest add <name>`): dialog, avatar, separator, textarea, tabs.
- **Feature components (`components/`)**: page-container, empty-state, error-state, skeleton-card; then navbar, hero, trust-strip, product-card, category-pills, dashboard-shell (sidebar), stat-card, plan-card.

## Rules for every page

1. Read the relevant mockup(s) in `design-reference/` first, state the direction, then build.
2. Reuse these tokens and components — no one-off colors, fonts, or spacing.
3. Mobile-first responsive; equal-height card grids (`grid gap-6 sm:grid-cols-2 lg:grid-cols-3`).
4. Don't restyle or restructure unrelated pages in the same change.
5. Don't change existing functionality while applying visual work.
