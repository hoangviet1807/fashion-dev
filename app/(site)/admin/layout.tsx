import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";
import { AdminNav } from "@/components/admin/AdminNav";
import { requirePermission } from "@/lib/admin/auth";
import { ROLE_LABELS } from "@/lib/admin/roles";

export const metadata: Metadata = {
  title: "Quản trị | SHOP.CO",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePermission("orders:view", "/admin");

  return (
    <Container className="pb-20 xl:pb-[80px]">
      <hr className="border-line" />
      <div className="pt-5 xl:pt-6">
        <ShopBreadcrumb current="Quản trị" />
      </div>

      <div className="mt-2 flex flex-col gap-1 md:flex-row md:items-end md:justify-between xl:mt-6">
        <h1 className="font-display text-[32px] leading-none uppercase text-black xl:text-[40px]">
          Quản trị
        </h1>
        <p className="text-sm text-text-60 xl:text-base">
          {user.name ?? user.email} · {ROLE_LABELS[user.role]}
        </p>
      </div>

      <div className="mt-5 xl:mt-6">
        <AdminNav />
      </div>

      <div className="mt-5 xl:mt-6">{children}</div>
    </Container>
  );
}
