import Image from "next/image";
import Link from "next/link";
import { dressStyles } from "@/lib/home-data";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

function StyleTile({
  name,
  image,
  href,
  className = "",
  mirrored = false,
}: {
  name: string;
  image: string;
  href: string;
  className?: string;
  /** Flips a photo whose subject stands on the left, so the label doesn't cover the face. */
  mirrored?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-[20px] bg-white ${className}`}
    >
      <span className={`absolute inset-0 ${mirrored ? "-scale-x-100" : ""}`}>
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 1280px) 100vw, 684px"
          className={`object-contain transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
            mirrored ? "object-left-top" : "object-top lg:ml-[20%]"
          }`}
        />
      </span>
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
        <Reveal className="rounded-[20px] bg-muted px-6 py-10 xl:rounded-[40px] xl:px-16 xl:py-[70px]">
          <SectionHeading className="mb-7 xl:mb-[64px]">
            MUA SẮM THEO PHONG CÁCH
          </SectionHeading>
          <RevealGroup delay={0.15} className="flex flex-col gap-4 md:hidden">
            {dressStyles.map((style) => (
              <RevealItem key={style.id}>
                <StyleTile
                  name={style.name}
                  image={style.image}
                  href={style.href}
                  mirrored={style.mirrored}
                  className="h-[190px]"
                />
              </RevealItem>
            ))}
          </RevealGroup>
          <RevealGroup delay={0.15} stagger={0.12} className="hidden flex-col gap-5 md:flex">
            <RevealItem className="flex gap-5">
              <StyleTile
                name={casual.name}
                image={casual.image}
                href={casual.href}
                mirrored={casual.mirrored}
                className="h-[190px] w-full md:w-1/2 xl:h-[289px] xl:w-[407px] xl:shrink-0"
              />
              <StyleTile
                name={formal.name}
                image={formal.image}
                href={formal.href}
                className="h-[190px] w-full md:w-1/2 xl:h-[289px] xl:flex-1"
              />
            </RevealItem>
            <RevealItem className="flex gap-5">
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
            </RevealItem>
          </RevealGroup>
        </Reveal>
      </Container>
    </section>
  );
}
