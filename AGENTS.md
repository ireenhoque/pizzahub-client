# AGENTS.md — pizzahub-client

Next.js 16 + React 19 client for a pizza-ordering platform. Currently a scaffolded template; expected features (per `design-reference/*.jpeg` mockups) include user storefront plus admin and vendor dashboards. No tests, no CI, no env vars yet.

## Commands

```bash
npm run dev        # next dev
npm run build      # next build
npm run lint       # eslint (flat config in eslint.config.mjs)
npm run typecheck  # tsc --noEmit
npm run format     # prettier --write "**/*.{ts,tsx}" — only .ts/.tsx, not css/json
```

There is no test runner. Verify changes with `lint` → `typecheck` → `npm run build`.

## Stack quirks

- **Next 16 / React 19.3**: see the generated block below — check `node_modules/next/dist/docs/` before assuming old Next.js APIs.
- **Tailwind v4**: no `tailwind.config.*`; theme tokens live as CSS variables in `app/globals.css`. Edit tokens there, not in a JS config.
- **shadcn/ui with `style: "base-nova"`** (`components.json`): components are built on `@base-ui/react`, **not Radix** — don't import `@radix-ui/*` or copy Radix-based examples. Add components with `npx shadcn@latest add <name>`; they land in `components/ui/`. Icons come from `lucide-react`.
- **Path alias**: `@/*` maps to the repo root (e.g. `@/components/ui/button`, `@/lib/utils`). There is no `src/` directory.
- **Dark mode**: `next-themes` via `components/theme-provider.tsx`; `<html>` needs `suppressHydrationWarning`.

## Code style (enforced by Prettier, `.prettierrc`)

- No semicolons, double quotes, 2-space indent, LF line endings (this is Windows — don't let the editor write CRLF).
- `prettier-plugin-tailwindcss` sorts Tailwind classes; `cn` and `cva` are recognized class-sorting functions.

## Notes

- `DESIGN.md` is the design source of truth (brand tokens, typography, component recipes, motion/a11y rules). Read it before building any UI; brand palette and fonts are already wired in `app/globals.css` and `app/layout.tsx`.
- `design-reference/` is untracked and contains the UI mockups the app is meant to implement — inspiration only, per the rules in `DESIGN.md`.
- `CLAUDE.md` just includes this file (`@AGENTS.md`); edit this file, not that one.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
