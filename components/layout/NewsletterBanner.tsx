"use client";

import { FormEvent } from "react";
import { Container } from "@/components/layout/Container";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

export function NewsletterBanner() {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div id="newsletter" className="relative z-10 -mb-[90px] xl:-mb-[90px]">
      <Container>
        <div className="flex flex-col gap-8 rounded-[20px] bg-black px-6 py-8 md:px-8 xl:h-[180px] xl:flex-row xl:items-center xl:justify-between xl:px-16 xl:py-9">
          <h2 className="font-display max-w-[551px] text-[32px] leading-9 text-white xl:text-[40px] xl:leading-[45px]">
            CẬP NHẬT ƯU ĐÃI MỚI NHẤT TỪ CHÚNG TÔI
          </h2>
          <form
            onSubmit={onSubmit}
            className="flex w-full flex-col gap-3.5 xl:w-[349px]"
          >
            <TextField
              icon="/icons/mail.svg"
              placeholder="Nhập địa chỉ email của bạn"
              type="email"
              name="email"
              required
              tone="white"
              className="w-full"
            />
            <Button type="submit" variant="onDark" fullWidth className="h-[46px] px-4 py-3 xl:h-[46px]">
              Đăng ký nhận bản tin
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}
