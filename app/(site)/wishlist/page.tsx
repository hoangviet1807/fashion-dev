import type { Metadata } from "next";
import { auth } from "@/auth";
import { Container } from "@/components/layout/Container";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "Yêu thích | SHOP.CO",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const session = await auth();

  return (
    <Container className="pb-20 xl:pb-[80px]">
      <hr className="border-line" />
      <div className="pt-5 xl:pt-6">
        <ShopBreadcrumb current="Yêu thích" />
      </div>

      <h1 className="mt-2 font-display text-[32px] leading-none uppercase text-black xl:mt-6 xl:text-[40px]">
        Yêu thích
      </h1>

      <div className="mt-5 xl:mt-6">
        <WishlistView signedIn={Boolean(session?.user?.id)} />
      </div>
    </Container>
  );
}
