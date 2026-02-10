"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Phone,
  Globe,
  Clock,
  Loader2,
  Navigation,
  ChevronDown,
} from "lucide-react";
import { ErrorState } from "@/components/ui";
import { type FilteredDealer, buildRouteUrl } from "../types";

export interface DealerListProps {
  dealers: FilteredDealer[];
  isLoading: boolean;
  error: string | null;
  expandedDealer: string | null;
  onExpandDealer: (id: string | null) => void;
  onRetry: () => void;
}

const DEALERS_PER_PAGE = 20;

export function DealerList({
  dealers,
  isLoading,
  error,
  expandedDealer,
  onExpandDealer,
  onRetry,
}: DealerListProps) {
  const [visibleCount, setVisibleCount] = useState(DEALERS_PER_PAGE);

  // Reset visible count when dealer list changes (e.g. filter/search)
  useEffect(() => {
    setVisibleCount(DEALERS_PER_PAGE);
  }, [dealers]);

  const visibleDealers = dealers.slice(0, visibleCount);
  const hasMore = visibleCount < dealers.length;

  if (error) {
    return (
      <ErrorState
        title="Помилка завантаження"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Завантаження дилерів...</span>
      </div>
    );
  }

  if (dealers.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <Search className="mx-auto h-12 w-12 text-stone-500 dark:text-stone-400" />
        <h3 className="mt-4 text-xl font-semibold">Дилерів не знайдено</h3>
        <p className="mt-2 text-muted-foreground">
          Спробуйте змінити параметри пошуку або обрати інше місто.
        </p>
      </div>
    );
  }

  return (
    <div>
    <div className="grid gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3">
      {visibleDealers.map((dealer) => (
        <article
          key={dealer.id}
          id={`dealer-${dealer.id}`}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
        >
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${dealer.type === "official"
                      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                      : dealer.type === "partner"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200"
                        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                    }`}
                >
                  {dealer.type === "official"
                    ? "Офіційний дилер"
                    : dealer.type === "partner"
                      ? "Партнер"
                      : "Сервісний центр"}
                </span>
                <h3 className="mt-3 mb-1 text-xl font-medium text-foreground transition-all group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                  {dealer.name}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{dealer.displayAddress}</span>
                  {dealer.distance != null && (
                    <span className="ml-auto shrink-0 rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                      {dealer.distance < 1
                        ? `${Math.round(dealer.distance * 1000)} м`
                        : `${dealer.distance.toFixed(1)} км`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {dealer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Телефон</p>
                    <a
                      href={`tel:${dealer.phone}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {dealer.phone}
                    </a>
                  </div>
                </div>
              )}
              {dealer.website && /^https?:\/\//i.test(dealer.website) && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Вебсайт</p>
                    <a
                      href={dealer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {dealer.website}
                    </a>
                  </div>
                </div>
              )}
              {dealer.workingHours && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Години роботи</p>
                    <p className="font-medium">{dealer.workingHours}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => onExpandDealer(expandedDealer === dealer.id ? null : dealer.id)}
                aria-expanded={expandedDealer === dealer.id}
                aria-controls={`dealer-details-${dealer.id}`}
                className="rounded-full border border-stone-300 bg-transparent px-4 py-2 text-sm font-medium hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700"
              >
                {expandedDealer === dealer.id ? "Менше" : "Детальніше"}
              </button>
              <a
                href={buildRouteUrl(dealer)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-text hover:bg-primary-hover"
              >
                <Navigation className="h-4 w-4" />
                Побудувати маршрут
              </a>
            </div>

            {expandedDealer === dealer.id && (
              <div
                id={`dealer-details-${dealer.id}`}
                className="mt-6 space-y-3 border-t border-border pt-6 text-sm"
              >
                <p className="font-medium">Додаткова інформація</p>
                <p className="text-muted-foreground">
                  Цей дилер пропонує повний спектр послуг: продаж шин Bridgestone, шиномонтаж,
                  балансування, зберігання шин та консультації.
                </p>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  <li>Наявність шин на складі</li>
                  <li>Можливість онлайн‑бронювання</li>
                  <li>Сервіс «шини на винос»</li>
                  <li>Гарантія на послуги</li>
                </ul>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>

    {hasMore && (
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setVisibleCount((prev) => prev + DEALERS_PER_PAGE)}
          className="flex items-center gap-2 rounded-full border border-stone-300 bg-transparent px-6 py-3 text-sm font-medium transition-colors hover:bg-stone-100 dark:border-stone-600 dark:hover:bg-stone-700"
        >
          <ChevronDown className="h-4 w-4" />
          Показати ще ({dealers.length - visibleCount} залишилось)
        </button>
      </div>
    )}
    </div>
  );
}
