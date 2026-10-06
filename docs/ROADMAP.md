# Roadmap — Web bán quần áo hoàn chỉnh

> Đánh dấu `[x]` khi hoàn thành. Cập nhật cột **Trạng thái** trong bảng tổng quan.
> Nguyên tắc: giữ nguyên UI đã duyệt; mọi UI mới (🎨) cần xác nhận trước khi làm.

## Tổng quan

| Giai đoạn | Nội dung | Ước lượng | Trạng thái |
|---|---|---|---|
| 1 | Luồng mua hàng cơ bản | 6–10 ngày | ✅ Xong |
| 2 | Tài khoản & trải nghiệm | 5–7 ngày | 🟨 Đang làm |
| 3 | Vận hành & hoàn thiện | 5+ ngày | 🟨 Đang làm (còn 3.5) |

Ký hiệu: ⬜ Chưa bắt đầu · 🟨 Đang làm · ✅ Xong · 🎨 Có UI mới (cần duyệt)

---

## Quyết định cần chốt

- [x] **Thị trường & thanh toán:** Việt Nam — VNPay + COD (VND; việt hoá ở 1.6)
- [x] **Nơi lưu dữ liệu:** Sanity (sản phẩm, tồn kho) + Postgres/Drizzle (đơn hàng)
- [ ] **UI mới:** có Figma cho checkout / login / account / badge giỏ / wishlist không?
- [ ] **Hosting:** Vercel hay nơi khác?

### Stack đề xuất

| Mảng | Công nghệ |
|---|---|
| Sản phẩm, danh mục, nội dung | Sanity CMS (+ Studio làm admin sản phẩm) |
| Đơn hàng, user, coupon, review | Postgres (Neon/Supabase) + Drizzle ORM |
| Đăng nhập | Auth.js (NextAuth v5) |
| Thanh toán | VNPay + MoMo + COD |
| Email | Resend + React Email |
| State client | Zustand (persist) |
| Validate | Zod |

---

## Hiện trạng (27/09/2026)

**Đã có:** trang `/`, `/shop`, `/product/[id]`, `/cart`; lọc/sắp xếp/phân trang ở shop; gallery, tabs, FAQ ở trang sản phẩm; tăng/giảm/xoá trong giỏ (trên dữ liệu mock).

**Chưa hoạt động:**
- [ ] Nút Add to Cart (`components/product/ProductPurchase.tsx`)
- [x] Search (`components/layout/Header.tsx`)
- [x] Go to Checkout (`components/cart/OrderSummary.tsx`)
- [x] Promo code (bảng `coupons`, 2.4)
- [x] Newsletter (`components/layout/NewsletterBanner.tsx`, 2.6)
- [x] Icon Account (link `/account`)
- [x] Reviews: Write / Load More / Sort (`components/product/ProductReviews.tsx`, 2.5)
- [x] Link nav On Sale / New Arrivals / Brands, link footer
- [ ] Số lượng trên icon giỏ hàng

---

## Giai đoạn 1 — Luồng mua hàng cơ bản

### 1.1 Chuẩn hoá model dữ liệu ✅
- [x] Định nghĩa type `Product` mới có `variants[]` (color, size, sku, stock), `slug`, `compareAtPrice` — `lib/types/product.ts`
- [x] Tạo lớp truy xuất `lib/data/products.ts`: `getProducts(filters)`, `getProductBySlug`, `getRelated` (+ `getCollection`, `getAllProductSlugs`)
- [x] Chuyển các component sang dùng lớp truy xuất thay vì import trực tiếp `lib/*-data.ts` (taxonomy ở `lib/catalog.ts`, helper thuần ở `lib/product.ts`, mock ở `lib/data/mock/products.ts`; route đổi thành `/product/[slug]`)
- **Xong khi:** mọi trang lấy dữ liệu qua lớp mới, giao diện không đổi.

### 1.2 Giỏ hàng toàn cục
- [x] Store `lib/cart/store.ts` (Zustand persist): `add`, `updateQty`, `remove`, `clear`, `count` (+ hook `useCartCount`, `useCartQuantity`, `useCartHydrated`)
- [x] Nối Add to Cart trong `ProductPurchase.tsx` (bắt buộc chọn size, không vượt tồn kho)
- [x] `CartView` / `CartLineItem` / `OrderSummary` đọc từ store; bỏ `initialCartItems`
- [x] 🎨 Badge số lượng trên icon giỏ ở `Header.tsx` (chấm đen nhỏ góc trên-phải, số trắng, ẩn khi rỗng, `99+`)
- [x] Xử lý hydration (chỉ render số lượng sau khi mount)
- **Xong khi:** thêm sản phẩm → reload → giỏ vẫn đúng.

### 1.3 Chuyển dữ liệu sang Sanity ✅
- [x] Khởi tạo Sanity project + Studio (project `j6e8casz`, dataset `production`, Studio nhúng tại `/studio`; trang site chuyển vào route group `app/(site)`)
- [x] Schema: `product` (+ `productVariant`, `faq`), `category`, `dressStyle`, `brand`, `testimonial`, `siteSettings` (singleton)
- [x] Query GROQ (`defineQuery`, `sanity/lib/queries.ts`) + TypeGen (`pnpm typegen` → `sanity.types.ts`)
- [x] Ảnh qua Sanity CDN + `next/image` (`remotePatterns` cho `cdn.sanity.io`)
- [x] Script seed 14 sản phẩm mẫu hiện có (`pnpm seed`, chạy lại an toàn)
- [x] Đưa lọc / sắp xếp / phân trang lên GROQ (tham số trên URL: `color`, `size`, `price`, `sort`, `page`)
- [x] Revalidate: `<SanityLive />` (Live Content API) + webhook tag `app/api/revalidate` (cần `SANITY_REVALIDATE_SECRET` khi deploy)
- **Xong khi:** sửa giá trong Studio → site cập nhật trong vài giây.

### 1.4 🎨 Checkout ✅
- [x] Route `/checkout`: liên hệ, địa chỉ, vận chuyển (Standard $15 / Express $30), thanh toán (thẻ / COD) — `components/checkout/CheckoutView.tsx`, tái dùng `TextField`, `Button`, `OrderSummary` (nút Go to Checkout đã nối)
- [x] Validate Zod ở client + server action (`lib/checkout/schema.ts`, `app/(site)/checkout/actions.ts`)
- [x] Tính lại giá và kiểm tra tồn kho ở server (`lib/checkout/quote.ts`, đọc Sanity không qua CDN; lệch tổng `expectedTotal` → cập nhật giỏ và yêu cầu đặt lại)
- **Còn lại cho 1.5:** tạo đơn, giữ chỗ tồn kho, thanh toán thật (hiện Place Order chỉ xác nhận thông tin)

