"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PaginationBar } from "@/components/shop/PaginationBar";

/** `PaginationBar` driven by the `page` search param. */
export function AdminPagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function onPage(next: number) {
    const params = new URLSearchParams(searchParams);
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="mt-5 xl:mt-6">
      <PaginationBar page={page} totalPages={totalPages} onPage={onPage} />
    </div>
  );
}
