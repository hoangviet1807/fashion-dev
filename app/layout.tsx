import type { Metadata } from "next";
import { satoshi, integral } from "./fonts";
import { SiteShell } from "@/components/layout/SiteShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHOP.CO",
  description:
    "Find clothes that match your style. Shop new arrivals, top selling pieces, and more at SHOP.CO.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${integral.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-white font-sans text-black">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