### 1.5 Thanh toán & đơn hàng ✅ (VNPay + COD)
- [x] Setup Postgres + Drizzle (`docker-compose.yml`, `pnpm db:up` / `db:generate` / `db:migrate`, migration `drizzle/0000_init.sql`, `lib/db`)
- [x] Bảng: `orders`, `order_items`, `payments`, `inventory_reservations` (`lib/db/schema.ts`)
- [x] Tạo đơn trong `submitCheckout` → `lib/orders/create.ts` (một transaction: đơn `pending_payment`, giữ chỗ tồn kho 15 phút với advisory lock theo SKU, tạo payment + URL VNPay ký HMAC-SHA512)
- [x] Webhook IPN `app/api/webhooks/vnpay/route.ts` + return URL `app/api/payments/vnpay/return` (dùng chung `lib/orders/payments.ts`, idempotent: `paid`, trừ kho Sanity, gửi email; thất bại → `payment_failed`, nhả giữ chỗ, quay lại `/checkout?payment=failed`)
- [x] Luồng COD (`awaiting_fulfillment`, trừ kho + gửi email ngay)
- [x] 🎨 Trang `/order/[id]/success` + xoá giỏ hàng (chỉ khi đơn đã xác nhận)
- [x] Email xác nhận qua Resend (`lib/email`, gửi đúng 1 lần/đơn; không có `RESEND_API_KEY` thì log ra console)
- **Xong khi:** thanh toán thẻ test → đơn trong DB → tồn kho giảm → email gửi đi.
- **Để chạy thật cần điền `.env.local`** (xem `.env.example`): `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET` (đăng ký sandbox), `SANITY_API_WRITE_TOKEN` (quyền Editor — thiếu thì đơn vẫn tạo nhưng không trừ kho), `RESEND_API_KEY`. Khi deploy: khai báo IPN URL `https://<domain>/api/webhooks/vnpay` trong cổng merchant VNPay.

### 1.6 Việt hoá cho thị trường Việt Nam ✅
- [x] Giá catalog chuyển sang VND (×1000: 145 → 145.000₫) — seed (`scripts/seed-data.ts`) + dữ liệu Sanity (`pnpm migrate:prices-vnd`, đã chạy, chạy lại không đổi gì); bỏ `VND_PER_USD` / `toVnd`, `STORE_CURRENCY = "VND"`, VNPay trừ đúng `quote.total`
- [x] `formatPrice` theo `vi-VN` (`350.000₫`) dùng ở mọi component, email, thông báo đổi giá, preview Studio; đơn USD cũ vẫn hiển thị `$` theo cột `currency`
- [x] Phí vận chuyển 30.000₫ / 50.000₫, giảm giá làm tròn VND, bộ lọc giá 0–250.000₫ bước 10.000₫; giỏ `localStorage` cũ (giá USD) tự xoá (store v2)
- [x] Giao diện tiếng Việt: `lang="vi"`, chuỗi UI + aria-label, metadata, email, thông báo lỗi Zod (`z.config(z.locales.vi())` + message riêng), nhãn danh mục / phong cách / màu
- [x] 🎨 Font đổi sang Be Vietnam Pro (body) + Montserrat Bold (display) vì Satoshi / Integral CF không có glyph tiếng Việt và `₫` (đã duyệt)
- [x] Form địa chỉ VN theo địa giới mới từ 1/7/2025: Tỉnh/Thành (34) → Phường/Xã (3.321), không còn Quận/Huyện; bỏ postal code/country. Dữ liệu `lib/address/data` (`pnpm address:update`, nguồn provinces.open-api.vn v2), phường tải theo tỉnh qua `/api/address/wards`, server kiểm tra phường thuộc tỉnh. Validate SĐT di động VN, chuẩn hoá về `0xxxxxxxxx`
- [x] VNPay: `vnp_Locale` lấy từ `SITE_LOCALE` (`lib/locale.ts`)
- [x] 🎨 VNPay cho chọn hình thức ngay ở checkout (`vnp_BankCode`: chọn trên VNPay / VNPAY-QR / ATM – Internet Banking / thẻ quốc tế) — danh sách con hiện dưới lựa chọn VNPay, dùng lại `Choice`
- [x] MoMo làm cổng thứ hai (`lib/payments/momo.ts`, `captureWallet`, HMAC-SHA256; IPN `app/api/webhooks/momo` trả 204, return `app/api/payments/momo/return`; xử lý chung với VNPay trong `lib/orders/payments.ts`; mã 1000/7000/7002/9000 giữ đơn ở trạng thái chờ; migration `0001_add_momo_payment`). Cần `MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY`
- **Lưu ý:** nội dung trong Sanity (tên / mô tả sản phẩm, FAQ, testimonial) vẫn là tiếng Anh — cần biên tập viên dịch trong Studio.

---

## Giai đoạn 2 — Tài khoản & trải nghiệm

### 2.1 🎨 Đăng nhập ✅ (chờ duyệt UI)
- [x] Auth.js v5 + Drizzle adapter (`auth.ts`, `auth.config.ts`, route `app/api/auth/[...nextauth]`): email/mật khẩu (scrypt, `lib/auth/password.ts`) + OAuth Google / Facebook (mỗi nút chỉ hiện khi có `AUTH_<GOOGLE|FACEBOOK>_ID` / `_SECRET`; Facebook không trả email → báo lỗi `OAuthNoEmail`). Session JWT; bảng `users`, `accounts`, `password_reset_tokens` (migration `0002_add_auth`)
- [x] Trang `/login`, `/register`, `/forgot-password`, `/reset-password` (`app/(site)/(auth)`, form ở `components/auth`, dựng từ `TextField` / `Button`, validate Zod client + server action). Quên mật khẩu: token 60 phút (lưu SHA-256, dùng 1 lần), email qua Resend, không lộ email nào đã đăng ký, chặn gửi lại trong 60 giây
- [x] `proxy.ts` bảo vệ `/account/*` → `/login?callbackUrl=...` (chỉ nhận đường dẫn nội bộ)
- [x] Nối icon Account trong header (`/account`); trang `/account` tạm: họ tên, email, đăng xuất (mở rộng ở 2.2)
- **Bảo mật:** đăng nhập Google với email trùng tài khoản mật khẩu chưa xác minh → gộp tài khoản và xoá mật khẩu cũ (chống chiếm tài khoản bằng email người khác); đặt lại mật khẩu đánh dấu email đã xác minh. Chưa có rate limit đăng nhập (3.4)

### 2.2 🎨 Trang tài khoản ✅ (chờ duyệt UI)
- [x] `/account` — thông tin cá nhân: sửa họ tên + SĐT (cột `users.phone`), đổi mật khẩu (chỉ tài khoản có mật khẩu). Layout chung `app/(site)/account/layout.tsx` + thanh tab `components/account/AccountNav.tsx` (Thông tin / Đơn hàng / Sổ địa chỉ / Đăng xuất), dựng từ style sẵn có
- [x] `/account/orders`, `/account/orders/[id]` — lịch sử & trạng thái đơn (`lib/account/queries.ts`, nhãn trạng thái `lib/orders/status.ts`). Đơn gắn `orders.user_id` khi đặt lúc đã đăng nhập; đơn khách cùng email chỉ hiện khi email đã xác minh. Chi tiết đơn dùng chung `components/order/OrderDetails.tsx` với trang success; đơn của người khác → 404
- [x] `/account/addresses` — sổ địa chỉ (bảng `addresses`, tối đa 10, một địa chỉ mặc định — unique index một phần): thêm / sửa / xoá / đặt mặc định, form Tỉnh → Phường/Xã dùng chung hook `lib/address/use-wards.ts`. Checkout tự điền email + địa chỉ mặc định khi đã đăng nhập
- [x] Gộp giỏ `localStorage` vào giỏ server khi đăng nhập (bảng `cart_items`, chỉ lưu SKU + số lượng; giá / tồn kho đọc lại từ Sanity). `components/cart/CartSync.tsx` đồng bộ khi tải trang và ngay sau khi rời trang đăng nhập / đăng ký: giỏ khách được cộng dồn vào giỏ đã lưu (giới hạn theo tồn kho), sau đó mọi thay đổi được ghi lên server. Đăng xuất xoá giỏ trên trình duyệt, giỏ đã lưu vẫn còn cho lần đăng nhập sau
- Migration `0003_add_account` (đã chạy)

