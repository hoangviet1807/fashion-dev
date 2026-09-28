import { Container } from "@/components/layout/Container";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";

export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="pb-20 xl:pb-[80px]">
      <hr className="border-line" />
      <div className="pt-5 xl:pt-6">
        <ShopBreadcrumb current={title} />
      </div>

      <div className="mx-auto mt-6 w-full max-w-[500px] xl:mt-10">
        <h1 className="font-display text-[32px] leading-none uppercase text-black xl:text-[40px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-sm text-text-60 xl:text-base">{description}</p>
        ) : null}
        <div className="mt-5 rounded-[20px] border border-line p-5 xl:mt-6 xl:px-6">{children}</div>
      </div>
    </Container>
  );
}
