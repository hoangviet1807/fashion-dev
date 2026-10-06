"use client";

import { useIsWishlisted, useWishlistStore } from "@/lib/wishlist/store";

const VARIANTS = {
  card: "absolute top-3 right-3 z-10 size-9 bg-white shadow-[0_4px_12px_-6px_rgb(0_0_0/0.35)] xl:top-4 xl:right-4 xl:size-10",
  detail: "size-[44px] shrink-0 border border-line hover:border-black xl:size-[52px]",
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-[18px] xl:size-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
    >
      <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.1 3.6 4.5 7.1 4.5c2 0 3.5 1.1 4.9 2.9 1.4-1.8 2.9-2.9 4.9-2.9 3.5 0 5.6 3.6 4.4 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" />
    </svg>
  );
}

export function WishlistButton({
  slug,
  name,
  variant,
}: {
  slug: string;
  name: string;
  variant: keyof typeof VARIANTS;
}) {
  const saved = useIsWishlisted(slug);
  const toggle = useWishlistStore((state) => state.toggle);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Bỏ ${name} khỏi danh sách yêu thích` : `Thêm ${name} vào danh sách yêu thích`}
      onClick={() => toggle(slug)}
      className={`inline-flex items-center justify-center rounded-full text-black transition-[border-color,transform] duration-200 active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100 ${VARIANTS[variant]}`}
    >
      <HeartIcon filled={saved} />
    </button>
  );
}