### 2.3 Tìm kiếm ✅
- [x] Nối form search (desktop + mobile) tới `/shop?q=...` (`next/form` trong `Header.tsx`, bỏ qua khi ô trống; form mobile tự đóng khi tìm). Tham số `q` kết hợp được với danh mục / phong cách / bộ lọc / sắp xếp / phân trang; khi có `q` không mặc định lọc "Thường ngày"; tiêu đề "Kết quả cho “…”"
- [x] Tìm theo tên / danh mục / phong cách / thương hiệu / màu / tag bằng GROQ `match` (`SHOP_FILTER` trong `sanity/lib/queries.ts`, tiền tố `từ*`, mọi từ đều phải khớp). Trường `tags` mới trong schema `product` để biên tập viên thêm từ khoá (kể cả tiếng Việt). Vì nội dung catalog tiếng Anh, `lib/search.ts` dịch nhãn tiếng Việt sang slug ("áo thun đen" → `t-shirts black`, "quần bò" → `jeans`) và tìm song song với từ khoá gốc. Sắp xếp "Phổ biến nhất" ưu tiên sản phẩm có tên khớp (`score`)
- [ ] (Tuỳ chọn) Algolia / Meilisearch
- **Lưu ý:** `match` phân biệt dấu ("ao" không khớp "áo"); từ chung chung như "áo" / "quần" đứng một mình không lọc được gì

### 2.4 Mã giảm giá ✅
- [x] Bảng `coupons` (migration `0004_add_coupons`, đã chạy): `percent` / `fixed`, `min_subtotal`, `max_discount` (trần cho mã %), `starts_at` / `expires_at`, `usage_limit`, `active`; mã lưu chữ hoa, có CHECK ràng buộc giá trị. `orders.coupon_id` + `coupon_code`. Số lượt **đếm từ đơn hàng** (đã thanh toán / COD / chờ thanh toán trong 15 phút giữ chỗ) nên đơn thất bại hoặc bỏ dở tự trả lượt. Tạo mã: `pnpm coupon:create SALE20 --percent 20 --max 100000 --min 300000 --expires 2026-12-31 --limit 100` (`--fixed 50000`, `--disable`), hoặc `pnpm db:studio`
- [x] Server action `applyPromo` (`app/(site)/cart/actions.ts`) kiểm mã trên tạm tính tính lại từ Sanity; logic ở `lib/coupons/server.ts`, tính tiền dùng chung client/server ở `lib/coupons/discount.ts`. Bỏ giảm cứng 20%. `quoteCart` kiểm lại mã ở checkout (mã hết hạn / dưới mức tối thiểu → gỡ mã + thông báo); `placeOrder` giữ lượt trong transaction với advisory lock theo mã → không vượt `usage_limit` khi đặt đồng thời
- [x] Nối form promo trong `OrderSummary.tsx`: mã lưu trong giỏ (Zustand) nên mang từ giỏ sang checkout; lỗi hiện dưới ô nhập; khi đã áp dụng nút đổi thành "Gỡ mã". Dòng "Giảm giá (MÃ · -20%)" chỉ hiện khi có mã; mã hiện trong chi tiết đơn + email xác nhận
- **Lưu ý:** chưa có rate limit cho `applyPromo` (3.4); chưa giới hạn số lần dùng / khách

### 2.5 🎨 Reviews ✅ (chờ duyệt UI form viết đánh giá)
- [x] Bảng `reviews` (migration `0005_add_reviews`, đã chạy): theo `product_slug` (giống `order_items`), `rating` 1–5 (CHECK), `content`, `order_id` của đơn đủ điều kiện; mỗi user 1 đánh giá / sản phẩm (unique), viết lại = sửa. Chỉ người đã mua mới được viết: đơn của user (hoặc đơn khách cùng email đã xác minh, dùng chung `ownedBy`) ở trạng thái đã xác nhận (`CONFIRMED_ORDER_STATUSES`: đã thanh toán / COD / đang giao / hoàn tất) có sản phẩm đó. Logic ở `lib/reviews/server.ts`, schema Zod + kiểu dùng chung client/server ở `lib/reviews/shared.ts`
- [x] Server actions `app/(site)/product/[slug]/actions.ts`: `loadReviews` (sắp xếp mới nhất / cũ nhất / sao cao / sao thấp, lọc theo số sao, 6 đánh giá / trang), `getReviewEligibility`, `submitReview` (kiểm lại quyền + Zod ở server)
- [x] Nối tab Đánh giá (`components/product/ProductReviews.tsx`, thay danh sách mẫu `placeholder-reviews.ts` đã xoá): nút "Mới nhất" và icon lọc giữ nguyên giao diện, bên dưới là `<select>` trong suốt (sắp xếp chỉ hiện từ `sm` như thiết kế; lọc sao dùng được cả mobile; tiêu đề đổi thành "Đánh giá N sao (x)" khi lọc). "Xem thêm đánh giá" tải trang kế, ẩn khi hết. "Viết đánh giá": chưa đăng nhập → `/login?callbackUrl=...`; chưa mua → thông báo; đủ điều kiện → 🎨 form ngay trong tab (chọn 1–5 sao, nội dung 10–1000 ký tự, hiển thị tên trong hồ sơ; đã viết thì điền sẵn để sửa), dựng từ style card đánh giá / `Button` / `FormNotice`. Chưa có đánh giá → dòng "Chưa có đánh giá nào…"
- [x] Rating trung bình tính từ dữ liệu thật: trang sản phẩm đọc trung bình + số lượng + trang đầu từ Postgres (`unstable_cache`, tag `reviews:<slug>`, xoá cache khi gửi đánh giá; DB lỗi → vẫn hiện trang với rating Sanity). Gửi đánh giá → ghi `rating` / `reviewCount` vào Sanity (published + draft) để card / danh sách cũng đúng; hai trường này chuyển sang chỉ đọc trong Studio, seed không ghi nữa. `pnpm reviews:sync [slug...]` tính lại từ DB. `Rating` làm tròn tới nửa sao (thêm 1–2,5 sao bằng cách cắt `stars-50.svg`), 0 → "Chưa có đánh giá" (giữ chiều cao dòng)
- **Cần làm:** chạy `pnpm reviews:sync` một lần để xoá rating mẫu (4,5 / 451 đánh giá…) còn trong Sanity — sau đó mọi sản phẩm chưa có đánh giá sẽ hiện "Chưa có đánh giá" trên card
- **Lưu ý:** đổi slug sản phẩm trong Studio sẽ tách đánh giá cũ (khoá theo slug như `order_items`); xoá đánh giá ở `/admin/reviews` (3.1), chưa có duyệt trước khi hiển thị

