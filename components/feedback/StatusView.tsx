import { Container } from "@/components/layout/Container";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";

/** Full-page message (404, errors) laid out like the cart and order pages. */
export function StatusView({
  crumb,
  title,
  message,
  children,
}: {
  crumb: string;
  title: string;
  message: string;
  /** Action buttons. */
  children?: React.ReactNode;
}) {
  return (
    <Container className="pb-20 xl:pb-[80px]">
      <hr className="border-line" />
      <div className="pt-5 xl:pt-6">
        <ShopBreadcrumb current={crumb} />
      </div>

      <h1 className="mt-2 font-display text-[32px] leading-none uppercase text-black xl:mt-6 xl:text-[40px]">
        {title}
      </h1>
      <p className="mt-3 max-w-[640px] text-base text-text-60 xl:mt-4">{message}</p>

      {children ? (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row xl:mt-8">{children}</div>
      ) : null}
    </Container>
  );
}
