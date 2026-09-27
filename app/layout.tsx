import type { Metadata } from "next";
import { SITE_LOCALE } from "@/lib/locale";
import { bodyFont, displayFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHOP.CO",
  description:
    "Tìm trang phục hợp với phong cách của bạn. Mua sắm hàng mới về, sản phẩm bán chạy và nhiều hơn nữa tại SHOP.CO.",
  openGraph: { locale: "vi_VN", siteName: "SHOP.CO" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={SITE_LOCALE}
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-white font-sans text-black">
        {children}
      </body>
    </html>
  );
}
