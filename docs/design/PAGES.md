# Pages

Shell (announcement, header, newsletter, footer) is global via `app/layout.tsx` → `SiteShell`. Page files only compose sections.

Shop in the header goes to `/shop`. Dress-style tiles use `/shop?style=casual|formal|party|gym`. On Sale, New Arrivals, and Brands still hash-link homepage sections.

## Completed

### Homepage `/` — `app/page.tsx`

Source: desktop `20:2`, mobile `35:740`.

Order:

1. Hero
2. Brand bar
3. New Arrivals (divider under View All)
4. Top Selling
5. Browse by dress style
6. Testimonials  
   Then shell newsletter + footer.

New Arrivals: Tape T-shirt $120 4.5; Skinny Jeans $240/$260 −20% 3.5; Checkered Shirt $180 4.5; Sleeve Striped $130/$160 −30% 4.5.

Top Selling: Vertical Striped $212/$232 −20% 5.0; Courage Tee $145 4.0; Bermuda $80 3.0; Faded Jeans $210 4.5.

### Shop / Category `/shop` — `app/shop/page.tsx`

Source: desktop `26:855`, mobile `38:234`, filters sheet `38:679`.

Breadcrumb Home > Casual, sidebar filters (categories, price $50–$200, 10 colors, 9 sizes, dress style) with Apply Filter, 3-column grid (2 on small screens), pagination. Mobile uses a bottom sheet instead of the sidebar. Default Casual grid: Gradient Graphic, Polo Tipping, Black Striped, then Skinny Jeans through Bermuda.

Query: `?style=casual|formal|party|gym` and `?category=t-shirts|shorts|shirts|hoodie|jeans`.

### Product Detail `/product/[id]` — `app/product/[id]/page.tsx`

Source: desktop `1:2`, mobile `35:1062`.

Gallery (thumbs + main), display title, rating, price, description, color/size, quantity, Add to Cart, Rating & Reviews tabs (details / reviews / FAQ), You might also like. Canonical Figma product is `one-life`; other catalog ids share the same shell. `ProductCard` links to `/product/[id]`.

### Cart `/cart` — `app/cart/page.tsx`

Source: desktop `31:32`, mobile `39:1045`.

Breadcrumb Home > Cart, display title Your cart, bordered line-item list (thumb, name, size, color, price, qty stepper, delete), order summary (subtotal, −20% discount, $15 delivery, total), promo field + Apply, Go to Checkout. Default lines: Gradient Graphic Large/White $145; Checkered Medium/Red $180; Skinny Jeans Large/Blue $240 ($565 → $467). Header cart icon goes to `/cart`. Static data in `lib/cart-data.ts`; qty/delete are client-only.

## Implementation decisions (homepage)

Keep these unless Figma for a new page clearly contradicts them:

- Figma over generated MCP layout. Absolute-positioned reference code was rebuilt as normal document flow.
- No dark mode.
- Display font file is Clash Display standing in for Integral CF (see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)).
- Catalog is static (`lib/home-data.ts`, `lib/shop-data.ts`, `lib/product-data.ts`, `lib/cart-data.ts`).
- Shop chevron has no open-menu frame; Shop goes to `/shop`.
- Default Casual listing matches the Figma 9-card grid. Color/size/price apply when Apply Filter is pressed.
- Shop product cards wrap in a 2-up grid on small screens (not the homepage horizontal snap row).
- Product Detail default tab is Rating & Reviews. Canonical frame product is `/product/one-life`.
- Newsletter is a preventDefault form, not wired to a backend.
- Testimonial arrows are the exported down-bold SVGs rotated ±90°.
- Extra Figma testimonial cards used `blur-[2px]` off-canvas; the live carousel uses a transform slider and edge fades.
- Horizontal product row on small screens (two cards in view, scroll for the rest), not a 2×2 wrap. That matches the 390 artboard.
- Cart discount is a flat 20% on subtotal (Figma summary), not per-line. Promo Apply and Checkout are preventDefault / non-routed.
