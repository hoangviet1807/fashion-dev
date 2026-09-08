import Link from "next/link";

export function Logo({
  className = "",
  size = "header",
}: {
  className?: string;
  size?: "header" | "footer";
}) {
  const sizes =
    size === "footer"
      ? "text-[25.2px] leading-none tracking-tight xl:text-[33.455px] xl:tracking-normal"
      : "text-[22px] leading-none tracking-tight xl:text-[32px] xl:tracking-normal";

  return (
    <Link
      href="/"
      className={`font-display shrink-0 text-black ${sizes} ${className}`}
    >
      SHOP.CO
    </Link>
  );
}
