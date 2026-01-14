"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

type ConsentStatus = "accepted" | "rejected" | null;

const STORAGE_KEY = "bridgestone_cookies_consent";

export function useCookiesConsent() {
  const [consent, setConsent] = useState<ConsentStatus>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentStatus;
    setConsent(stored);
    setIsLoaded(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setConsent("rejected");
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConsent(null);
  };

  return {
    consent,
    isLoaded,
    accept,
    reject,
    reset,
    isAccepted: consent === "accepted",
    isRejected: consent === "rejected",
    hasDecided: consent !== null,
  };
}

export function CookiesBanner() {
  const { isLoaded, accept, reject, hasDecided } = useCookiesConsent();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Check if banner should be shown
  const bannerEnabled = process.env.NEXT_PUBLIC_COOKIES_BANNER_ENABLED !== "false";

  useEffect(() => {
    if (isLoaded && !hasDecided && bannerEnabled) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, hasDecided, bannerEnabled]);

  const handleAccept = () => {
    setIsExiting(true);
    setTimeout(() => {
      accept();
      setIsVisible(false);
    }, 300);
  };

  const handleReject = () => {
    setIsExiting(true);
    setTimeout(() => {
      reject();
      setIsVisible(false);
    }, 300);
  };

  // Don't render if banner is disabled or user has already decided
  if (!bannerEnabled || hasDecided || !isLoaded || !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
      style={{
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateY(100px)' : 'translateY(0)',
        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
        animation: 'slideUp 0.4s ease-out',
      }}
    >
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Cookies</h3>
          </div>
          <button
            onClick={handleReject}
            className="rounded-full p-1 hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Закрити"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          Ми використовуємо cookies для покращення роботи сайту, аналітики
          та персоналізації контенту. Ви можете прийняти всі cookies або
          відхилити необов&apos;язкові.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleAccept}
            className="flex-1 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-silver focus:ring-offset-2"
          >
            Прийняти всі
          </button>
          <button
            onClick={handleReject}
            className="flex-1 rounded-full border border-border bg-transparent px-6 py-2.5 text-sm font-semibold hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Тільки необхідні
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Детальніше в{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Політиці конфіденційності
          </a>
        </p>
      </div>
    </div>
  );
}
