"use client";

import { useState } from "react";
import { reviews } from "@/lib/home-data";
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
            alt="Verified"
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

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const last = reviews.length - 1;

  function prev() {
    setIndex((value) => (value === 0 ? last : value - 1));
  }

  function next() {
    setIndex((value) => (value === last ? 0 : value + 1));
  }

  return (
    <section className="overflow-hidden pt-12 pb-4 xl:pt-[80px] xl:pb-8">
      <Container>
        <div className="mb-6 flex items-end justify-between gap-4 xl:mb-10">
          <SectionHeading align="left">OUR HAPPY CUSTOMERS</SectionHeading>
          <div className="mb-1 flex shrink-0 items-center gap-4">
            <IconButton
              src="/icons/arrow-left.svg"
              label="Previous testimonials"
              onClick={prev}
              className="rotate-90"
            />
            <IconButton
              src="/icons/arrow-right.svg"
              label="Next testimonials"
              onClick={next}
              className="-rotate-90"
            />
          </div>
        </div>
      </Container>

      <div className="md:hidden">
        <Container>
          <TestimonialCard
            name={reviews[index].name}
            quote={reviews[index].quote}
          />
        </Container>
      </div>

      <div className="relative hidden md:block">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-white to-transparent xl:w-[80px]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-white to-transparent xl:w-[80px]" />
        <div className="overflow-hidden">
          <div
            className="flex gap-5 px-4 transition-transform duration-300 xl:px-[100px]"
            style={{
              transform: `translateX(calc(-${index} * 420px))`,
            }}
          >
            {reviews.map((review) => (
              <TestimonialCard
                key={review.id}
                name={review.name}
                quote={review.quote}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
