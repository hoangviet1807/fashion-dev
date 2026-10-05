"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/** Counts the numeric part of a label like "2.000+" up from zero once visible. */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  const target = Number(value.replace(/\D/g, ""));
  const suffix = value.replace(/^[\d.,]+/, "");

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;
    if (reduce || !target) {
      node.textContent = value;
      return;
    }
    const format = new Intl.NumberFormat("vi-VN");
    const controls = animate(0, target, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = `${format.format(Math.round(latest))}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, target, suffix, value]);

  return (
    <p className={`grid ${className}`}>
      {/* Invisible final value reserves the width so the count never reflows the row. */}
      <span aria-hidden className="invisible [grid-area:1/1]">
        {value}
      </span>
      <span ref={ref} aria-hidden className="[grid-area:1/1]">
        {`0${suffix}`}
      </span>
      <span className="sr-only">{value}</span>
    </p>
  );
}