### 2.6 Email & newsletter ✅
- [x] Email xác nhận đơn, đang giao, reset mật khẩu. Gửi chung qua `lib/email/send.ts` (không có `RESEND_API_KEY` thì log ra console). Email đơn hàng ở `lib/email/order-notifications.ts`: mỗi loại gửi đúng 1 lần/đơn (giữ chỗ cột `confirmation_sent_at` / `shipping_notified_at`, lỗi thì nhả để gửi lại). Trạng thái mới `shipped` ("Đang giao") + cột `carrier`, `tracking_number`, `shipped_at`; `lib/orders/fulfillment.ts` (`markOrderShipped` / `markOrderDelivered`, dùng lại cho admin 3.1). Tạm thời cập nhật bằng CLI: `pnpm order:ship 100001 --carrier GHN --tracking GHN123` (→ Đang giao + email, chạy lại chỉ cập nhật mã vận đơn), `pnpm order:ship 100001 --delivered` (→ Hoàn tất). Email "đang giao" có đơn vị vận chuyển, mã vận đơn, số tiền cần trả nếu COD. Đơn `shipped` vẫn tính là đã mua (review, lượt dùng mã)
- [x] Newsletter: bảng `newsletter_subscribers` (email chữ thường, `pending` → `subscribed` → `unsubscribed`). Double opt-in: form gọi server action `subscribeNewsletter` (`app/(site)/newsletter/actions.ts`) → email xác nhận (token 48 giờ, chỉ lưu SHA-256) → `/api/newsletter/confirm` → email chào mừng có link huỷ + header `List-Unsubscribe` (one-click POST theo RFC 8058) → `/api/newsletter/unsubscribe`. Kết quả hiện ngay dưới form (`?newsletter=confirmed|unsubscribed|invalid`, tự xoá khỏi URL)
- [x] Chống spam: ô honeypot ẩn, chặn gửi trong 1,5 giây đầu, luôn trả cùng một thông báo (không dò được email đã đăng ký), không gửi lại email xác nhận trong 60 giây. Rate limit dùng chung `lib/rate-limit.ts` (bảng `rate_limits`, cửa sổ cố định, khoá băm SHA-256, chạy được nhiều instance): 5 lần / 10 phút / IP, tối đa 3 email xác nhận / ngày / địa chỉ. `clientIp()` chuyển sang `lib/request.ts`
- Migration `0006_add_newsletter_shipping` (đã chạy)
- **Lưu ý:** chưa có công cụ gửi bản tin hàng loạt (danh sách nằm ở bảng `newsletter_subscribers`, `status = 'subscribed'`); mã vận đơn đã hiện trong chi tiết đơn trên site từ 3.1

### 2.7 Sửa link chết ✅
- [x] On Sale → `/shop?sale=1` (sản phẩm có `compareAtPrice > price` hoặc `discount > 0`; tiêu đề "Khuyến mãi")
- [x] New Arrivals → `/shop?sort=newest` (sắp xếp theo `_createdAt`, thêm lựa chọn "Mới nhất" vào ô sắp xếp; tiêu đề "Hàng mới về")
- [x] Brands → bộ lọc thương hiệu `/shop?brand=<slug>` (trường `slug` mới trong schema `brand`). Link nav "Thương hiệu" → `/#brands` (thanh logo ở trang chủ), mỗi logo dẫn tới `/shop?brand=...`; tiêu đề là tên thương hiệu. Không làm trang `/brands` riêng (sẽ là UI mới). `pnpm migrate:brands` (đã chạy) gán slug cho thương hiệu + thương hiệu mẫu cho 14 sản phẩm (`PRODUCT_BRANDS` trong `scripts/seed-data.ts`, chỉ sản phẩm chưa có thương hiệu)
- [x] `sale` / `brand` kết hợp được với tìm kiếm, danh mục, phong cách, bộ lọc, phân trang. Mặc định "Thường ngày" chỉ áp dụng cho `/shop` không có phạm vi nào và sắp xếp mặc định
- [x] 🎨 Trang nội dung từ Sanity `app/(site)/[slug]/page.tsx` (schema `page`: title, slug, description, body Portable Text — `components/content/PageBody.tsx`, dựng từ style trang tài khoản). `pnpm seed:pages` (đã chạy) tạo 6 trang tiếng Việt: `/gioi-thieu`, `/cau-hoi-thuong-gap`, `/giao-hang`, `/doi-tra`, `/chinh-sach-bao-mat`, `/dieu-khoan` (không ghi đè trang đã có). Slug không tồn tại → 404; tag revalidate `page` / `page:<slug>`
- [x] Link footer: 4 cột Công ty / Hỗ trợ / Tài khoản / Danh mục trỏ tới route thật (`footerColumns` trong `lib/home-data.ts`, dùng `next/link`)
- **Lưu ý:** nội dung trang (chính sách đổi trả 7 ngày, hoàn tiền 5–7 ngày…) là nội dung mẫu — cần biên tập lại trong Studio cho đúng chính sách thật. Khi deploy, thêm `"page"` vào filter webhook revalidate

### 2.8 🎨 Thanh toán QR ngay trên site ✅ (chờ duyệt UI)
Hiện VNPay / MoMo chuyển khách sang trang của cổng để quét QR. Mục tiêu: sau khi bấm Đặt hàng, hiện mã QR ngay trong app và tự chuyển sang trang thành công khi nhận tiền.
- [x] Chốt cách làm: **payOS** (chuyển khoản VietQR, tiền vào thẳng tài khoản ngân hàng, khách quét bằng mọi app ngân hàng)
- [x] `lib/payments/payos.ts` (gọi REST trực tiếp, không SDK): tạo link (ký HMAC-SHA256, `expiredAt` = hạn giữ chỗ), đọc trạng thái, huỷ link, kiểm chữ ký webhook. Enum `payment_method` thêm `payos`; `payments.transfer` (QR + số tài khoản + nội dung) và `payments.expires_at` (migration `0007_add_payos_payment`, đã chạy). `orderCode` = số đơn + 4 chữ số ngẫu nhiên (payOS yêu cầu số, không trùng kể cả khi DB reset); nội dung chuyển khoản `DH<số đơn>` (≤ 9 ký tự)
- [x] Webhook `app/api/webhooks/payos` → `handlePayosWebhook` dùng lại `applyPaymentResult` ở `lib/orders/payments.ts` (đối chiếu số tiền, idempotent, trừ kho, gửi email). Tiền về sau khi đơn đã huỷ / hết hạn → log để hoàn tiền tay. `abandonPayment` giờ chỉ đổi payment còn `pending` (không ghi đè thanh toán vừa thành công)
- [x] 🎨 Trang `/order/[id]/pay` (`components/order/BankTransferView.tsx`, dựng từ style sẵn có): mã QR (SVG từ `qrcode`), ngân hàng (tra BIN ở `lib/payments/vietqr-banks.ts`), chủ tài khoản, số tài khoản / số tiền / nội dung kèm nút "Sao chép", đồng hồ đếm ngược 15 phút, nút "Mở trang thanh toán payOS" (cho điện thoại) và "Đổi phương thức thanh toán" (huỷ link, nhả kho, quay lại checkout); bên dưới dùng lại `OrderDetails`
- [x] Polling 4 giây `GET /api/orders/[id]/payment` → `syncPayosPayment`: hỏi thẳng payOS nên chạy được cả khi chưa có webhook công khai (local); `PAID` → `/order/[id]/success`; hết hạn / link bị huỷ → huỷ link payOS, nhả giữ chỗ, hiện "Thanh toán đã hết hạn" + nút "Đặt hàng lại" (giỏ vẫn còn). Đơn payOS chưa trả mở `/success` → chuyển về `/pay`
- [x] Lựa chọn "Chuyển khoản ngân hàng (VietQR)" ở checkout (thiếu key → báo lỗi, gợi ý chọn phương thức khác)
- **Để chạy thật cần:** `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` (my.payos.vn → Kênh thanh toán, liên kết tài khoản ngân hàng); khai báo webhook `https://<domain>/api/webhooks/payos` trong dashboard payOS. VNPay vẫn cần key sandbox để test

