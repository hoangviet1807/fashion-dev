"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(site)/(auth)/actions";
import { useCartStore } from "@/lib/cart/store";

const LINKS = [
  { href: "/account", label: "Thông tin cá nhân" },
  { href: "/account/orders", label: "Đơn hàng" },
  { href: "/account/addresses", label: "Sổ địa chỉ" },
];

const PILL =
  "inline-flex h-10 shrink-0 items-center rounded-[62px] px-5 text-sm font-medium transition-colors xl:h-11 xl:text-base";

export function AccountNav() {
  const pathname = usePathname();

  async function signOut() {
    // The account cart stays in the database; drop the local copy before leaving.
    useCartStore.getState().detach();
    await logout();
  }

  return (
    <nav aria-label="Tài khoản" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 xl:mx-0 xl:px-0">
      {LINKS.map(({ href, label }) => {
        const active = href === "/account" ? pathname === href : pathname.startsWith(href);
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
      <form action={signOut} className="ml-auto shrink-0">
        <button type="submit" className={`${PILL} text-text-60 hover:text-black`}>
          Đăng xuất
        </button>
      </form>
    </nav>
  );
}
