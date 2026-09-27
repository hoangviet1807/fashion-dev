# Design system

Tokens are in `app/globals.css`. Use Tailwind theme classes (`bg-hero`, `text-text-60`, `rounded-card` via arbitrary radius if needed) rather than new hex values.

The UI is light-only. Black, white, and gray with red discount chips and yellow stars.

## Typefaces

| Role | Spec | How it is loaded |
| --- | --- | --- |
| Display / logo / section titles | Montserrat Bold 700 (Figma: Integral CF Bold) | `next/font/google` → `--font-heading` → `font-display` |
| UI, body, prices, nav | Be Vietnam Pro Regular 400, Medium 500, Bold 700 (Figma: Satoshi) | `next/font/google` → `--font-body` → `font-sans` |

**Vietnamese (phase 1.6):** the storefront is in Vietnamese. Satoshi and Integral CF (Clash Display stand-in) lack Vietnamese glyphs (ơ, ư, ạ, ế, ₫ …), so both were replaced in `app/fonts.ts` with Google fonts loaded with the `vietnamese` subset. Any replacement font must cover Vietnamese. Where this document says Satoshi / Integral CF, read Be Vietnam Pro / Montserrat.

Ignore the stray Poppins instance on one Figma footer column. Use the body font.

Product titles in Figma mix spans for fake small-caps. Render normal title case, not per-letter spans.

## Type scale (desktop → mobile)

| Use | Family | Desktop | Mobile |
| --- | --- | --- | --- |
| Logo | Display | 32px | ~22–25px |
| Hero headline | Display | 64 / 64 | 36 / 36 |
| Section titles | Display | 48 | 32 |
| Newsletter headline | Display | 40 / 45 | 32 |
| Footer logo | Display | 33.455 | 25.2 |
| Dress-style labels | Satoshi Bold | 36 | 32 |
| Stats numbers | Satoshi Bold | 40 | 24 |
| Product title | Satoshi Bold | 20 | 16 |
| Price | Satoshi Bold | 24 | 20 |
| Nav, CTA, body | Satoshi Regular/Medium | 16 / 22 | 14–16 / 22 |
| Promo bar | Satoshi | 14; “Sign Up Now” Medium + underline | 12 |
| Rating `4.5/5` | Satoshi Regular | 14; `/5` at 60% black | 12–14 |
| Discount chip | Satoshi Medium | 12 | 10 |
| Footer headings | Satoshi Medium | 16, uppercase, `letter-spacing: 3px` | same |
| Footer links | Satoshi Regular | 16 / 19, 60% black | same |
| Copyright | Satoshi Regular | 14, 60% black | same |

## Color

| Token | Value | Use |
| --- | --- | --- |
| background / white | `#FFFFFF` | Page, cards on dark |
| foreground / black | `#000000` | Type, primary buttons, promo, brand bar, newsletter. Prefer this over Figma variable `#000008`. |
| `hero` | `#F2F0F1` | Hero ground |
| `muted` | `#F0F0F0` | Search, dress-style panel, footer |
| `product` | `#F0EEED` | Product image well |
| `text-60` | `rgba(0,0,0,0.6)` | Body, labels, `/5`, footer copy |
| `text-40` | `rgba(0,0,0,0.4)` | Placeholders, struck prices |
| `line` | `rgba(0,0,0,0.1)` | Borders, dividers |
| `discount` | `#FF3333` | Sale chip text |
| `discount-bg` | `rgba(255,51,51,0.1)` | Sale chip fill |
| `star` | `#FFC633` | In exported star SVGs |

Payment badge colors live in the SVG assets (Visa blue, Mastercard yellow, and so on). Do not recreate them in CSS.

## Radius, borders, shadow

- Pill: **62px** — buttons, search, newsletter fields, discount chips
- Card: **20px** — product wells, style tiles, testimonials, newsletter
- Panel: **40px** — “Browse by dress STYLE” wrapper
- Hairline: `1px solid rgba(0,0,0,0.1)` on View All and testimonial cards
- Homepage cards have **no box-shadow**. Peeked carousel cards used blur in Figma; the live slider uses edge fades instead.

## Layout and spacing

Not a 12-column grid. Fixed content width plus a 4-up product track.

- Artboard: 1440
- Content: **1240** with **100px** side padding (`Container` uses `xl:px-[100px]`)
- Product cards: **295 × 4**, gutter **20px**
- Header flex gap: 40px; nav gap: 24px; icon gap: 14px
- Hero stats gap: 32px with vertical dividers
- Product stack: image → 16px → title → 8px → rating → 8px → price
- View All: 36px below prices; section divider 64px below View All
- Dress-style inner padding: 64px; tile gutter 20px
- Newsletter padding: 64 × 36; overlaps footer by ~90px
- Mobile: **16px** padding, content **358**, product cards **198** with **16px** gutter
- Promo height: 38 desktop / 34 mobile (no close control on mobile)

## Assets

Raster photos: `public/images/`. Icons: `public/icons/`. Brand logos: `public/brands/` (white, for the black bar). Payment marks: `public/badges/`.

Use `next/image` for photos with explicit width/height or `fill`. Use `<img>` for SVGs. Size icon boxes explicitly (usually 24×24); do not use `height: auto` on Figma exports.

| Path | What |
| --- | --- |
| `/images/hero.png` | Hero lifestyle photo |
| `/images/product-*.png` | Catalog photos including shop extras `gradient-tee`, `polo-tipping`, `black-striped` and PDP gallery `product-one-life-{1,2,3}` |
| `/images/style-{casual,formal,party,gym}.png` | Dress-style tiles |
| `/icons/sparkle-lg.svg`, `sparkle-sm.svg` | Hero decorations |
| `/icons/{close,close-black,chevron,search,cart,account,hamburger,mail,filters,check,trash,tag}.svg` | Chrome, shop filters, cart delete + promo |
| `/icons/arrow-left.svg`, `arrow-right.svg` | Down-bold arrows; rotate ±90° for carousel |
| `/icons/stars-{50,45,35,30}.svg` | Product rating sprites. **4.0** is clipped from `stars-50`. |
| `/icons/stars-review.svg` | Larger 5-star row for testimonials |
| `/icons/verified.svg` | Green check |
| `/icons/social-bg-white.svg`, `social-bg-black.svg` | 28px circles; Facebook uses black fill |
| `/icons/{twitter,facebook,instagram,github}.svg` | Glyphs on those circles |
| `/brands/{versace,zara,gucci,prada,calvin-klein}.svg` | Brand bar |
| `/badges/{visa,mastercard,paypal,apple-pay,google-pay}.svg` | Footer |

Duplicate `header-*.svg` and `social-{1-6}.svg` files are leftovers from export. Prefer the named files above.

Starter `public/next.svg` and similar are unused by the homepage.
