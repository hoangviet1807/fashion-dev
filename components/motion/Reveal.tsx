"use client";

import { motion, type Variants } from "motion/react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type Tag = "div" | "ul" | "li" | "section";

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

function group(stagger: number, delay: number): Variants {
  return {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
}

/** Fades and lifts its children once when scrolled into view. */
export function Reveal({
  as = "div",
  className,
  delay = 0,
  children,
}: {
  as?: Tag;
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: item.hidden,
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: EASE_OUT, delay },
        },
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Staggers `RevealItem` children into view. A `nested` group inherits the
 * trigger from its parent group instead of observing the viewport itself.
 */
export function RevealGroup({
  as = "div",
  className,
  stagger = 0.08,
  delay = 0,
  nested = false,
  children,
}: {
  as?: Tag;
  className?: string;
  stagger?: number;
  delay?: number;
  nested?: boolean;
  children: React.ReactNode;
}) {
  const Component = motion[as] as typeof motion.div;
  const trigger = nested
    ? {}
    : {
        initial: "hidden",
        whileInView: "show",
        viewport: { once: true, amount: 0.15 },
      };
  return (
    <Component className={className} variants={group(stagger, delay)} {...trigger}>
      {children}
    </Component>
  );
}

export function RevealItem({
  as = "div",
  className,
  children,
}: {
  as?: Tag;
  className?: string;
  children: React.ReactNode;
}) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component className={className} variants={item}>
      {children}
    </Component>
  );
}
