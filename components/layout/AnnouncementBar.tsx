"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/IconButton";

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="relative flex h-[34px] items-center justify-center bg-black px-4 xl:h-[38px]">
      <p className="text-center text-xs text-white xl:text-sm">
        Sign up and get 20% off to your first order.{" "}
        <a href="#newsletter" className="font-medium underline">
          Sign Up Now
        </a>
      </p>
      <IconButton
        src="/icons/close.svg"
        label="Dismiss announcement"
        size={20}
        className="absolute top-1/2 right-4 hidden size-5 -translate-y-1/2 xl:right-[100px] xl:inline-flex"
        onClick={() => setOpen(false)}
      />
    </div>
  );
}
