"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { subscribeNewsletter } from "@/app/(site)/newsletter/actions";
import { Container } from "@/components/layout/Container";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";

type Notice = { tone: "success" | "error"; text: string };

/** Results of the confirm / unsubscribe links (`/?newsletter=...`). */
const LINK_NOTICES: Record<string, Notice> = {
  confirmed: { tone: "success", text: "Đăng ký thành công! Cảm ơn bạn." },
  unsubscribed: { tone: "success", text: "Bạn đã huỷ đăng ký nhận bản tin." },
  invalid: { tone: "error", text: "Liên kết không hợp lệ hoặc đã hết hạn." },
  error: { tone: "error", text: "Đã có lỗi xảy ra. Vui lòng thử lại." },
};

export function NewsletterBanner() {
  const [notice, setNotice] = useState<Notice>();
  const [emailError, setEmailError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const openedAt = useRef(0);

  useEffect(() => {
    openedAt.current = Date.now();

    const url = new URL(window.location.href);
    const result = url.searchParams.get("newsletter");
    if (!result) return;
    url.searchParams.delete("newsletter");
    window.history.replaceState(window.history.state, "", url);
    const linkNotice = LINK_NOTICES[result];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the URL once after mount
    if (linkNotice) setNotice(linkNotice);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setNotice(undefined);
    setEmailError(undefined);

    startTransition(async () => {
      try {
        const result = await subscribeNewsletter({
          email: String(data.get("email") ?? ""),
          website: String(data.get("website") ?? ""),
          elapsedMs: Date.now() - openedAt.current,
        });
        if (result.status === "sent") {
          form.reset();
          setNotice({ tone: "success", text: "Kiểm tra hộp thư để xác nhận đăng ký." });
        } else if (result.status === "invalid") {
          setEmailError(result.message);
          setNotice({ tone: "error", text: result.message });
        } else {
          setNotice({ tone: "error", text: result.message });
        }
      } catch {
        setNotice({ tone: "error", text: "Đã có lỗi xảy ra. Vui lòng thử lại." });
      }
    });
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
            noValidate
            className="relative flex w-full flex-col gap-3.5 xl:w-[349px]"
          >
            <TextField
              icon="/icons/mail.svg"
              placeholder="Nhập địa chỉ email của bạn"
              type="email"
              name="email"
              autoComplete="email"
              required
              tone="white"
              error={emailError}
              className="w-full"
            />
            <div aria-hidden className="absolute left-[-9999px] size-px overflow-hidden">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <Button
              type="submit"
              variant="onDark"
              fullWidth
              disabled={pending}
              className="h-[46px] px-4 py-3 xl:h-[46px]"
            >
              Đăng ký nhận bản tin
            </Button>
            {notice ? (
              <p
                id={emailError ? "email-error" : undefined}
                role={notice.tone === "error" ? "alert" : "status"}
                className={`px-4 text-sm xl:absolute xl:top-full xl:mt-1.5 ${
                  notice.tone === "error" ? "text-discount" : "text-white/80"
                }`}
              >
                {notice.text}
              </p>
            ) : null}
          </form>
        </div>
      </Container>
    </div>
  );
}
