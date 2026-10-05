import Link from "next/link";
import { PortableText, type PortableTextComponents } from "next-sanity";
import type { PAGE_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type Body = NonNullable<NonNullable<PAGE_BY_SLUG_QUERY_RESULT>["body"]>;

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-3 text-base leading-[22px] text-text-60">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 text-xl font-bold text-black xl:text-2xl">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 text-base font-bold text-black xl:text-xl">{children}</h3>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-base leading-[22px] text-text-60">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-base leading-[22px] text-text-60">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-medium text-black">{children}</strong>,
    link: ({ children, value }) => {
      const href: string = value?.href ?? "#";
      return href.startsWith("/") ? (
        <Link href={href} className="text-black underline">
          {children}
        </Link>
      ) : (
        <a href={href} className="text-black underline" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  },
};

export function PageBody({ value }: { value: Body }) {
  return (
    <div className="max-w-[760px] [&>*:first-child]:mt-0">
      <PortableText value={value} components={components} />
    </div>
  );
}
