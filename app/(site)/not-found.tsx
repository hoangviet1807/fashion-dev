import type { Metadata } from "next";
import { NotFoundView } from "@/components/feedback/NotFoundView";

export const metadata: Metadata = {
  title: "Không tìm thấy trang | SHOP.CO",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView />;
}
