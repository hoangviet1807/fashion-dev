import Image from "next/image";
import Link from "next/link";
import { dressStyles } from "@/lib/home-data";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

function StyleTile({
  name,
  image,
  href,
  className = "",
}: {
  name: string;
  image: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative block overflow-hidden rounded-[20px] bg-white ${className}`}
    >
      <Image
        src={image}
        alt={name}
        fill
        sizes="(max-width: 1280px) 100vw, 684px"
        className="object-contain object-top lg:ml-[20%]"
      />
      <span className="absolute top-4 left-6 text-[24px] font-bold xl:top-6 xl:left-9 xl:text-[36px]">
        {name}
      </span>
    </Link>
  );
}

export function DressStyleGrid() {
  const [casual, formal, party, gym] = dressStyles;

  return (
    <section className="pt-12 xl:pt-[80px]">
      <Container>
        <div className="rounded-[20px] bg-muted px-6 py-10 xl:rounded-[40px] xl:px-16 xl:py-[70px]">
          <SectionHeading className="mb-7 xl:mb-[64px]">
            BROWSE BY dress STYLE
          </SectionHeading>
          <div className="flex flex-col gap-4 md:hidden">
            {dressStyles.map((style) => (
              <StyleTile
                key={style.id}
                name={style.name}
                image={style.image}
                href={style.href}
                className="h-[190px]"
              />
            ))}
          </div>
          <div className="hidden flex-col gap-5 md:flex">
            <div className="flex gap-5">
              <StyleTile
                name={casual.name}
                image={casual.image}
                href={casual.href}
                className="h-[190px] w-full md:w-1/2 xl:h-[289px] xl:w-[407px] xl:shrink-0"
              />
              <StyleTile
                name={formal.name}
                image={formal.image}
                href={formal.href}
                className="h-[190px] w-full md:w-1/2 xl:h-[289px] xl:flex-1"
              />
            </div>
            <div className="flex gap-5">
              <StyleTile
                name={party.name}
                image={party.image}
                href={party.href}
                className="h-[190px] w-full md:w-1/2 xl:h-[289px] xl:flex-1"
              />
              <StyleTile
                name={gym.name}
                image={gym.image}
                href={gym.href}
                className="h-[190px] w-full md:w-1/2 xl:h-[289px] xl:w-[407px] xl:shrink-0"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
