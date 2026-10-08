import { Analytics } from "@/components/analytics/Analytics";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { NewsletterBanner } from "@/components/layout/NewsletterBanner";
import { Footer } from "@/components/layout/Footer";
import { AddedToCartToast } from "@/components/cart/AddedToCartToast";
import { CartSync } from "@/components/cart/CartSync";
import { WishlistSync } from "@/components/wishlist/WishlistSync";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { getAnnouncement } from "@/lib/data/content";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const announcement = await getAnnouncement();

  return (
    <MotionProvider>
      <ScrollToTop />
      <CartSync />
      <WishlistSync />
      {announcement ? <AnnouncementBar {...announcement} /> : null}
      <Header />
      <main className="flex-1">{children}</main>
      <div className="relative mt-12 xl:mt-20">
        <NewsletterBanner />
        <Footer />
      </div>
      <AddedToCartToast />
      <Analytics />
    </MotionProvider>
  );
}
