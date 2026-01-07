"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      return stored;
    }

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", next);
      window.localStorage.setItem("theme", next);
    }
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-card/80"
      aria-label={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-primary" />
      ) : (
        <Moon className="h-4 w-4 text-primary" />
      )}
      <span className="hidden sm:inline">
        {isDark ? "Світла тема" : "Темна тема"}
      </span>
    </button>
  );
}