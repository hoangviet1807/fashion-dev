"use client";

import { useState, useTransition } from "react";
import { deleteReview } from "@/app/(site)/admin/actions";

export function DeleteReviewButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (!window.confirm("Xoá đánh giá này? Điểm trung bình của sản phẩm sẽ được tính lại.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteReview(id).catch(() => null);
      if (!result || result.status !== "saved") {
        setError(result && "message" in result && result.message ? result.message : "Không xoá được. Vui lòng thử lại.");
      }
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-start gap-1 md:items-end">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex h-10 items-center rounded-[62px] border border-line px-5 text-sm font-medium text-discount transition-colors hover:bg-discount-bg disabled:opacity-50"
      >
        {pending ? "Đang xoá…" : "Xoá"}
      </button>
      {error ? <p className="text-sm text-discount">{error}</p> : null}
    </div>
  );
}
