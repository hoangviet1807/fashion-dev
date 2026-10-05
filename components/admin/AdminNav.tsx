"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/orders", label: "Đơn hàng" },
  { href: "/admin/inventory", label: "Tồn kho" },
  { href: "/admin/reviews", label: "Đánh giá" },
];

const PILL =
  "inline-flex h-10 shrink-0 items-center rounded-[62px] px-5 text-sm font-medium transition-colors xl:h-11 xl:text-base";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Quản trị" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 xl:mx-0 xl:px-0">
      {LINKS.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${PILL} ${active ? "bg-black text-white" : "border border-line text-black hover:bg-black/[0.04]"}`}
          >
            {label}
          </Link>
        );
      })}
      <a
        href="/studio"
        target="_blank"
        rel="noreferrer"
        className={`${PILL} border border-line text-black hover:bg-black/[0.04]`}
      >
        Sản phẩm & nội dung (Studio) ↗
      </a>
      <Link href="/account" className={`${PILL} ml-auto text-text-60 hover:text-black`}>
        Về tài khoản
      </Link>
    </nav>
  );
}
