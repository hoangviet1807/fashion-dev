"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Form from "next/form";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/ui/Logo";
import { TextField } from "@/components/ui/TextField";
import { IconButton } from "@/components/ui/IconButton";
import { navLinks } from "@/lib/home-data";
import { CATEGORIES } from "@/lib/catalog";
import { useCartCount } from "@/lib/cart/store";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/components/motion/Reveal";

const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.3, ease: EASE_OUT },
} as const;

const NAV_LINK =
  "relative flex items-center gap-1 py-1 text-base text-black after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-right after:scale-x-0 after:bg-black after:transition-transform after:duration-300 after:ease-out-expo after:content-[''] hover:after:origin-left hover:after:scale-x-100 motion-reduce:after:transition-none";

const ICON_LINK =
  "relative isolate inline-flex size-6 shrink-0 rounded-full transition-transform duration-200 before:absolute before:-inset-2 before:-z-10 before:rounded-full before:bg-black/0 before:transition-colors before:duration-200 before:content-[''] hover:before:bg-black/[0.06] active:scale-90 motion-reduce:active:scale-100";

const MOBILE_ROW =
  "-mx-3 rounded-xl px-3 py-2 text-base text-black transition-colors duration-150 hover:bg-muted active:bg-muted";

export function Header() {
  const cartCount = useCartCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const shopTriggerRef = useRef<HTMLAnchorElement>(null);
  const shopTimer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(shopTimer.current), []);

  function openShop() {
    window.clearTimeout(shopTimer.current);
    setShopOpen(true);
  }

  function closeShop(delay = 0) {
    window.clearTimeout(shopTimer.current);
    if (delay) shopTimer.current = window.setTimeout(() => setShopOpen(false), delay);
    else setShopOpen(false);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    const q = new FormData(event.currentTarget).get("q");
    if (typeof q !== "string" || !q.trim()) {
      event.preventDefault();
      return;
    }
    setSearchOpen(false);
  }

  return (
    <header className="relative bg-white">
      <Container className="flex h-16 items-center gap-4 lg:h-[96px] lg:gap-10">
        <div className="flex min-w-0 items-center gap-4">
          <IconButton
            src="/icons/hamburger.svg"
            label={menuOpen ? "Đóng menu" : "Mở menu"}
            className="lg:hidden"
            onClick={() => setMenuOpen((value) => !value)}
          />

          <Logo />
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) =>
            link.hasMenu ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => openShop()}
                onMouseLeave={() => closeShop(160)}
                onFocus={(event) => {
                  if (event.target.matches(":focus-visible")) openShop();
                }}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) closeShop();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && shopOpen) {
                    closeShop();
                    shopTriggerRef.current?.focus();
                  }
                }}
              >
                <Link
                  ref={shopTriggerRef}
                  href={link.href}
                  className={`${NAV_LINK} ${shopOpen ? "after:origin-left after:scale-x-100" : ""}`}
                  aria-expanded={shopOpen}
                  aria-controls="shop-menu"
                >
                  {link.label}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/chevron.svg"
                    alt=""
                    width={16}
                    height={16}
                    className={`size-4 transition-transform duration-300 ease-out-expo motion-reduce:transition-none ${shopOpen ? "rotate-180" : ""}`}
                  />
                </Link>
                <AnimatePresence>
                  {shopOpen ? (
                    <motion.div
                      id="shop-menu"
                      className="absolute top-full -left-3 z-50 origin-top-left pt-3"
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: EASE_OUT }}
                    >
                      <ul className="min-w-[220px] rounded-2xl border border-line bg-white p-1.5 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.28)]">
                        {CATEGORIES.map((category) => (
                          <li key={category.id}>
                            <Link
                              href={`/shop?category=${category.id}`}
                              className="group/item flex items-center justify-between gap-6 rounded-xl px-3 py-2.5 text-base text-text-60 transition-colors duration-150 hover:bg-muted hover:text-black focus-visible:bg-muted focus-visible:text-black focus-visible:outline-none"
                              onClick={() => closeShop()}
                            >
                              {category.label}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src="/icons/chevron.svg"
                                alt=""
                                width={14}
                                height={14}
                                className="size-3.5 -translate-x-1 -rotate-90 opacity-0 transition-[opacity,transform] duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0 group-focus-visible/item:opacity-100"
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <Link key={link.label} href={link.href} className={NAV_LINK}>
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <Form
          action="/shop"
          role="search"
          className="hidden min-w-0 flex-1 lg:block"
          onSubmit={handleSearch}
        >
          <TextField
            icon="/icons/search.svg"
            placeholder="Tìm kiếm sản phẩm..."
            type="search"
            name="q"
            className="w-full"
          />
        </Form>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <IconButton
            src="/icons/search.svg"
            label="Tìm kiếm"
            className="lg:hidden"
            onClick={() => setSearchOpen((value) => !value)}
          />
          <Link
            href="/cart"
            aria-label={cartCount > 0 ? `Giỏ hàng, ${cartCount} sản phẩm` : "Giỏ hàng"}
            className={ICON_LINK}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/cart.svg" alt="" width={24} height={24} className="size-full" />
            <AnimatePresence>
              {cartCount > 0 ? (
                <motion.span
                  key={cartCount}
                  className="absolute -top-1.5 -right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium leading-none text-white"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </Link>
          <Link
            href="/account"
            aria-label="Tài khoản"
            className={ICON_LINK}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/account.svg" alt="" width={24} height={24} className="size-full" />
          </Link>
        </div>
      </Container>

      <AnimatePresence initial={false}>
        {searchOpen ? (
          <motion.div
            key="search"
            className="overflow-hidden lg:hidden"
            {...collapse}
          >
            <Container className="pb-4">
              <Form action="/shop" role="search" onSubmit={handleSearch}>
                <TextField
                  icon="/icons/search.svg"
                  placeholder="Tìm kiếm sản phẩm..."
                  type="search"
                  name="q"
                />
              </Form>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {menuOpen ? <motion.div
          key="menu"
          className="overflow-hidden border-t border-line bg-white lg:hidden"
          {...collapse}
        >
          <Container className="flex flex-col gap-2 py-3">
            {navLinks.map((link) =>
              link.hasMenu ? (
                <div key={link.label} className="flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={link.href}
                      className={`${MOBILE_ROW} flex-1`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                    <button
                      type="button"
                      aria-label={mobileShopOpen ? "Đóng danh mục sản phẩm" : "Mở danh mục sản phẩm"}
                      aria-expanded={mobileShopOpen}
                      className="inline-flex size-10 items-center justify-center rounded-full transition-colors duration-150 hover:bg-muted active:bg-muted"
                      onClick={() => setMobileShopOpen((value) => !value)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icons/chevron.svg"
                        alt=""
                        width={16}
                        height={16}
                        className={`size-4 transition-transform duration-300 ease-out-expo motion-reduce:transition-none ${mobileShopOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                  <AnimatePresence initial={false}>
                    {mobileShopOpen ? (
                      <motion.div key="categories" className="overflow-hidden" {...collapse}>
                        <div className="flex flex-col pb-1 pl-3">
                          {CATEGORIES.map((category) => (
                            <Link
                              key={category.id}
                              href={`/shop?category=${category.id}`}
                              className={`${MOBILE_ROW} text-text-60 hover:text-black`}
                              onClick={() => setMenuOpen(false)}
                            >
                              {category.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={MOBILE_ROW}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ),
            )}
          </Container>
        </motion.div> : null}
      </AnimatePresence>
    </header>
  );
}
