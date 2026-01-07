"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function CookiesBanner() {
  const { consent, isLoaded, accept, reject, hasDecided } = useCookiesConsent();
  const [isVisible, setIsVisible] = useState(false);

  // Check if banner should be shown
  const bannerEnabled = process.env.NEXT_PUBLIC_COOKIES_BANNER_ENABLED !== "false";

  useEffect(() => {
    if (isLoaded && !hasDecided && bannerEnabled) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, hasDecided, bannerEnabled]);

  // Don't render if banner is disabled or user has already decided
  if (!bannerEnabled || hasDecided || !isLoaded) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
        >
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Cookies</h3>
              </div>
              <button
                onClick={reject}
                className="rounded-full p-1 hover:bg-card"
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
                onClick={accept}
                className="flex-1 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Прийняти всі
              </button>
              <button
                onClick={reject}
                className="flex-1 rounded-full border border-border bg-transparent px-6 py-2.5 text-sm font-semibold hover:bg-card"
              >
                Тільки необхідні
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Детальніше в{" "}
              <a href="#" className="text-primary hover:underline">
                Політиці конфіденційності
              </a>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
