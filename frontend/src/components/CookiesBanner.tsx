"use client";

import { useState, useEffect, useRef } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
    window.dispatchEvent(new CustomEvent("consent-changed", { detail: { consent: "accepted" } }));
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setConsent("rejected");
    window.dispatchEvent(new CustomEvent("consent-changed", { detail: { consent: "rejected" } }));
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConsent(null);
    window.dispatchEvent(new CustomEvent("consent-changed", { detail: { consent: null } }));
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
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  // Check if banner should be shown
  const bannerEnabled = process.env.NEXT_PUBLIC_COOKIES_BANNER_ENABLED !== "false";

  useEffect(() => {
    if (isLoaded && !hasDecided && bannerEnabled) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, hasDecided, bannerEnabled]);

  // Auto-focus accept button when banner appears
  useEffect(() => {
    if (isVisible && acceptButtonRef.current) {
      acceptButtonRef.current.focus();
    }
  }, [isVisible]);

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
      role="dialog"
      aria-label="Згода на cookies"
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
            <div className="rounded-full bg-amber-500/15 p-2">
              <Cookie className="h-5 w-5 text-amber-500" />
            </div>
            <div className="heading-3 text-lg font-semibold">Cookies</div>
          </div>
          <button
            onClick={handleReject}
            className="rounded-full p-1 hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-primary dark:hover:bg-stone-700"
            aria-label="Закрити"
          >
            <X className="h-4 w-4 text-stone-500 dark:text-stone-400" />
          </button>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          Ми використовуємо cookies для покращення роботи сайту, аналітики
          та персоналізації контенту. Ви можете прийняти всі cookies або
          відхилити необов&apos;язкові.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            ref={acceptButtonRef}
            onClick={handleAccept}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            Прийняти всі
          </Button>
          <Button
            onClick={handleReject}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Тільки необхідні
          </Button>
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
