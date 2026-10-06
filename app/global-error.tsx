"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import type { ErrorBoundaryProps } from "@/components/feedback/ErrorView";
import { Button, buttonClasses } from "@/components/ui/Button";
import { SITE_LOCALE } from "@/lib/locale";
import { bodyFont, displayFont } from "./fonts";
import "./globals.css";

/** Replaces the root layout when it (or the site shell) fails, so it has no header or footer. */
export default function GlobalError({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang={SITE_LOCALE} className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col items-center justify-center bg-white px-4 py-20 text-center font-sans text-black">
        <title>Đã có lỗi xảy ra | SHOP.CO</title>
        <p className="font-display text-[32px] leading-none text-black xl:text-[40px]">SHOP.CO</p>
        <h1 className="mt-8 text-2xl font-bold xl:text-[32px] xl:leading-none">Đã có lỗi xảy ra</h1>
        <p className="mt-3 max-w-[480px] text-base text-text-60">
          Trang chưa tải được do sự cố tạm thời. Vui lòng thử lại sau ít phút.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={retry} className="px-10">
            Thử lại
          </Button>
          {/* A full reload: the root layout itself may be what failed. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className={buttonClasses({ variant: "secondary", className: "px-10" })}>
            Về trang chủ
          </a>
        </div>
      </body>
    </html>
  );
}
