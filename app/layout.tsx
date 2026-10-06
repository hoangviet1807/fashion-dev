import type { Metadata } from "next";
import { SITE_LOCALE } from "@/lib/locale";
import { BASE_OPEN_GRAPH, SITE_NAME } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";
import { bodyFont, displayFont } from "./fonts";
import "./globals.css";

const description =
  "Tìm trang phục hợp với phong cách của bạn. Mua sắm hàng mới về, sản phẩm bán chạy và nhiều hơn nữa tại SHOP.CO.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: SITE_NAME,
  description,
  openGraph: { ...BASE_OPEN_GRAPH, type: "website", title: SITE_NAME, description },
  twitter: { card: "summary_large_image", title: SITE_NAME, description },
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
