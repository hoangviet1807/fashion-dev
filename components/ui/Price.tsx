export function Price({
  price,
  originalPrice,
  discount,
  size = "card",
}: {
  price: number;
  originalPrice?: number;
  discount?: number;
  size?: "card" | "detail";
}) {
  const amount =
    size === "detail"
      ? "text-2xl font-bold leading-none xl:text-[32px]"
      : "text-xl font-bold leading-none xl:text-2xl";

  return (
    <div className="flex items-center gap-2.5">
      <span className={amount}>${price}</span>
      {originalPrice ? (
        <span className={`${amount} text-text-40 line-through`}>
          ${originalPrice}
        </span>
      ) : null}
      {discount ? (
        <span
          className={`inline-flex items-center justify-center rounded-[62px] bg-discount-bg font-medium text-discount ${
            size === "detail"
              ? "h-7 px-3.5 py-1.5 text-base xl:h-[34px] xl:text-base"
              : "h-5 w-[42px] px-2 text-[10px] xl:h-7 xl:w-[58px] xl:px-3.5 xl:py-1.5 xl:text-xs"
          }`}
        >
          -{discount}%
        </span>
      ) : null}
    </div>
  );
}
