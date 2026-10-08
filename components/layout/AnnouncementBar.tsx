"use client";

import Link from "next/link";
import Marquee from "react-fast-marquee";
import { useReducedMotion } from "motion/react";
import type { Announcement } from "@/lib/data/content";

function Separator() {
  return <span aria-hidden className="mx-6 size-1 rounded-full bg-white/50 xl:mx-10" />;
}

export function AnnouncementBar({ text, linkLabel, linkHref, extraMessages }: Announcement) {
  const reduceMotion = useReducedMotion();



  const link =
    linkLabel && linkHref ? (
      linkHref.startsWith("/") ? (
        <Link href={linkHref} className="font-medium underline">
          {linkLabel}
        </Link>
      ) : (
        <a href={linkHref} className="font-medium underline">
          {linkLabel}
        </a>
      )
    ) : null;

  return (
    <div className="relative flex h-[34px] items-center bg-black text-xs text-white xl:h-[38px] xl:text-sm">
      <Marquee speed={40} autoFill play={!reduceMotion} className="h-full">
        <p className="flex items-center whitespace-nowrap">
          <span>
            {text}
            {link ? <> {link}</> : null}
          </span>
          {extraMessages.map((message) => (
            <span key={message} className="flex items-center">
              <Separator />
              {message}
            </span>
          ))}
          <Separator />
        </p>
      </Marquee>
    </div>
  );
}
