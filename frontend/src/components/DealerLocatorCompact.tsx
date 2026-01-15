'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Search, Phone, ChevronRight, Navigation } from 'lucide-react';
import type { Dealer } from '@/lib/data';

interface DealerLocatorCompactProps {
  initialDealers: Dealer[];
}

function DealerCardCompact({ dealer }: { dealer: Dealer }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex-shrink-0 rounded-full bg-rose-500/15 p-2">
        <MapPin className="h-5 w-5 text-rose-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm truncate">{dealer.name}</h4>
        <p className="text-xs text-muted-foreground truncate">{dealer.city}, {dealer.address}</p>
      </div>
      {dealer.phone && (
        <a
          href={`tel:${dealer.phone}`}
          className="flex-shrink-0 flex items-center justify-center rounded-full p-2 min-w-11 min-h-11 text-muted-foreground hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-primary transition-colors"
          aria-label={`Зателефонувати ${dealer.name}`}
        >
          <Phone className="h-4 w-4 text-green-500" />
        </a>
      )}
    </div>
  );
}

export function DealerLocatorCompact({ initialDealers }: DealerLocatorCompactProps) {
  const [query, setQuery] = useState('');

  // Filter dealers based on query
  const filteredDealers = useMemo(() => {
    if (!query.trim()) {
      return initialDealers.slice(0, 4);
    }

    const normalizedQuery = query.toLowerCase().trim();
    return initialDealers
      .filter((dealer) => {
        const city = dealer.city?.toLowerCase() || '';
        const name = dealer.name?.toLowerCase() || '';
        const address = dealer.address?.toLowerCase() || '';
        return (
          city.includes(normalizedQuery) ||
          name.includes(normalizedQuery) ||
          address.includes(normalizedQuery)
        );
      })
      .slice(0, 4);
  }, [query, initialDealers]);

  return (
    <section className="py-12 bg-stone-100 dark:bg-stone-800/50">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left: Search form */}
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-stone-200 px-3 py-1 text-xs font-medium text-stone-700 dark:bg-stone-700 dark:text-stone-200">
              <Navigation className="h-3 w-3 text-primary" />
              Офіційна мережа
            </div>
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Знайдіть найближчого дилера
            </h2>
            <p className="mb-6 text-muted-foreground">
              Введіть ваше місто для пошуку офіційних дилерів та сервісних центрів Bridgestone
            </p>

            {/* Search input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <input
                  type="text"
                  placeholder="Київ, Львів, Одеса..."
                  aria-label="Пошук дилера за містом або адресою"
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 py-3 pl-10 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Quick city links */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Популярні:</span>
              {['Київ', 'Львів', 'Одеса', 'Харків'].map((city) => (
                <button
                  key={city}
                  onClick={() => setQuery(city)}
                  className="rounded-full bg-white dark:bg-stone-800 px-3 py-1 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-text"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-3">
            {filteredDealers.length > 0 ? (
              <>
                {filteredDealers.map((dealer) => (
                  <DealerCardCompact key={dealer.id} dealer={dealer} />
                ))}
              </>
            ) : (
              <div className="rounded-xl border border-stone-200 dark:border-stone-700 bg-card p-6 text-center">
                <MapPin className="mx-auto mb-2 h-8 w-8 text-primary/50" />
                <p className="text-sm text-muted-foreground">
                  Дилерів за запитом &ldquo;{query}&rdquo; не знайдено
                </p>
              </div>
            )}

            {/* View all link */}
            <Link
              href="/dealers"
              className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-3 text-sm font-semibold transition-colors hover:bg-primary hover:text-primary-text hover:border-primary"
            >
              Переглянути всіх дилерів на карті
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
