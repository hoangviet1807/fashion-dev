"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Testimonial } from "@/lib/data/content";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Rating } from "@/components/ui/Rating";
import { IconButton } from "@/components/ui/IconButton";

function TestimonialCard({
  name,
  quote,
}: {
  name: string;
  quote: string;
}) {
  return (
    <article className="h-full min-h-[186px] w-[358px] shrink-0 rounded-[20px] border border-line bg-white px-6 py-6 xl:min-h-[240px] xl:w-[400px] xl:px-8 xl:py-7">
      <Rating value={5} size="review" />
      <div className="mt-3 flex items-center gap-1 xl:mt-4">
        <h3 className="text-base font-bold leading-[22px] xl:text-xl">{name}</h3>
        <span className="relative size-[19px] overflow-clip xl:size-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/verified.svg"
            alt="Đã xác minh"
            width={24}
            height={24}
            className="size-full"
          />
        </span>
      </div>
      <p className="mt-2 text-sm leading-[22px] text-text-60 xl:text-base">
        “{quote}”
      </p>
    </article>
  );
}

const SPRING = { type: "spring", stiffness: 260, damping: 32 } as const;

export function Testimonials({ reviews }: { reviews: Testimonial[] }) {
  const [[index, direction], setPosition] = useState<[number, 1 | -1]>([0, 1]);
  const last = reviews.length - 1;

  function prev() {
    setPosition(([value]) => [value === 0 ? last : value - 1, -1]);
  }

  function next() {
    setPosition(([value]) => [value === last ? 0 : value + 1, 1]);
  }

  if (reviews.length === 0) return null;

  return (
    <section className="overflow-hidden pt-12 pb-4 xl:pt-[80px] xl:pb-8">
      <Container>
        <Reveal className="mb-6 flex items-end justify-between gap-4 xl:mb-10">
          <SectionHeading align="left">KHÁCH HÀNG NÓI GÌ VỀ CHÚNG TÔI</SectionHeading>
          <div className="mb-1 flex shrink-0 items-center gap-4">
            <IconButton
              src="/icons/arrow-left.svg"
              label="Đánh giá trước"
              onClick={prev}
              className="rotate-90"
            />
            <IconButton
              src="/icons/arrow-right.svg"
              label="Đánh giá tiếp theo"
              onClick={next}
              className="-rotate-90"
            />
          </div>
        </Reveal>
      </Container>

      <div className="md:hidden">
        <Container className="grid">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={reviews[index].id}
              custom={direction}
              className="[grid-area:1/1]"
              variants={{
                enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
                center: { opacity: 1, x: 0 },
                exit: (dir: number) => ({ opacity: 0, x: dir * -48 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SPRING}
            >
              <TestimonialCard
                name={reviews[index].name}
                quote={reviews[index].quote}
              />
            </motion.div>
          </AnimatePresence>
        </Container>
      </div>

      <Reveal delay={0.1} className="relative hidden md:block">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-white to-transparent xl:w-[80px]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-white to-transparent xl:w-[80px]" />
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-5 px-4 xl:px-[100px]"
            initial={false}
            animate={{ x: index * -420 }}
            transition={SPRING}
          >
            {reviews.map((review) => (
              <TestimonialCard
                key={review.id}
                name={review.name}
                quote={review.quote}
              />
            ))}
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}
