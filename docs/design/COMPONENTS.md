# Components

Reuse these instead of creating parallel primitives. Paths are under `components/`. Static copy and catalog data: `lib/home-data.ts`, `lib/shop-data.ts`, `lib/product-data.ts`, `lib/cart-data.ts`.

Client components are only used where state is required: announcement dismiss, header menu/search, testimonial slider, newsletter submit, shop filters/sheet, product gallery/purchase/tabs, cart qty/remove/promo.

## Layout (every page)

| Component | Role |
| --- | --- |
| `layout/SiteShell` | Announcement + Header + `children` + Newsletter overlapping Footer |
| `layout/Container` | `max-w-[1440px]`, padding 16 / 32 / 40 / 100px |
| `layout/AnnouncementBar` | Black promo; close on desktop only |
| `layout/Header` | Logo, nav + Shop chevron, search pill, cart, account. Hamburger + icon search below `lg` |
| `layout/NewsletterBanner` | Black 20px-radius card; email + subscribe. Pulls up over the footer (`-mb-[90px]`) |
| `layout/Footer` | Brand blurb, social, four link columns, copyright, payment badges |
| `layout/SocialLinks` | Four 28px circular buttons |
| `layout/PaymentBadges` | Visa, Mastercard, PayPal, Apple Pay, Google Pay |

## UI primitives

| Component | Variants / notes |
| --- | --- |
| `ui/Logo` | `header` \| `footer`. Display font, links to `/` |
| `ui/Button` | `primary` (black), `secondary` (1px `line` border), `onDark` (white on black). Pill 62px, height 52 (46 on some mobile CTAs). Optional `fullWidth`, `href` |
| `ui/TextField` | `tone`: `muted` (search) \| `white` (newsletter). Optional 24px `icon` |
| `ui/IconButton` | 24px hit target, `aria-label` required |
| `ui/Icon` | Sized `<img>` wrapper for SVGs |
| `ui/SectionHeading` | Display 32 / 48. `align`: `center` \| `left` |
| `ui/Rating` | Product sprite by value (5, 4.5, 3.5, 3); 4.0 clipped from 5-star. `size`: `product` \| `review` |
| `ui/Price` | Current, optional struck original, optional `-%` chip |

## Domain / homepage

| Component | Role |
| --- | --- |
| `home/Hero` | Split copy + image on `xl`; stacked on small screens. Stats wrap so the third sits centered on mobile |
| `home/BrandBar` | Black strip, five white logos |
| `product/ProductCard` | `layout`: `carousel` (homepage) or `grid` (shop). Image well 198×200 / 295×298, title, rating, price. Links to `/product/[id]` |
| `home/ProductSection` | Heading + row of cards + View All. Optional hairline divider |
| `home/DressStyleGrid` | Casual/Formal then Party/Gym. Narrow 407 / wide 684 on desktop; stacked 190px tiles on mobile |
| `home/Testimonials` | Heading + prev/next. One card on small screens; sliding 400px cards from `md` up |

## Shop / category

| Component | Role |
| --- | --- |
| `shop/ShopListing` | Breadcrumb, title, sort, grid, pagination; owns filter state |
| `shop/FiltersPanel` | Sidebar/sheet body: categories, price, colors, size, dress style, Apply |
| `shop/FilterSheet` | Mobile bottom sheet (`38:679`) |
| `shop/PriceSlider` | Dual-thumb $0–$250 range, default $50–$200 |
| `shop/PaginationBar` | Previous / 1 2 3 … 8 9 10 / Next |
| `shop/ShopBreadcrumb` | Home > current style |

## Variants to keep consistent on new pages

- **Buttons:** primary for main CTA (Shop Now), secondary for View All, onDark for newsletter subscribe.
- **Inputs:** muted pill in the header, white pill on black (newsletter). Same 62px radius.
- **Product card:** no outer border; only the `#F0EEED` image well is rounded.
- **Sale chip:** 62px pill, 12px medium, `#FF3333` on 10% red.
- **Stars:** always the exported yellow SVGs, never CSS stars.

## Product detail

| Component | Role |
| --- | --- |
| `product/ProductDetailView` | Breadcrumb, gallery + buy box, tabs, related row |
| `product/ProductGallery` | Vertical thumbs (desktop) / row thumbs (mobile) + main image |
| `product/ProductPurchase` | Color swatches, size pills, qty stepper, Add to Cart |
| `product/ProductTabs` | Product Details / Rating & Reviews / FAQs |

Static PDP copy and gallery: `lib/product-data.ts`.

## Cart

| Component | Role |
| --- | --- |
| `cart/CartView` | Breadcrumb, title, line list + order summary; owns qty/remove state |
| `cart/CartLineItem` | Thumb, name, size/color, price, qty stepper, delete |
| `cart/OrderSummary` | Subtotal / discount / delivery / total, promo + Apply, checkout CTA |

Static cart seed: `lib/cart-data.ts`.
