const STAR_SRC: Record<number, string> = {
  5: "/icons/stars-50.svg",
  4.5: "/icons/stars-45.svg",
  3.5: "/icons/stars-35.svg",
  3: "/icons/stars-30.svg",
};

const STAR_WIDTH: Record<number, number> = {
  5: 113.7,
  4.5: 104,
  4: 89.9,
  3.5: 80.2,
  3: 66.09,
};

/** Star spacing and size in stars-50.svg, used to clip it for other ratings. */
const STAR_PITCH = 23.8;
const STAR_SIZE = 18.04;

function formatRating(value: number) {
  return value % 1 === 0 ? value.toFixed(1) : String(value);
}

/** Nearest half star, at least half a star. */
function toStars(value: number) {
  return Math.min(5, Math.max(0.5, Math.round(value * 2) / 2));
}

function clippedWidth(stars: number) {
  const full = Math.floor(stars);
  return stars % 1 === 0
    ? (full - 1) * STAR_PITCH + STAR_SIZE
    : full * STAR_PITCH + STAR_SIZE / 2;
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
  const starHeight = size === "review" ? 22.58 : 18.49;

  if (value <= 0) {
    return (
      <div className="flex items-center" style={{ minHeight: starHeight }}>
        <p className="text-sm leading-none whitespace-nowrap text-text-60">Chưa có đánh giá</p>
      </div>
    );
  }

  const stars = toStars(value);
  const src =
    size === "review"
      ? "/icons/stars-review.svg"
      : (STAR_SRC[stars] ?? "/icons/stars-50.svg");

  const starWidth =
    size === "review" ? 138.84 : (STAR_WIDTH[stars] ?? clippedWidth(stars));

  return (
    <div className="flex items-center gap-[13px]">
      <span
        className="relative inline-flex overflow-clip"
        style={{ height: starHeight, width: starWidth }}
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