---

## Giai đoạn 3 — Vận hành & hoàn thiện

### 3.1 Admin ✅ (chờ duyệt UI `/admin`)
- [x] Sản phẩm / nội dung / banner qua Sanity Studio: Studio chia nhóm (Site settings → Products + **Low stock (≤ 5)** → Category / Dress style / Brand → Page / Testimonial); preview sản phẩm hiện số biến thể sắp hết. Banner = thanh thông báo trên header, sửa ở Site settings → tab *Announcement banner* (bật/tắt, nội dung, nhãn + link `/…`, `#…` hoặc `https://…`); để trống → giữ câu mặc định "Đăng ký để được giảm 20%…" (giao diện không đổi). `SiteShell` đọc qua `getAnnouncement()` (tag `siteSettings`)
- [x] 🎨 `/admin` (dựng từ style trang tài khoản, nằm trong `app/(site)/admin`): cột `users.role` (`customer` / `staff` / `admin`, migration `0008_add_admin`, đã chạy). Cấp quyền: `pnpm user:role email@x.com admin|staff|customer`, `pnpm user:role --list`. Quyền ở `lib/admin/roles.ts` — **staff**: xem đơn, giao hàng, huỷ đơn, tồn kho, xoá đánh giá; **admin**: thêm hoàn tiền. Role đọc từ DB mỗi request (`lib/admin/auth.ts`, không nằm trong JWT) nên cấp / thu hồi có hiệu lực ngay; `proxy.ts` chặn khách chưa đăng nhập, user không đủ quyền → 404. Link "Quản trị" chỉ hiện trong thanh tab tài khoản của staff/admin
  - `/admin/orders`: lọc Cần xử lý (mặc định, cũ nhất trước) / Đang giao / Hoàn tất / Chờ thanh toán / Đã huỷ – thất bại / Tất cả kèm số lượng; tìm theo số đơn, email, SĐT, tên khách; 20 đơn / trang
  - `/admin/orders/[id]`: **Vận chuyển** (đơn vị + mã vận đơn → Đang giao + email 1 lần, sửa lại chỉ cập nhật mã), **Đánh dấu đã giao** (đơn COD được ghi `paid_at` khi hoàn tất), **Huỷ đơn** (lý do, tuỳ chọn nhập lại kho — mặc định bật, tắt sẵn nếu đơn đã giao đi; chỉ huỷ được đơn đã xác nhận, đơn chờ thanh toán online tự hết hạn), **Hoàn tiền** (chỉ admin; đơn đã thanh toán online hoặc COD đã hoàn tất; nhiều lần, tổng không vượt tổng đơn — khoá dòng đơn khi ghi). Danh sách giao dịch, lịch sử thao tác (bảng `order_events`: ai làm, lúc nào), chi tiết đơn
  - Logic ở `lib/orders/fulfillment.ts` (`markOrderShipped` / `markOrderDelivered` / `cancelOrder` / `recordRefund`, dùng chung với `pnpm order:ship`); nhập lại kho `restockOrder` (`lib/orders/inventory.ts`) cộng lại Sanity cho các giữ chỗ `committed` rồi chuyển `released` → chạy lại không cộng 2 lần
  - `/admin/reviews`: đánh giá mới nhất, lọc 1–2 sao / ≤ 3 sao, xoá (tính lại điểm trung bình + đồng bộ Sanity, xoá cache trang sản phẩm)
  - Phía khách: chi tiết đơn hiện đơn vị vận chuyển + mã vận đơn và dòng "Đã hoàn tiền" (nếu có)
- [x] Cảnh báo sắp hết hàng: ngưỡng `NEXT_PUBLIC_LOW_STOCK_THRESHOLD` (mặc định 5, `lib/inventory/threshold.ts`, dùng chung site + Studio). Khi trừ kho sau đơn hàng, biến thể vừa tụt từ trên ngưỡng xuống ≤ ngưỡng → email "Sắp hết hàng" (`lib/email/LowStockEmail.tsx`) tới `ADMIN_ALERT_EMAILS` (hoặc mọi tài khoản admin) — mỗi lần tụt ngưỡng gửi 1 lần. Trang `/admin/inventory`: biến thể ≤ ngưỡng, tồn kho / đang giữ (đơn chưa trả xong) / còn bán được, link mở thẳng sản phẩm trong Studio
- **Lưu ý:** hoàn tiền **chỉ ghi nhận** — tiền phải trả qua cổng quản trị VNPay / MoMo, chuyển khoản lại (payOS) hoặc tiền mặt (COD) trước; chưa gọi API hoàn tiền của cổng. Huỷ đơn chưa gửi email cho khách. Trang admin nằm trong khung site (header / newsletter / footer) để dùng lại style — cần duyệt. Studio vẫn đăng nhập bằng tài khoản Sanity riêng (mời biên tập viên trong sanity.io/manage)

### 3.2 🎨 Wishlist ✅ (chờ duyệt UI)
- [x] `localStorage` cho khách, lưu DB khi đã đăng nhập: store Zustand `lib/wishlist/store.ts` (key `shopco-wishlist`, chỉ lưu slug, mới nhất trước, tối đa 100). Bảng `wishlist_items` (`user_id` + `product_slug`, khoá theo slug như `order_items`; migration `0009_add_wishlist`, đã chạy). `components/wishlist/WishlistSync.tsx` chạy giống `CartSync`: khi đăng nhập / đăng ký, danh sách khách được gộp lên đầu danh sách đã lưu (bỏ trùng), sau đó mọi thay đổi được ghi lên server (`app/(site)/wishlist/actions.ts`: `syncWishlist`, `saveWishlist`, kiểm tra phiên đúng user). Đăng xuất xoá bản trên trình duyệt, bản đã lưu vẫn còn
- [x] 🎨 Icon tim: nút tròn trắng góc trên-phải ảnh trên mọi `ProductCard` (nằm ngoài link nên bấm không mở trang sản phẩm), nút tròn viền cạnh "Thêm vào giỏ" ở trang sản phẩm; tim rỗng → tô đen khi đã lưu, `aria-pressed` + aria-label theo tên sản phẩm
- [x] 🎨 Trang `/wishlist` (khung giống trang tài khoản, lưới `ProductCard` 2 / 4 cột): dùng được cả khi chưa đăng nhập (kèm gợi ý "Đăng nhập để lưu danh sách trên mọi thiết bị"), sản phẩm đọc từ Sanity theo slug (`getProductsBySlugs`, query `PRODUCTS_BY_SLUGS_QUERY`), sản phẩm đã xoá tự rơi khỏi danh sách, trống → "Mua sắm". Link "Yêu thích" trong thanh tab tài khoản và cột Tài khoản ở footer
- **Lưu ý:** header chưa có icon tim (sẽ đổi thiết kế header — cần duyệt nếu muốn thêm); đổi slug sản phẩm trong Studio sẽ làm mất mục yêu thích cũ

