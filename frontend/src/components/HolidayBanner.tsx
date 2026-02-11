"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import Link from "next/link";
import type { PayloadHolidayBanner } from "@/lib/api/payload";

const PAYLOAD_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3001";

const DISMISS_EXPIRY_DAYS = 60;

function getDismissKey(id: string): string {
  return `holiday-banner-dismissed-${id}`;
}

function isDismissed(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(getDismissKey(id));
    if (!raw) return false;
    const expiry = parseInt(raw, 10);
    if (Date.now() > expiry) {
      localStorage.removeItem(getDismissKey(id));
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function dismiss(id: string): void {
  try {
    const expiry = Date.now() + DISMISS_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(getDismissKey(id), String(expiry));
  } catch {
    // localStorage unavailable
  }
}

function getMediaUrl(media?: { url?: string } | null): string | undefined {
  if (!media?.url) return undefined;
  return media.url.startsWith("http") ? media.url : `${PAYLOAD_URL}${media.url}`;
}

export function HolidayBanner({
  banners,
}: {
  banners: PayloadHolidayBanner[];
}) {
  const pathname = usePathname();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = new Set<string>();
    for (const b of banners) {
      if (isDismissed(b.id)) dismissed.add(b.id);
    }
    setDismissedIds(dismissed);
  }, [banners]);

  // Find the first visible banner (already sorted by priority from API)
  const activeBanner = banners.find((b) => {
    if (dismissedIds.has(b.id)) return false;

    if (b.displayOn === "homepage" && pathname !== "/") return false;
    if (b.displayOn === "specific-pages" && b.specificPages) {
      const matches = b.specificPages.some(
        (p) => pathname === p.path || pathname.startsWith(p.path + "/")
      );
      if (!matches) return false;
    }

    return true;
  });

  // Don't render anything server-side or if no banner
  if (!mounted || !activeBanner) return null;

  const desktopBg = getMediaUrl(activeBanner.bannerImage);
  const mobileBg = getMediaUrl(activeBanner.bannerImageMobile);

  const handleDismiss = () => {
    setIsClosing(true);
    dismiss(activeBanner.id);
    setTimeout(() => {
      setDismissedIds((prev) => new Set([...prev, activeBanner.id]));
      setIsClosing(false);
    }, 300);
  };

  return (
    <div
      role="banner"
      aria-label={activeBanner.title}
      className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
        isClosing ? "max-h-0 opacity-0" : "max-h-32 opacity-100"
      } ${activeBanner.backgroundColor} ${activeBanner.textColor}`}
    >
      {/* Background images */}
      {desktopBg && (
        <div
          className="absolute inset-0 hidden md:block bg-cover bg-center"
          style={{ backgroundImage: `url(${desktopBg})` }}
        />
      )}
      {(mobileBg || desktopBg) && (
        <div
          className="absolute inset-0 md:hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${mobileBg || desktopBg})` }}
        />
      )}

      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 md:px-8">
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 text-sm md:text-base">
          {activeBanner.emoji && (
            <span className="shrink-0 text-lg" aria-hidden="true">
              {activeBanner.emoji}
            </span>
          )}
          <span className="font-semibold">{activeBanner.title}</span>
          {activeBanner.subtitle && (
            <span className="hidden opacity-90 sm:inline">
              {" "}
              — {activeBanner.subtitle}
            </span>
          )}
          {activeBanner.link && activeBanner.linkText && (
            <Link
              href={activeBanner.link}
              className="ml-2 shrink-0 rounded-md bg-white/20 px-3 py-0.5 text-sm font-medium transition-colors hover:bg-white/30"
            >
              {activeBanner.linkText}
            </Link>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded-full p-1 transition-colors hover:bg-white/20"
          aria-label="Закрити банер"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
