const STAR_SRC: Record<number, string> = {
  5: "/icons/stars-50.svg",
  4.5: "/icons/stars-45.svg",
  3.5: "/icons/stars-35.svg",
  3: "/icons/stars-30.svg",
};

function formatRating(value: number) {
  return value % 1 === 0 ? value.toFixed(1) : String(value);
}

export function Rating({
  value,
  size = "product",
  showValue = size === "product",
}: {
  value: number;
  size?: "product" | "review";
  showValue?: boolean;
}) {
  const src =
    size === "review"
      ? "/icons/stars-review.svg"
      : (STAR_SRC[value] ?? "/icons/stars-50.svg");

  const starHeight = size === "review" ? 22.58 : 18.49;
  const starWidth =
    size === "review"
      ? 138.84
      : value === 5
        ? 113.7
        : value === 4.5
          ? 104
          : value === 4
            ? 89.9
            : value === 3.5
              ? 80.2
              : value === 3
                ? 66.09
                : 104;

  const clipFour =
    size === "product" && value === 4
      ? { width: 89.9, overflow: "hidden" as const }
      : undefined;

  return (
    <div className="flex items-center gap-[13px]">
      <span
        className="relative inline-flex overflow-clip"
        style={{
          height: starHeight,
          width: clipFour ? clipFour.width : starWidth,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={size === "review" ? 139 : 114}
          height={starHeight}
          className="max-w-none"
          style={{ height: starHeight, width: size === "review" ? 138.84 : 113.7 }}
        />
      </span>
      {showValue ? (
        <p className="text-sm leading-none whitespace-nowrap">
          {formatRating(value)}
          <span className="text-text-60">/5</span>
        </p>
      ) : null}
    </div>
  );
}
