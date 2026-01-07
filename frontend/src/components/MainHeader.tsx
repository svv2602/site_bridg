"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

const mainNav = [
  { href: "/passenger-tyres", label: "Легкові шини" },
  { href: "/suv-4x4-tyres", label: "Шини для SUV" },
  { href: "/lcv-tyres", label: "Комерційні шини" },
  { href: "/tyre-search", label: "Пошук шин" },
  { href: "/dealers", label: "Де купити" },
  { href: "/about", label: "Бренд" },
  { href: "/advice", label: "Поради" },
  { href: "/contacts", label: "Контакти" },
];

export default function MainHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-zinc-900/95 backdrop-blur-sm">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-base font-bold text-white shadow-lg transition-transform group-hover:scale-105">
            B
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold uppercase tracking-tight text-zinc-100 md:text-base">
              Bridgestone
            </span>
            <span className="text-[11px] text-zinc-400">
              Офіційний сайт в Україні
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Єдина червона CTA в навігації */}
          <Link
            href="/tyre-search"
            className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-primary-dark sm:flex"
          >
            <Search className="h-4 w-4" />
            Пошук шин
          </Link>

          {/* Бургер-меню для всіх інших розділів */}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-full border border-zinc-700 p-2 hover:bg-zinc-800"
          >
            <span className="sr-only">Меню</span>
            <div className="h-0.5 w-5 bg-zinc-100" />
            <div className="mt-1 h-0.5 w-5 bg-zinc-100" />
            <div className="mt-1 h-0.5 w-5 bg-zinc-100" />
          </button>
        </div>

        {open && (
          <div className="absolute right-4 top-full mt-2 w-64 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-2 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            <nav className="flex flex-col divide-y divide-zinc-800">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2.5 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}