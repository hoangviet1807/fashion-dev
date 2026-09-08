# Responsive behavior

Designed artboards: **1440** desktop and **390** mobile. There is no tablet frame. Interpolate; do not invent a third visual language.

## Breakpoints (this repo)

Aligned with Tailwind defaults and when chrome actually fits:

| Prefix | Width | Intent |
| --- | --- | --- |
| default | 390-style | Mobile: 16px padding, hamburger, stacked hero |
| `md` (768) | Tablet interpolation | 2-up style tiles, testimonial slider starts, 24–32px padding |
| `lg` (1024) | Nav + search pill restore | Header matches desktop chrome |
| `xl` (1280) | Desktop | 100px padding, 4 product columns, dress-style masonry, split hero |

`Container`: `px-4 md:px-8 lg:px-10 xl:px-[100px]`, `max-w-[1440px]`.

## Desktop (`xl`, designed at 1440)

- Promo 38px with close at the right inset.
- Header: logo, four links (Shop + chevron), growing search pill, cart, account. Row is 48px inside ~24px vertical padding (96px total with promo → hero).
- Hero: copy + stats on the left (~640px including 100px pad), photo on the right. Sparkles on the photo (104px top-right, 56px mid-left).
- Brand logos in one row on black.
- Products: four 295px columns, 20px gutters.
- Dress style: row 1 Casual 407 + Formal 684; row 2 Party 684 + Gym 407; 20px gaps; 40px gray panel.
- Testimonials: 400px cards, 20px gap, heading left / arrows right.
- Newsletter: 1240 × 180, headline left, stacked fields (349px) right; overlaps footer ~90px.
- Footer: brand column (248px) + four link columns; social under the blurb; copyright left, badges right.

## Tablet (interpolated)

- Keep hamburger until `lg`.
- Hero may stay stacked or tighten type (~48px headline). Do not force the 1440 split until `xl`.
- Products: 2–3 columns, or keep the horizontal snap row until `xl`.
- Dress style: equal 2×2 tiles (`md`), masonry only at `xl`.
- Testimonials: slider with 1–2 cards.
- Newsletter stacks (title above fields) until 349px fields fit beside the 40px title.

## Mobile (390)

- Promo 34px, no close.
- Header: hamburger, logo, search + cart + account (icons, not the pill). Menu is a simple stacked overlay (Figma has no open-menu frame).
- Hero stacked: type, full-width Shop Now (358 × 52), two stats then centered third, then 390 × 448 photo, then brand bar (~146px, logos wrap two rows).
- Products: 198px cards, 16px gap, horizontal scroll so two are in view. View All full width, 46px tall.
- Dress style: four 310 × 190 tiles stacked in the gray panel (24px inset).
- One testimonial card (358px); arrows beside the heading.
- Newsletter stacked in a black card (~358 × 293) overlapping the footer.
- Footer: blurb + social, then 2×2 link columns, centered copyright and badges.

## Shop / Category

- Desktop (`lg`+): 295px filter sidebar, 3 product columns, 20px gutters.
- Below `lg`: 2-column wrap grid, filter button (32px muted circle), bottom sheet for filters.
- Title is Satoshi Bold 32 / 24, not the display face.

## Product Detail

- Desktop (`xl`): thumbs 152×167 left of 444×530 main; buy box beside gallery; reviews 2-up.
- Below `xl`: main image first, three thumbs in a row; stacked buy box; reviews 1-up.
- Title uses display face (24 / 40). Tabs stay full-width with underline.

## Cart

- Desktop (`xl`): line list + order summary side by side; summary max 505px.
- Below `xl`: stacked list then summary; thumbs 99px, steppers 32×105.
- Title uses display face (32 / 40), uppercase.

## Checks when adding a page

- Pull **both** desktop and mobile frames from Figma.
- Reuse `Container` padding; do not add a second max-width system.
- If a control exists only on 1440 (for example promo close, search pill), hide it below `lg`/`xl` as the homepage does.
- Keep pill radius 62px and card radius 20px at every breakpoint; only widths, type size, and stacking change.
