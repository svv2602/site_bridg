"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { MegaMenu } from "./MegaMenu";
import { tyresMenuData, primaryNav, fullNav } from "@/lib/navigation";

export function MainHeader() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-800 bg-stone-900/95 backdrop-blur-sm">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-base font-bold text-white shadow-lg transition-transform group-hover:scale-105">
            B
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold uppercase tracking-tight text-stone-100 md:text-base">
              Bridgestone <span className="text-[#FF6600]">&</span> Firestone
            </span>
            <span className="hidden text-[11px] text-stone-400 sm:block">
              Офіційний представник в Україні
            </span>
          </div>
        </Link>

        {/* Desktop Navigation with Mega Menu */}
        <nav className="hidden items-center gap-1 lg:flex">
          {/* Mega Menu for Tyres */}
          <MegaMenu trigger={tyresMenuData.trigger} columns={tyresMenuData.columns} />

          {/* Regular nav items */}
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-stone-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search CTA */}
          <Link
            href="/tyre-search"
            className="hidden items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900 shadow-md ring-1 ring-stone-300 transition-all hover:ring-stone-400 hover:shadow-lg sm:flex focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-stone-900"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Пошук шин</span>
          </Link>

          {/* Burger menu (mobile + additional items on desktop) */}
          <div ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="rounded-full border border-stone-700 p-2 transition-colors hover:bg-stone-800 lg:border-transparent"
              aria-expanded={open}
              aria-label={open ? "Закрити меню" : "Відкрити меню"}
            >
              {open ? (
                <X className="h-5 w-5 text-stone-100" />
              ) : (
                <Menu className="h-5 w-5 text-stone-100" />
              )}
            </button>

            {open && (
              <div className="absolute right-4 top-full mt-2 w-64 rounded-2xl border border-stone-800 bg-stone-900/98 p-2 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                <nav className="flex flex-col">
                  {fullNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-lg px-4 py-2.5 text-stone-100 transition-colors hover:bg-stone-800 hover:text-white"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
