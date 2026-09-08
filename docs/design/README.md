# SHOP.CO design docs

Figma is the visual source of truth. These notes capture what we already extracted so later sessions can implement remaining pages without re-deriving the system from chat history.

Start here, then open the file that matches the task:

| File | Use when |
| --- | --- |
| [FIGMA.md](./FIGMA.md) | Looking up file key, frame IDs, or which artboard to pull |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Tokens, type, color, radius, spacing, assets |
| [COMPONENTS.md](./COMPONENTS.md) | Reusing or extending existing React components |
| [PAGES.md](./PAGES.md) | Page composition, done vs remaining |
| [RESPONSIVE.md](./RESPONSIVE.md) | Breakpoints and desktop/tablet/mobile behavior |

## Stack

- Next.js 16 App Router, React 19, Tailwind CSS 4, pnpm
- Light-only UI. Do not reintroduce `prefers-color-scheme` dark mode.
- Tokens live in `app/globals.css` (`@theme inline`). Fonts in `app/fonts.ts`.
- Site chrome (announcement, header, newsletter, footer) is in `SiteShell` and wraps every page.

## Current status

- **Done:** Homepage `/` (`20:2` / `35:740`). Shop / Category `/shop` (`26:855` / `38:234`, filters sheet `38:679`). Product Detail `/product/[id]` (`1:2` / `35:1062`). Cart `/cart` (`31:32` / `39:1045`).
- Shop nav goes to `/shop`. Cart icon goes to `/cart`. Dress-style tiles go to `/shop?style=`. On Sale / New Arrivals / Brands still hash-link homepage sections.

## Working rules

1. Match Figma, not the Tailwind dump from MCP. Treat `get_design_context` as reference.
2. Reuse `Button`, `TextField`, `ProductCard`, `Rating`, `Price`, `Container`, and other existing primitives.
3. Use exported assets in `public/`. Do not hand-draw icons that already exist.
4. There is no tablet artboard. Interpolate between 1440 and 390 using the breakpoints in [RESPONSIVE.md](./RESPONSIVE.md).
5. Static catalog data is in `lib/home-data.ts` and `lib/shop-data.ts` until a CMS exists.
