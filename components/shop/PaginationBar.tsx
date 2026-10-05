const STEP =
  "inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3.5 text-sm font-medium transition-[background-color,border-color,transform] duration-150 hover:border-black/30 hover:bg-black/[0.03] active:scale-[0.97] disabled:opacity-40 disabled:hover:border-line disabled:hover:bg-transparent xl:h-10";

function getPaginationItems(
  page: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 1) return [1];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);

  for (let i = page - 1; i <= page + 1; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }

  if (page <= 3) {
    [2, 3, 4, 5].forEach((value) => {
      if (value <= totalPages) pages.add(value);
    });
  }

  if (page >= totalPages - 2) {
    [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach(
      (value) => {
        if (value >= 1) pages.add(value);
      },
    );
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];

  for (let index = 0; index < sorted.length; index++) {
    const current = sorted[index];
    const previous = sorted[index - 1];
    if (index > 0 && current - previous > 1) {
      items.push("ellipsis");
    }
    items.push(current);
  }

  return items;
}

export function PaginationBar({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  const items = getPaginationItems(page, totalPages);

  return (
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page <= 1}
        className={`group/prev ${STEP}`}
      >
        <span className="relative size-5 rotate-90 overflow-clip transition-transform duration-200 group-hover/prev:-translate-x-0.5 motion-reduce:transition-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/arrow-left.svg" alt="" width={20} height={20} className="size-full" />
        </span>
        Trước
      </button>

      <div className="flex items-center">
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`e-${index}`}
              className="inline-flex size-9 items-center justify-center text-sm font-medium text-text-40 xl:size-10"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPage(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Trang ${item}`}
              className={`inline-flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-[background-color,color,transform] duration-150 active:scale-95 xl:size-10 ${
                item === page ? "bg-muted text-black" : "text-text-40 hover:bg-black/[0.04] hover:text-black"
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className={`group/next ${STEP}`}
      >
        Sau
        <span className="relative size-5 -rotate-90 overflow-clip transition-transform duration-200 group-hover/next:translate-x-0.5 motion-reduce:transition-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/arrow-right.svg" alt="" width={20} height={20} className="size-full" />
        </span>
      </button>
    </div>
  );
}
