"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/IconButton";

export function AnnouncementBar() {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="relative flex h-[34px] items-center justify-center bg-black px-4 xl:h-[38px]">
      <p className="text-center text-xs text-white xl:text-sm">
        Đăng ký để được giảm 20% cho đơn hàng đầu tiên.{" "}
        <a href="#newsletter" className="font-medium underline">
          Đăng ký ngay
        </a>
      </p>
      <IconButton
        src="/icons/close.svg"
        label="Đóng thông báo"
        size={20}
        className="absolute top-1/2 right-4 hidden size-5 -translate-y-1/2 xl:right-[100px] xl:inline-flex"
        onClick={() => setOpen(false)}
      />
    </div>
  );
}