### 3.3 SEO ✅
- [x] `app/sitemap.ts` (sinh từ Sanity, query `SITEMAP_QUERY`): `/`, `/shop`, `/shop?sale=1`, `/shop?sort=newest`, mọi sản phẩm + trang nội dung kèm `lastModified` = `_updatedAt`; cache theo tag `product` / `page` nên webhook revalidate cập nhật luôn sitemap
- [x] `app/robots.ts`: cho phép toàn site, chặn `/admin`, `/account`, `/api/`, `/studio`, `/checkout`, `/order/`; khai báo `sitemap.xml`. Giỏ hàng / checkout / quên mật khẩu thêm `noindex` (tài khoản, admin, đơn hàng, wishlist đã có); `/shop?q=...` → `noindex, follow`
- [x] Open Graph + Twitter card cho sản phẩm (`productMetadata` trong `lib/seo.ts`): tiêu đề, mô tả cắt ~160 ký tự, tối đa 4 ảnh Sanity CDN resize ≤ 1200px, `summary_large_image`, canonical, `product:price:*`. `metadataBase` = `siteUrl()` (`NEXT_PUBLIC_SITE_URL`) ở root layout; trang nội dung + `/shop` có OG riêng
- [x] JSON-LD (`components/seo/JsonLd.tsx`, chỉ là thẻ `<script>`, không đổi giao diện): `Product` (giá VND, còn / hết hàng theo tồn kho biến thể, thương hiệu — thêm `brand` vào `PRODUCT_BY_SLUG_QUERY`, `aggregateRating` chỉ khi có đánh giá thật), `BreadcrumbList` (sản phẩm: Trang chủ → Cửa hàng → danh mục → sản phẩm; trang nội dung), `Organization` + `WebSite` kèm `SearchAction` (`/shop?q=`) ở trang chủ
- [x] URL sản phẩm dùng slug (đã có từ 1.1: `/product/[slug]`)
- **Khi deploy:** đặt `NEXT_PUBLIC_SITE_URL` = domain thật (canonical, OG, sitemap đều dựa vào biến này); gửi `https://<domain>/sitemap.xml` lên Google Search Console. Chưa có ảnh OG mặc định / logo cho `Organization` (cần file thiết kế)

### 3.4 Độ ổn định ✅ (chờ duyệt UI trang lỗi / 404 / skeleton)
- [x] 🎨 Trang 404 / lỗi / đang tải, dựng từ style sẵn có (`components/feedback`: `StatusView` giống trang giỏ / đơn hàng — breadcrumb, tiêu đề display, mô tả, nút `Button`; skeleton là khối `bg-muted` nhấp nháy, tắt khi `prefers-reduced-motion`)
  - 404: `app/(site)/not-found.tsx` (slug / đơn hàng không tồn tại), `app/(site)/product/[slug]/not-found.tsx` ("Không tìm thấy sản phẩm"), `app/not-found.tsx` cho URL không khớp route nào (tự bọc `SiteShell` để vẫn có header / footer). Đều trả mã 404 + `noindex`
  - Lỗi: `app/(site)/error.tsx` (nút "Thử lại" gọi `retry()`, "Về trang chủ"); `account/error.tsx`, `admin/error.tsx` hiện khung lỗi bên dưới thanh tab (giữ nguyên layout); `app/global-error.tsx` khi chính root layout / `SiteShell` lỗi. Mọi lỗi gửi lên Sentry
  - Đang tải: `shop` (lưới 2 / 3 cột + cột bộ lọc), `checkout`, `order/[id]`, `account`, `admin` (khối nội dung bên dưới thanh tab). **Không** thêm cho `/product/[slug]` và `/[slug]`: `loading.tsx` làm Next stream phản hồi nên `notFound()` trả 200 thay vì 404 (kể cả với Googlebot) — hai route này đã SSG nên gần như không cần
- [x] Rate limiting (dùng chung `lib/rate-limit.ts`; thêm `peekRateLimit` để chỉ đếm lần thất bại, `retryMinutes`; `ipFromHeaders` trong `lib/request.ts`):
  - Đăng nhập: kiểm trong `authorize` (`auth.ts`) nên chặn cả khi gọi thẳng `/api/auth/callback/credentials` — 20 lần / 15 phút / IP, 8 lần **sai** / 15 phút / email (`LoginRateLimited` → "Bạn đã đăng nhập sai quá nhiều lần…")
  - Đăng ký 5 / giờ / IP; quên mật khẩu 5 / 15 phút / IP + tối đa 5 email / ngày / địa chỉ (vẫn báo "đã gửi"); đặt lại mật khẩu 10 / 15 phút / IP; đổi mật khẩu 5 lần sai / 15 phút / tài khoản
  - Mã giảm giá (`applyPromo`) 10 / 10 phút / IP; newsletter giữ như 2.6
- [x] Sentry (`@sentry/nextjs` 11): `instrumentation.ts` (`onRequestError` = lỗi server component / route handler / server action), `instrumentation-client.ts`, `sentry.server.config.ts` / `sentry.edge.config.ts`, cấu hình chung `lib/sentry.ts` (tắt hẳn khi không có `NEXT_PUBLIC_SENTRY_DSN`, `sendDefaultPii: false` vì đơn hàng có tên / SĐT / địa chỉ, trace 10%). `next.config.ts` bọc `withSentryConfig` (`@sentry/nextjs/config`): tunnel `/monitoring` tránh bị adblock chặn, chỉ upload source map khi có `SENTRY_AUTH_TOKEN`
- [x] Analytics (`components/analytics/Analytics.tsx`, nằm trong `SiteShell` nên không tính Studio): Vercel Analytics tự bật khi chạy trên Vercel (`VERCEL`), GA4 qua `@next/third-parties` khi có `NEXT_PUBLIC_GA_ID`. Sự kiện e-commerce GA4 (`lib/analytics.ts`, đồng thời gửi custom event Vercel): `add_to_cart` (trang sản phẩm, số lượng thực thêm), `begin_checkout` (mở checkout), `purchase` (trang success của đơn đã xác nhận, mã đơn làm `transaction_id`, nhớ trong `localStorage` để tải lại không tính 2 lần)
- **Khi deploy:** điền `NEXT_PUBLIC_SENTRY_DSN` (+ `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` để có stack trace đọc được), `NEXT_PUBLIC_GA_ID`; bật Analytics trong dashboard Vercel (custom event cần gói Pro). Nếu đặt sau proxy / CDN khác Vercel, đảm bảo `x-forwarded-for` là IP thật của khách (rate limit dựa vào header này)

### 3.5 Test & CI
- [ ] Vitest: tính tổng giỏ, kiểm tra coupon, tồn kho
- [ ] Playwright: xem sản phẩm → thêm giỏ → checkout → thanh toán test
- [ ] GitHub Actions: lint, typecheck, test, build

---

## Nhật ký

