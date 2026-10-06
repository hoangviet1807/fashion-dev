"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/Button";
import { StatusView } from "./StatusView";

export type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

const MESSAGE =
  "Trang chưa tải được do sự cố tạm thời. Vui lòng thử lại — nếu vẫn không được, hãy quay lại sau ít phút.";

function useReportError(error: ErrorBoundaryProps["error"]) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error(error);
  }, [error]);
}

/** Whole-page error for route segments outside the account / admin layouts. */
export function ErrorView({ error, retry }: ErrorBoundaryProps) {
  useReportError(error);
  return (
    <StatusView crumb="Lỗi" title="Đã có lỗi xảy ra" message={MESSAGE}>
      <Button onClick={retry} className="px-10">
        Thử lại
      </Button>
      <Button href="/" variant="secondary" className="px-10">
        Về trang chủ
      </Button>
    </StatusView>
  );
}

/** Error inside a layout that keeps its own header and tabs (account, admin). */
export function ErrorPanel({ error, retry }: ErrorBoundaryProps) {
  useReportError(error);
  return (
    <div className="rounded-[20px] border border-line px-4 py-5 xl:px-6 xl:py-6">
      <h2 className="text-xl font-bold xl:text-2xl">Đã có lỗi xảy ra</h2>
      <p className="mt-2 text-base text-text-60">{MESSAGE}</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button onClick={retry} className="px-10">
          Thử lại
        </Button>
      </div>
    </div>
  );
}
