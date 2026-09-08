# Figma source

**File:** [E-commerce Website Template (Copy)](https://www.figma.com/design/R3MFZU7W5UbEmIKzdpZbzU/E-commerce-Website-Template--Freebie---Community---Copy-?node-id=20-2)

- File key: `R3MFZU7W5UbEmIKzdpZbzU`
- Page / canvas: `0:1` (`Pages`)
- URL `node-id` uses hyphens; MCP tools need colons (`20-2` → `20:2`).

Figma remains the visual source of truth. Pull design context from the frame you are implementing, then adapt into this repo’s tokens and components.

## Frames

Desktop artboards are 1440 wide. Mobile artboards are 390 wide. No tablet frames exist.

| Page | Desktop | Size | Mobile | Size | Status |
| --- | --- | --- | --- | --- | --- |
| Homepage | `20:2` | 1440 × 4370 | `35:740` | 390 × 4461 | Implemented |
| Product Detail | `1:2` | 1440 × 3066 | `35:1062` | 390 × 3553 | Implemented (`/product/[id]`) |
| Category | `26:855` | 1440 × 2332 | `38:234` | 390 × 2140 | Implemented (`/shop`) |
| Cart | `31:32` | 1440 × 1453 | `39:1045` | 390 × 2033 | Implemented (`/cart`) |
| Filters sheet | — | — | `38:679` | 390 × 1159 | Implemented (mobile overlay on `/shop`) |

## Homepage nodes worth remembering

Useful if you need to re-export a slice instead of the whole page:

| Node | Name | Notes |
| --- | --- | --- |
| `20:4` | Promo bar | 38px desktop |
| `20:8` | Header row | 1240 × 48 |
| `22:352` | Hero image fill | `#F2F0F1` + photo |
| `22:358` / `22:359` | Sparkles | 104px and 56px |
| `22:376` | Brand bar | Black, 122px |
| `22:412`–`22:419` | New Arrivals images | 295 × 298 wells |
| `22:532`–`22:539` | Top Selling images | Same well size |
| `22:672` | Browse by dress style | 40px panel radius |
| `24:714` | Testimonial card | 400 × ~240 |
| `20:270` | Newsletter | Overlaps footer |
| `20:3` | Footer background | `#F0F0F0` |
| `35:747` | Mobile hamburger | Used on homepage header |

## MCP notes

- `get_design_context` on a full page can be huge. Prefer the page frame, then child nodes on timeout.
- `download_assets` caps at 20 images and 20 SVGs per node. Download by section if needed.
- Asset URLs expire in about 7 days. Committed files in `public/` are the lasting copies.
- Homepage Figma variables are sparse. Most fills are raw hex; see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).
