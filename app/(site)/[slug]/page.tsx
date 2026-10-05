import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ShopBreadcrumb } from "@/components/shop/ShopBreadcrumb";
import { PageBody } from "@/components/content/PageBody";
import { getAllPageSlugs, getPage } from "@/lib/data/pages";

export async function generateStaticParams() {
  const slugs = await getAllPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "SHOP.CO" };
  return {
    title: `${page.title} | SHOP.CO`,
    description: page.description ?? undefined,
  };
}

export default async function ContentPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <Container className="pb-20 xl:pb-[80px]">
      <hr className="border-line" />
      <div className="pt-5 xl:pt-6">
        <ShopBreadcrumb current={page.title} />
      </div>

      <h1 className="mt-2 font-display text-[32px] leading-none uppercase text-black xl:mt-6 xl:text-[40px]">
        {page.title}
      </h1>
      {page.description ? (
        <p className="mt-4 max-w-[760px] text-base leading-[22px] text-text-60">
          {page.description}
        </p>
      ) : null}

      {page.body ? (
        <div className="mt-6 xl:mt-8">
          <PageBody value={page.body} />
        </div>
      ) : null}
    </Container>
  );
}
