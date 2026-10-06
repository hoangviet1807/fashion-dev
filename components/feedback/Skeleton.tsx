import { Container } from "@/components/layout/Container";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-[20px] bg-muted motion-reduce:animate-none ${className}`}
    />
  );
}

function LoadingRegion({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Đang tải…</span>
      {children}
    </div>
  );
}

/** Content blocks for segments whose layout already renders the page header. */
export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <LoadingRegion>
      <div className="flex flex-col gap-4">
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className="h-[120px] xl:h-[140px]" />
        ))}
      </div>
    </LoadingRegion>
  );
}

/** Breadcrumb, heading and content blocks, for standalone pages. */
export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Container className="pb-20 xl:pb-[80px]">
      <hr className="border-line" />
      <LoadingRegion>
        <Skeleton className="mt-5 h-6 w-48 rounded-full xl:mt-6" />
        <Skeleton className="mt-2 h-8 w-2/3 max-w-[420px] rounded-full xl:mt-6 xl:h-10" />
        <div className="mt-5 flex flex-col gap-4 xl:mt-6">
          {Array.from({ length: rows }, (_, index) => (
            <Skeleton key={index} className="h-[120px] xl:h-[160px]" />
          ))}
        </div>
      </LoadingRegion>
    </Container>
  );
}

function CardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col">
      <Skeleton className="aspect-square xl:aspect-auto xl:h-[298px]" />
      <Skeleton className="mt-2.5 h-5 w-3/4 rounded-full xl:mt-4 xl:h-6" />
      <Skeleton className="mt-2 h-4 w-1/2 rounded-full" />
      <Skeleton className="mt-2 h-6 w-1/3 rounded-full xl:h-7" />
    </div>
  );
}

/** Mirrors `ShopListing`: filter sidebar from `lg`, 2 / 3 column grid. */
export function ShopSkeleton() {
  return (
    <Container>
      <hr className="border-line" />
      <LoadingRegion>
        <Skeleton className="mt-5 mb-2 h-6 w-48 rounded-full xl:mt-6" />
        <div className="flex items-start gap-5 pt-2 pb-12 xl:pt-4 xl:pb-16">
          <Skeleton className="hidden h-[900px] w-[295px] shrink-0 lg:block" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-8 w-56 rounded-full" />
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
              {Array.from({ length: 9 }, (_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </LoadingRegion>
    </Container>
  );
}
