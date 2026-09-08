"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/ui/Logo";
import { TextField } from "@/components/ui/TextField";
import { IconButton } from "@/components/ui/IconButton";
import { navLinks } from "@/lib/home-data";
import { CATEGORIES } from "@/lib/shop-data";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);

  return (
    <header className="relative bg-white">
      <Container className="flex h-16 items-center gap-4 lg:h-[96px] lg:gap-10">
        <div className="flex min-w-0 items-center gap-4">
          <IconButton
            src="/icons/hamburger.svg"
            label={menuOpen ? "Close menu" : "Open menu"}
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
                onMouseEnter={() => setShopOpen(true)}
                onMouseLeave={() => setShopOpen(false)}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-1 text-base text-black"
                  aria-expanded={shopOpen}
                  aria-haspopup="menu"
                >
                  {link.label}
                  <span className="relative size-4 overflow-clip">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/icons/chevron.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="size-full"
                    />
                  </span>
                </Link>
                {shopOpen ? (
                  <div
                    role="menu"
                    className="absolute top-full left-0 z-50 min-w-[180px] rounded-[12px] border border-line bg-white py-2"
                  >
                    {CATEGORIES.map((category) => (
                      <Link
                        key={category.id}
                        role="menuitem"
                        href={`/shop?category=${category.id}`}
                        className="block px-4 py-2 text-base text-black hover:bg-muted"
                        onClick={() => setShopOpen(false)}
                      >
                        {category.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-1 text-base text-black"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <form className="hidden min-w-0 flex-1 lg:block" action="#new-arrivals">
          <TextField
            icon="/icons/search.svg"
            placeholder="Search for products..."
            type="search"
            name="q"
            className="w-full"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <IconButton
            src="/icons/search.svg"
            label="Search"
            className="lg:hidden"
            onClick={() => setSearchOpen((value) => !value)}
          />
          <Link
            href="/cart"
            aria-label="Cart"
            className="inline-flex size-6 shrink-0 overflow-clip"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/cart.svg" alt="" width={24} height={24} className="size-full" />
          </Link>
          <Link
            href="#account"
            aria-label="Account"
            className="inline-flex size-6 shrink-0 overflow-clip"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/account.svg" alt="" width={24} height={24} className="size-full" />
          </Link>
        </div>
      </Container>

      {searchOpen ? (
        <Container className="pb-4 lg:hidden">
          <TextField
            icon="/icons/search.svg"
            placeholder="Search for products..."
            type="search"
            name="q"
          />
        </Container>
      ) : null}

      {menuOpen ? (
        <div className="border-t border-line bg-white lg:hidden">
          <Container className="flex flex-col gap-4 py-4">
            {navLinks.map((link) =>
              link.hasMenu ? (
                <div key={link.label} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      className="text-base text-black"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                    <button
                      type="button"
                      aria-label="Toggle shop categories"
                      aria-expanded={mobileShopOpen}
                      className="inline-flex size-8 items-center justify-center"
                      onClick={() => setMobileShopOpen((value) => !value)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icons/chevron.svg"
                        alt=""
                        width={16}
                        height={16}
                        className={`size-4 transition-transform ${mobileShopOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                  {mobileShopOpen
                    ? CATEGORIES.map((category) => (
                        <Link
                          key={category.id}
                          href={`/shop?category=${category.id}`}
                          className="pl-3 text-base text-text-60"
                          onClick={() => setMenuOpen(false)}
                        >
                          {category.label}
                        </Link>
                      ))
                    : null}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-base text-black"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ),
            )}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