| Ngày | Việc đã làm | Ghi chú |
|---|---|---|
| 27/09/2026 | Khảo sát app, lập roadmap | — |
| 27/09/2026 | Xong 1.1: model `Product` + variants, lớp `lib/data/products.ts`, xoá `shop-data.ts` / `product-data.ts` | Biến thể mock: mỗi màu × Small–X-Large; `home-data.ts` còn nội dung site (chuyển Sanity ở 1.3) |
| 28/09/2026 | 1.2: giỏ hàng Zustand persist (key `shopco-cart`, dòng theo SKU, chặn vượt tồn kho), Add to Cart, trang giỏ đọc từ store | Giỏ bắt đầu rỗng (bỏ 3 item mẫu); badge header đã duyệt (chấm đen tối giản) |
| 28/09/2026 | 1.3: Sanity (schema, GROQ + TypeGen, seed, lọc/sắp xếp/phân trang trên server, SanityLive + webhook) | Catalog còn 14 sp thật (bỏ ~98 bản sao mock); nav/footer/dress-style grid vẫn tĩnh; reviews tạm trong code tới 2.5 |
| 28/09/2026 | 1.4: trang `/checkout` (form liên hệ/địa chỉ/vận chuyển/thanh toán), Zod client + server action, server tính lại giá & kiểm kho từ Sanity | UI checkout dựng từ component sẵn có, chưa có Figma — cần duyệt; Place Order chưa tạo đơn (1.5) |
| 28/09/2026 | 1.5: Postgres + Drizzle, tạo đơn + giữ chỗ tồn kho, VNPay (URL ký, IPN, return), COD, trang success, email Resend | Đã test với DB thật: COD, VNPay giả lập callback (thành công / trùng / sai số tiền / sai chữ ký / huỷ), chặn bán vượt kho. Chưa test trừ kho Sanity & VNPay sandbox thật (thiếu token/credentials). Giá vẫn USD, quy đổi tạm sang VND cho VNPay tới 1.6 |
| 28/09/2026 | 1.6: VND (Sanity + seed, `formatPrice` vi-VN), UI / email / Zod tiếng Việt, form địa chỉ Tỉnh → Phường/Xã (34 tỉnh), SĐT VN, `vnp_Locale`, font hỗ trợ tiếng Việt | Test với DB thật: đơn COD #100001 (địa chỉ, SĐT chuẩn hoá, tổng 114.000₫), chặn phường sai tỉnh. Chưa test VNPay sandbox thật; chọn ngân hàng VNPay & MoMo để sau |
| 28/09/2026 | 1.6 (tuỳ chọn): MoMo (tạo payment, IPN, return, migration enum) + chọn hình thức VNPay (`vnp_BankCode`) ở checkout | Đã gọi sandbox MoMo thật (key test công khai) → nhận `payUrl`; kiểm chữ ký IPN / redirect, chặn sửa số tiền. Chưa chạy trọn luồng thanh toán bằng app MoMo Test |
| 28/09/2026 | Thêm key sandbox MoMo vào `.env.local`; thông báo checkout tự cuộn vào tầm nhìn; lên kế hoạch 2.8 (QR ngay trên site) | Trước đó bấm Đặt hàng không có phản hồi vì chưa có key cổng nào (lỗi hiện ở đầu trang, bị khuất) |
| 28/09/2026 | 2.1: Auth.js v5 + Drizzle (email/mật khẩu scrypt + Google), trang đăng nhập / đăng ký / quên & đặt lại mật khẩu, `proxy.ts` bảo vệ `/account/*`, icon Account, trang `/account` tạm | UI dựng từ component sẵn có, chưa có Figma — cần duyệt. Đã kiểm tra: các trang trả 200, `/account` → `/login?callbackUrl=...`, hash mật khẩu. Chưa chạy migration `0002_add_auth` và luồng đăng ký/đăng nhập thật (Docker/Postgres chưa bật) |
| 29/09/2026 | 2.2: trang tài khoản (thông tin cá nhân, đổi mật khẩu, lịch sử / chi tiết đơn, sổ địa chỉ), đơn gắn `user_id`, checkout tự điền địa chỉ mặc định, giỏ hàng lưu server + gộp khi đăng nhập | UI dựng từ component sẵn có, chưa có Figma — cần duyệt. Đã chạy migration 0002 + 0003; test với DB thật: các trang tài khoản khi đã đăng nhập, chặn xem đơn người khác, đơn khách chỉ hiện với email đã xác minh, gộp giỏ (1 + 2 = 3, không cộng trùng lần sau), chặn ghi giỏ của user khác |
| 29/09/2026 | 2.3: tìm kiếm `/shop?q=...` (form header desktop + mobile), GROQ `match` trên tên / danh mục / phong cách / thương hiệu / màu / tag, trường `tags` trong Studio, dịch từ khoá tiếng Việt sang slug, xếp hạng theo tên | Không thêm UI mới. Test trên dev server với dữ liệu Sanity thật: "stripe" → 3, "áo thun đen" → 5, "jeans xanh dương" → 2, "hoodie" + sắp xếp giá, "áo sơ mi" + danh mục, từ khoá không tồn tại → 0 kèm thông báo; `/shop` không có `q` giữ nguyên |
| 06/10/2026 | 2.4: bảng `coupons` + migration 0004, `applyPromo`, kiểm lại mã ở checkout, giữ lượt khi đặt đơn (advisory lock), form promo trong `OrderSummary`, script `pnpm coupon:create`; bỏ giảm cứng 20% | Không thêm UI mới (dòng giảm giá chỉ hiện khi có mã, lỗi dưới ô nhập, nút "Gỡ mã"). Test với DB + Sanity thật: % có trần, cố định không vượt tạm tính, chưa đủ tối thiểu / hết hạn / chưa bắt đầu / không tồn tại, đơn thất bại & đơn chờ quá 15 phút không tính lượt, 2 đơn tranh lượt cuối → 1 thành công. Chưa test trên trình duyệt (Playwright không cài được Chrome). Mã mẫu trong DB local: `SALE20`, `GIAM30K`, `HETHAN`, `SAPTOI` |
| 06/10/2026 | 2.5: bảng `reviews` + migration 0005, chỉ người đã mua được viết (1 đánh giá / sản phẩm, sửa được), server actions tải / kiểm quyền / gửi, nối sắp xếp / lọc sao / xem thêm / viết đánh giá, rating trung bình từ Postgres + đồng bộ sang Sanity, `pnpm reviews:sync` | 🎨 Form viết đánh giá dựng từ style sẵn có — cần duyệt. Test với DB + Sanity thật qua HTTP (gọi server action với phiên đăng nhập thật): khách → yêu cầu đăng nhập, user chưa mua / sản phẩm khác → từ chối, rating 0 / 9 & nội dung ngắn → lỗi, gửi → lưu + Sanity `bermuda` 4 (1), gửi lại → sửa thành 3 (1); 9 đánh giá: 4 kiểu sắp xếp, lọc 5★ → 3 / 1★ → 1, trang 2 → 3 còn lại, `pnpm reviews:sync bermuda` → 3.6 (9). Dữ liệu test đã xoá, `bermuda` về 0. Chưa xem trên trình duyệt; chưa chạy `pnpm reviews:sync` cho toàn bộ catalog |
| 06/10/2026 | 2.7: nav Khuyến mãi (`sale=1`) / Hàng mới về (`sort=newest`) / Thương hiệu (`/#brands`, logo → `brand=<slug>`), schema `page` + route `/[slug]` + 6 trang nội dung, footer trỏ route thật; `pnpm migrate:brands`, `pnpm seed:pages` (đã chạy) | 🎨 Trang nội dung dựng từ style sẵn có, chưa có Figma — cần duyệt; thêm option "Mới nhất" vào ô sắp xếp; footer đổi nhãn cột/link. Test trên dev server với Sanity thật: sale → 6 sp đang giảm, newest → `one-life` đầu tiên, `brand=gucci` → 2, `brand=zara&sale=1` → 2, thương hiệu không tồn tại → 0, 6 trang trả 200, slug lạ → 404, `/login` không bị ảnh hưởng. Chưa xem trên trình duyệt (thiếu Chrome cho Playwright) |
| 06/10/2026 | 2.6: trạng thái `shipped` + email "đang giao" (`pnpm order:ship`), gom gửi email vào `lib/email/send.ts`, newsletter double opt-in (bảng `newsletter_subscribers`, xác nhận / chào mừng / huỷ đăng ký one-click), honeypot + chặn gửi quá nhanh, rate limit Postgres (`lib/rate-limit.ts`), migration 0006 | Form newsletter giữ nguyên layout; chỉ thêm 1 dòng thông báo dưới nút (desktop nằm trong khoảng đệm, card vẫn cao 180px). Test với DB thật + trình duyệt Edge (Playwright qua `channel: "msedge"`): email sai / gửi quá nhanh / hợp lệ (lưu chữ thường, `pending`), link xác nhận dùng 1 lần, đã đăng ký / trong 60 giây không gửi lại, huỷ qua GET + POST, đăng ký lại giữ token huỷ, IP bị chặn ở lần thứ 6 kèm thông báo; CLI giao hàng: gửi email 1 lần, chạy lại chỉ cập nhật mã vận đơn, chặn chuyển trạng thái sai. Đơn #100001 đã trả về trạng thái cũ, dữ liệu test đã xoá |
| 06/10/2026 | 2.8: chuyển khoản VietQR qua payOS — `lib/payments/payos.ts`, migration 0007 (enum `payos`, `payments.transfer` / `expires_at`), webhook `/api/webhooks/payos`, trang `/order/[id]/pay` (QR, sao chép, đếm ngược, polling, hết hạn / đổi phương thức), lựa chọn mới ở checkout | 🎨 Trang `/pay` dựng từ style sẵn có, chưa có Figma — cần duyệt. Chưa có key payOS thật: test với mock API payOS (cùng thuật toán ký) + build production + Edge (Playwright `channel: "msedge"`): đặt hàng → trang QR; payOS báo PAID qua polling → success (đã trừ kho, gửi email); webhook sai chữ ký → 400, đúng → paid, gửi lại → không xử lý lần 2; sai số tiền → giữ chờ; quá hạn → `payment_failed` + nhả kho + màn hình hết hạn; đổi phương thức → huỷ + nhả kho, giỏ còn nguyên; `/success` của đơn chưa trả → về `/pay`; desktop + mobile 390px. Đơn test #100009–100015 còn trong DB local; tồn kho Sanity `GRADIENT-TEE-WHITE-M` đã cộng lại 2 |
| 06/10/2026 | 3.1: role `customer` / `staff` / `admin` (`pnpm user:role`), bảng `refunds` + `order_events` (migration 0008), `/admin` (đơn hàng: lọc / tìm / giao hàng / hoàn tất / huỷ + nhập lại kho / hoàn tiền / lịch sử; tồn kho; đánh giá), email cảnh báo sắp hết hàng, banner thông báo sửa trong Studio, Studio chia nhóm + danh sách Low stock; khách thấy mã vận đơn + số tiền đã hoàn | 🎨 `/admin` dựng từ style trang tài khoản — cần duyệt. Test với DB + Sanity thật (19 kiểm tra logic): trừ kho làm biến thể tụt ngưỡng → email cảnh báo, giao hàng gửi email 1 lần, hoàn tiền vượt tổng / vượt phần còn lại bị chặn, huỷ + nhập lại kho đưa tồn kho về đúng 22, chạy lại không cộng 2 lần, COD chỉ hoàn tiền được sau khi hoàn tất. HTTP (17): khách chưa đăng nhập → login, customer → 404, staff không thấy form hoàn tiền, tìm theo số / email / tên. Edge (Playwright `channel: "msedge"`, 11): giao hàng / hoàn tiền / huỷ / hoàn tất COD qua form, lỗi hiện đúng chỗ, mobile 390px không tràn ngang. Dữ liệu test đã xoá, tồn kho Sanity không đổi |
| 06/10/2026 | 3.2: wishlist — store `localStorage` + bảng `wishlist_items` (migration 0009), `WishlistSync` gộp khi đăng nhập / ghi khi thay đổi, icon tim trên card + trang sản phẩm, trang `/wishlist`, link trong tab tài khoản + footer | 🎨 Nút tim + trang `/wishlist` dựng từ style sẵn có, chưa có Figma — cần duyệt. Test Edge (Playwright `channel: "msedge"`, 19 kiểm tra) với DB + Sanity thật: bấm tim trên card không chuyển trang, lưu `localStorage`, reload giữ nguyên (mới nhất trước), tim trang sản phẩm đồng bộ với card, `/wishlist` hiện đúng 2 sản phẩm, slug không tồn tại bị loại, mobile 390px không tràn ngang; đăng ký → danh sách khách gắn vào tài khoản, xoá `localStorage` rồi tải lại → khôi phục từ DB, đăng xuất → xoá bản local. User test đã xoá |
| 06/10/2026 | 3.3: SEO — `app/sitemap.ts` + `app/robots.ts`, `lib/seo.ts` (metadata sản phẩm, OG / Twitter, JSON-LD `Product` / `BreadcrumbList` / `Organization` + `WebSite`), `metadataBase`, canonical, `noindex` cho giỏ / checkout / kết quả tìm kiếm | Không đổi giao diện. Test trên dev server với Sanity thật: `robots.txt` 200, `sitemap.xml` 24 URL (14 sản phẩm + 6 trang, có `lastmod`), `/product/gradient-tee` có canonical, OG / Twitter (2 ảnh), Product JSON-LD (145000 VND, InStock, Zara) + breadcrumb; `/doi-tra` OG `article` + breadcrumb; `/shop?q=hoodie` → `noindex, follow` |
| 06/10/2026 | 3.4: trang 404 / lỗi / đang tải (`components/feedback`), rate limit đăng nhập (trong `authorize`) / đăng ký / quên & đặt lại / đổi mật khẩu / mã giảm giá, Sentry (`@sentry/nextjs` 11, tắt khi không có DSN), Vercel Analytics + GA4 kèm sự kiện `add_to_cart` / `begin_checkout` / `purchase` | 🎨 Trang 404 / lỗi / skeleton dựng từ style sẵn có, chưa có Figma — cần duyệt. Test Edge (Playwright `channel: "msedge"`) với DB thật: 8 lần sai mật khẩu → "không đúng", lần 9 → bị chặn; 10 mã giảm giá sai → "không tồn tại", lần 11 → bị chặn; `/a/b/c`, `/khong-ton-tai`, `/product/khong-ton-tai` → 404 kèm header / footer, mobile 390px không tràn ngang. Phát hiện `loading.tsx` làm 404 thành 200 → bỏ ở trang sản phẩm / trang nội dung. `pnpm build` thành công. Chưa có DSN Sentry / GA ID thật nên chưa thấy sự kiện trên dashboard; chưa kích hoạt thử `error.tsx` trên trình duyệt. Bộ đếm rate limit của lần test đã xoá |
