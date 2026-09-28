import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { NewsletterBanner } from "@/components/layout/NewsletterBanner";
import { Footer } from "@/components/layout/Footer";
import { CartSync } from "@/components/cart/CartSync";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartSync />
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <div className="relative mt-12 xl:mt-20">
        <NewsletterBanner />
        <Footer />
      </div>
    </>
  );
}
