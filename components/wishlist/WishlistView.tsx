"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { loadWishlistProducts } from "@/app/(site)/wishlist/actions";
import { ProductCard } from "@/components/product/ProductCard";
import { RevealGroup } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import type { ProductSummary } from "@/lib/types/product";
import { useWishlistHydrated, useWishlistStore } from "@/lib/wishlist/store";

/** `null` marks a slug whose product no longer exists. */
type Loaded = Record<string, ProductSummary | null>;

export function WishlistView({ signedIn }: { signedIn: boolean }) {
  const hydrated = useWishlistHydrated();
  const slugs = useWishlistStore((state) => state.slugs);
  const keepOnly = useWishlistStore((state) => state.keepOnly);
  const [loaded, setLoaded] = useState<Loaded>({});
  const [failed, setFailed] = useState(false);
  const requested = useRef(new Set<string>());

  const pending = slugs.filter((slug) => !(slug in loaded));

  useEffect(() => {
    if (!hydrated) return;
    const toLoad = slugs.filter((slug) => !(slug in loaded) && !requested.current.has(slug));
    if (toLoad.length === 0) return;
    toLoad.forEach((slug) => requested.current.add(slug));

    loadWishlistProducts(toLoad)
      .then((result) => {
        if (result.status !== "ok") throw new Error("Failed to load wishlist");
        const found = new Map(result.products.map((product) => [product.slug, product]));
        setLoaded((current) => {
          const next = { ...current };
          for (const slug of toLoad) next[slug] = found.get(slug) ?? null;
          return next;
        });
        const missing = toLoad.filter((slug) => !found.has(slug));
        if (missing.length > 0) {
          keepOnly(useWishlistStore.getState().slugs.filter((slug) => !missing.includes(slug)));
        }
      })
      .catch(() => {
        toLoad.forEach((slug) => requested.current.delete(slug));
        setFailed(true);
      });
  }, [hydrated, slugs, loaded, keepOnly]);

  const products = slugs.flatMap((slug) => loaded[slug] ?? []);

  if (failed && products.length === 0) {
    return (
      <p className="text-base text-text-60">
        Chưa tải được danh sách yêu thích. Vui lòng tải lại trang.
      </p>
    );
  }

  if (!hydrated || (products.length === 0 && pending.length > 0)) {
    return <p className="text-base text-text-60">Đang tải danh sách yêu thích…</p>;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[20px] border border-line px-5 py-16 text-center">
        <p className="text-base text-text-60">
          Chưa có sản phẩm nào. Bấm vào biểu tượng trái tim để lưu sản phẩm bạn thích.
        </p>
        <Button href="/shop" className="px-10">
          Mua sắm
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-text-60 xl:text-base">
        {products.length} sản phẩm
        {signedIn ? null : (
          <>
            {" · "}
            <Link
              href="/login?callbackUrl=%2Fwishlist"
              className="text-black underline underline-offset-2"
            >
              Đăng nhập
            </Link>{" "}
            để lưu danh sách trên mọi thiết bị
          </>
        )}
      </p>
      <RevealGroup
        stagger={0.06}
        className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} layout="grid" />
        ))}
      </RevealGroup>
    </div>
  );
}
