# Roadmap — Web bán quần áo hoàn chỉnh

> Đánh dấu `[x]` khi hoàn thành. Cập nhật cột **Trạng thái** trong bảng tổng quan.
> Nguyên tắc: giữ nguyên UI đã duyệt; mọi UI mới (🎨) cần xác nhận trước khi làm.

## Tổng quan

| Giai đoạn | Nội dung | Ước lượng | Trạng thái |
|---|---|---|---|
| 1 | Luồng mua hàng cơ bản | 6–10 ngày | ✅ Xong |
| 2 | Tài khoản & trải nghiệm | 5–7 ngày | ⬜ Chưa bắt đầu |
| 3 | Vận hành & hoàn thiện | 5+ ngày | ⬜ Chưa bắt đầu |

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
- [ ] Search (`components/layout/Header.tsx`)
- [x] Go to Checkout (`components/cart/OrderSummary.tsx`)
- [ ] Promo code (luôn giảm cứng 20% — `lib/cart-data.ts`)
- [ ] Newsletter (`components/layout/NewsletterBanner.tsx`)
- [ ] Icon Account (link `#account`)
- [ ] Reviews: Write / Load More / Sort (`components/product/ProductTabs.tsx`)
- [ ] Link nav On Sale / New Arrivals / Brands, link footer
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

### 2.1 🎨 Đăng nhập
- [ ] Auth.js + Drizzle adapter (email/mật khẩu + Google)
- [ ] Trang `/login`, `/register`, `/forgot-password`
- [ ] `proxy.ts` bảo vệ `/account/*`
- [ ] Nối icon Account trong header

### 2.2 🎨 Trang tài khoản
- [ ] `/account` — thông tin cá nhân
- [ ] `/account/orders`, `/account/orders/[id]` — lịch sử & trạng thái đơn
- [ ] `/account/addresses` — sổ địa chỉ
- [ ] Gộp giỏ `localStorage` vào giỏ server khi đăng nhập

### 2.3 Tìm kiếm
- [ ] Nối form search (desktop + mobile) tới `/shop?q=...`
- [ ] Tìm theo tên / danh mục / tag bằng GROQ `match`
- [ ] (Tuỳ chọn) Algolia / Meilisearch

### 2.4 Mã giảm giá
- [ ] Bảng `coupons` (phần trăm / cố định, đơn tối thiểu, hạn dùng, số lượt)
- [ ] Server action `applyPromo`; bỏ giảm cứng 20% trong `lib/cart-data.ts`
- [ ] Nối form promo trong `OrderSummary.tsx`

### 2.5 Reviews
- [ ] Bảng `reviews` (chỉ người đã mua mới được viết)
- [ ] Nối Write a Review / Load More / Sort trong `ProductTabs.tsx`
- [ ] Rating trung bình tính từ dữ liệu thật

### 2.6 Email & newsletter
- [ ] Email xác nhận đơn, đang giao, reset mật khẩu
- [ ] Newsletter lưu email + chống spam + rate limit

### 2.7 Sửa link chết
- [ ] On Sale → `/shop?sale=1`
- [ ] New Arrivals → `/shop?sort=newest`
- [ ] Brands → `/brands` hoặc bộ lọc thương hiệu
- [ ] Trang nội dung từ Sanity (`app/[slug]/page.tsx`): About, FAQ, Shipping, Returns, Privacy, Terms
- [ ] Cập nhật link footer

### 2.8 🎨 Thanh toán QR ngay trên site
Hiện VNPay / MoMo chuyển khách sang trang của cổng để quét QR. Mục tiêu: sau khi bấm Đặt hàng, hiện mã QR ngay trong app và tự chuyển sang trang thành công khi nhận tiền.
- [ ] Chốt cách làm: chuyển khoản VietQR qua payOS / SePay (tiền vào thẳng tài khoản ngân hàng, phí thấp, khách quét bằng mọi app ngân hàng) hay QR MoMo `qrCodeUrl` (production cần MoMo cấp quyền)
- [ ] Nhà cung cấp mới trong `lib/payments/` (tạo link / QR, kiểm chữ ký webhook) + thêm giá trị vào enum `payment_method` (migration)
- [ ] Webhook nhận tiền → dùng lại xử lý chung ở `lib/orders/payments.ts` (đối chiếu số tiền, idempotent, trừ kho, gửi email)
- [ ] 🎨 Trang `/order/[id]/pay`: mã QR, số tiền, nội dung chuyển khoản, số tài khoản, đồng hồ đếm ngược 15 phút (khớp giữ chỗ tồn kho); cần UI được duyệt
- [ ] Trang tự kiểm tra trạng thái đơn (polling hoặc SSE) → chuyển tới `/order/[id]/success` khi đã thanh toán; hết hạn → nhả giữ chỗ, cho đặt lại
- [ ] Thêm lựa chọn "Chuyển khoản ngân hàng (VietQR)" ở checkout
- **Trước khi làm:** điền key sandbox VNPay (`VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`) để test cả hai cổng hiện có; `.env.local` mới có key sandbox MoMo công khai.

---

## Giai đoạn 3 — Vận hành & hoàn thiện

### 3.1 Admin
- [ ] Sản phẩm / nội dung / banner qua Sanity Studio
- [ ] 🎨 `/admin` (phân quyền theo role): danh sách đơn, đổi trạng thái, mã vận đơn, hoàn tiền
- [ ] Cảnh báo sắp hết hàng

### 3.2 🎨 Wishlist
- [ ] `localStorage` cho khách, lưu DB khi đã đăng nhập
- [ ] Icon tim trên card / trang sản phẩm

### 3.3 SEO
- [ ] `app/sitemap.ts` (sinh từ Sanity)
- [ ] `app/robots.ts`
- [ ] Open Graph + Twitter card cho sản phẩm
- [ ] JSON-LD: `Product`, `BreadcrumbList`, `Organization`
- [ ] URL sản phẩm dùng slug

### 3.4 Độ ổn định
- [ ] `not-found.tsx`, `error.tsx`, `loading.tsx` cho từng route
- [ ] Rate limiting (login, newsletter, promo)
- [ ] Sentry (theo dõi lỗi)
- [ ] Analytics (Vercel Analytics / GA4)

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
