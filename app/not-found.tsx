import type { Metadata } from "next";
import { NotFoundView } from "@/components/feedback/NotFoundView";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Không tìm thấy trang | SHOP.CO",
  robots: { index: false, follow: true },
};

/** URLs that match no route render outside `(site)`, so the shell is added here. */
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundView />
    </SiteShell>
  );
}
