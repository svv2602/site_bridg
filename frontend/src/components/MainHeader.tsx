"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { MegaMenu } from "./MegaMenu";
import { tyresMenuData, primaryNav, fullNav } from "@/lib/navigation";

export function MainHeader() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

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

  // Handle Escape key and focus trap for mobile menu
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        burgerRef.current?.focus();
        return;
      }

      // Focus trap: keep Tab within the mobile menu
      if (e.key === "Tab" && navRef.current) {
        const focusable = navRef.current.querySelectorAll<HTMLElement>("a, button");
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Auto-focus first link when mobile menu opens
  useEffect(() => {
    if (open && navRef.current) {
      requestAnimationFrame(() => {
        const firstLink = navRef.current?.querySelector<HTMLElement>("a");
        firstLink?.focus();
      });
    }
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
            className="hidden items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand/90 hover:shadow-lg sm:flex focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-stone-900"
          >
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Пошук шин</span>
          </Link>

          {/* Burger menu (mobile only) */}
          <div ref={menuRef} className="lg:hidden">
            <button
              ref={burgerRef}
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center justify-center rounded-full border border-stone-700 p-2 min-w-11 min-h-11 transition-colors hover:bg-stone-800"
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
              <div ref={navRef} className="absolute right-4 top-full mt-2 w-64 rounded-2xl border border-stone-800 bg-stone-900/98 p-2 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
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
