import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";
import { AccountNav } from "@/components/account/AccountNav";
import { getSessionRole } from "@/lib/admin/auth";
import { isStaff } from "@/lib/admin/roles";

export const metadata: Metadata = {
  title: "Tài khoản | SHOP.CO",
  robots: { index: false, follow: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionRole();

  return (
    <Container className="pb-20 xl:pb-[80px]">
      <hr className="border-line" />
      <div className="pt-5 xl:pt-6">
        <ShopBreadcrumb current="Tài khoản" />
      </div>

      <h1 className="mt-2 font-display text-[32px] leading-none uppercase text-black xl:mt-6 xl:text-[40px]">
        Tài khoản
      </h1>

      <div className="mt-5 xl:mt-6">
        <AccountNav showAdmin={isStaff(user?.role)} />
      </div>

      <div className="mt-5 xl:mt-6">{children}</div>
    </Container>
  );
}
