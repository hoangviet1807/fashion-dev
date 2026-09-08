import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function ShopBreadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-base">
      <Link href="/" className="text-text-60">
        Home
      </Link>
      <span className="relative size-4 rotate-[-90deg] overflow-clip">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/chevron.svg"
          alt=""
          width={16}
          height={16}
          className="size-full"
        />
      </span>
      <span className="text-black">{current}</span>
    </nav>
  );
}

export function Chevron({
  direction = "down",
  size = 16,
}: {
  direction?: "down" | "up" | "right";
  size?: number;
}) {
  const rotate =
    direction === "up" ? "rotate-180" : direction === "right" ? "-rotate-90" : "";

  return (
    <Icon
      src="/icons/chevron.svg"
      size={size}
      className={rotate}
    />
  );
}
