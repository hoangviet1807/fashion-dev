"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, EffectFade, Keyboard, Pagination } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { Button } from "@/components/ui/Button";
import type { HeroSlide } from "@/lib/data/content";

/** Plays the active slide's video and pauses the rest, so hidden slides don't burn bandwidth. */
function syncVideos(swiper: SwiperInstance) {
  swiper.slides.forEach((slide, index) => {
    const video = slide.querySelector("video");
    if (!video) return;
    if (index === swiper.activeIndex) {
      video.currentTime = 0;
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d={direction === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Slide({ slide, first }: { slide: HeroSlide; first: boolean }) {
  const light = slide.tone === "light";
  const hasText = slide.heading || slide.subheading || (slide.ctaLabel && slide.ctaHref);

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden md:aspect-[12/5]">
      <Image
        src={slide.mobileSrc}
        alt={slide.alt}
        fill
        priority={first}
        sizes="100vw"
        className="object-cover md:hidden"
      />
      <Image
        src={slide.desktopSrc}
        alt={slide.alt}
        fill
        priority={first}
        sizes="100vw"
        className="hidden object-cover md:block"
      />
      {slide.videoUrl ? (
        <video
          src={slide.videoUrl}
          poster={slide.desktopSrc}
          muted
          loop
          playsInline
          autoPlay={first}
          preload={first ? "auto" : "metadata"}
          aria-hidden
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}

      {hasText ? (
        <div
          aria-hidden
          className={`absolute inset-0 bg-linear-to-t to-transparent to-60% md:bg-linear-to-r md:to-55% ${
            light ? "from-black/55" : "from-white/70"
          }`}
        />
      ) : null}

      {slide.ctaHref ? (
        <Link href={slide.ctaHref} tabIndex={-1} aria-hidden className="absolute inset-0 z-10" />
      ) : null}

      {hasText ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-end md:items-center">
          <div className={`mx-auto w-full max-w-[1440px] px-4 pb-16 md:pb-0 xl:px-[100px] ${light ? "text-white" : "text-black"}`}>
            <div className="max-w-[560px]">
              {slide.heading ? (
                <h2 className="font-display text-[36px] leading-9 uppercase motion-safe:animate-rise xl:text-[64px] xl:leading-[64px]">
                  {slide.heading}
                </h2>
              ) : null}
              {slide.subheading ? (
                <p
                  className={`mt-4 text-sm leading-[22px] motion-safe:animate-rise motion-safe:[animation-delay:120ms] xl:mt-6 xl:text-base ${
                    light ? "text-white/80" : "text-text-60"
                  }`}
                >
                  {slide.subheading}
                </p>
              ) : null}
              {slide.ctaLabel && slide.ctaHref ? (
                <div className="pointer-events-auto mt-6 motion-safe:animate-rise motion-safe:[animation-delay:240ms] xl:mt-8">
                  <Button href={slide.ctaHref} variant={light ? "onDark" : "primary"} className="w-full md:w-auto">
                    {slide.ctaLabel}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const reduceMotion = useReducedMotion();
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const multiple = slides.length > 1;

  return (
    <section className="group/hero relative bg-hero">
      <h1 className="sr-only">Trang phục hợp phong cách của bạn</h1>
      <Swiper
        modules={[A11y, Autoplay, EffectFade, Keyboard, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={reduceMotion ? 0 : 800}
        loop={multiple}
        autoplay={multiple && !reduceMotion ? { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
        pagination={multiple ? { clickable: true } : false}
        keyboard={{ enabled: true }}
        a11y={{ prevSlideMessage: "Slide trước", nextSlideMessage: "Slide tiếp theo", paginationBulletMessage: "Tới slide {{index}}" }}
        onSwiper={setSwiper}
        onSlideChangeTransitionStart={syncVideos}
        className="[--swiper-pagination-bottom:20px] [&_.swiper-pagination-bullet]:h-2 [&_.swiper-pagination-bullet]:w-2 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-black/30 [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet]:duration-300 [&_.swiper-pagination-bullet-active]:w-7 [&_.swiper-pagination-bullet-active]:bg-black"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id} data-swiper-autoplay={slide.duration}>
            <Slide slide={slide} first={index === 0} />
          </SwiperSlide>
        ))}
      </Swiper>

      {multiple ? (
        <>
          <button
            type="button"
            aria-label="Slide trước"
            onClick={() => swiper?.slidePrev()}
            className="absolute top-1/2 left-6 z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black opacity-0 shadow-sm backdrop-blur transition-[opacity,background-color] duration-300 group-hover/hero:opacity-100 hover:bg-white focus-visible:opacity-100 md:inline-flex"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            aria-label="Slide tiếp theo"
            onClick={() => swiper?.slideNext()}
            className="absolute top-1/2 right-6 z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-black opacity-0 shadow-sm backdrop-blur transition-[opacity,background-color] duration-300 group-hover/hero:opacity-100 hover:bg-white focus-visible:opacity-100 md:inline-flex"
          >
            <Chevron direction="right" />
          </button>
        </>
      ) : null}
    </section>
  );
}
