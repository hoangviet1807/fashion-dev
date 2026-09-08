import Image from "next/image";
import { Button } from "@/components/ui/Button";

const stats = [
  { value: "200+", label: "International Brands" },
  { value: "2,000+", label: "High-Quality Products" },
  { value: "30,000+", label: "Happy Customers" },
];

export function Hero() {
  return (
    <section className="bg-hero">
      <div className="mx-auto flex max-w-[1440px] flex-col xl:flex-row xl:items-stretch">
        <div className="flex flex-col px-4 pt-10 pb-7 xl:w-[640px] xl:shrink-0 xl:px-0 xl:pt-[103px] xl:pr-8 xl:pb-[116px] xl:pl-[100px]">
          <h1 className="font-display max-w-[315px] text-[36px] leading-9 text-black xl:max-w-[577px] xl:text-[64px] xl:leading-[64px]">
            FIND CLOTHES THAT MATCHES YOUR STYLE
          </h1>
          <p className="mt-4 max-w-[545px] text-sm leading-[22px] text-text-60 xl:mt-8 xl:text-base">
            Browse through our diverse range of meticulously crafted garments,
            designed to bring out your individuality and cater to your sense of
            style.
          </p>
          <Button href="/shop" className="mt-6 w-full xl:mt-8 xl:w-[210px]">
            Shop Now
          </Button>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-y-3 xl:mt-12 xl:flex-nowrap xl:justify-start xl:gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex items-start">
                {index > 0 ? (
                  <span className="mx-4 hidden h-[52px] w-px bg-line xl:mx-0 xl:mr-8 xl:block xl:h-[74px]" />
                ) : null}
                {index === 1 ? (
                  <span className="mr-4 h-[52px] w-px bg-line xl:hidden" />
                ) : null}
                <div
                  className={
                    index === 2
                      ? "basis-full text-center xl:basis-auto xl:text-left"
                      : ""
                  }
                >
                  <p className="text-[24px] font-bold leading-none xl:text-[36px]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs leading-[22px] text-text-60 xl:text-base">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-auto h-[448px] w-full overflow-hidden xl:h-[663px] xl:min-w-0 xl:flex-1">
          <Image
            src="/images/hero.png"
            alt="Models wearing Shop.co outfits"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 720px"
            className="object-cover object-[center_20%]"
          />
          <span className="absolute top-[40px] right-[27px] size-[76px] overflow-clip xl:top-[86px] xl:right-[81px] xl:size-[104px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/sparkle-lg.svg"
              alt=""
              width={104}
              height={104}
              className="size-full"
            />
          </span>
          <span className="absolute top-[137px] left-[27px] size-11 overflow-clip xl:top-[297px] xl:left-9 xl:size-14">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/sparkle-sm.svg"
              alt=""
              width={56}
              height={56}
              className="size-full"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
