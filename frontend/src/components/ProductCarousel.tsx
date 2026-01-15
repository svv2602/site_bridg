'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { TyreCard } from './TyreCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type TyreModel } from '@/lib/data';

interface ProductCarouselProps {
  tyres: TyreModel[];
  title?: string;
}

export function ProductCarousel({ tyres, title = 'Популярні моделі' }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Don't render if no tyres
  if (tyres.length === 0) {
    return null;
  }

  // If less than 4 tyres, show grid instead of carousel
  if (tyres.length < 4) {
    return (
      <section className="py-12 bg-stone-50 dark:bg-stone-900">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-8 text-2xl md:text-3xl font-bold text-center">{title}</h2>
          <div className="grid gap-6 pt-2 md:grid-cols-2 lg:grid-cols-3">
            {tyres.map((tyre) => (
              <div key={tyre.slug} className="h-full">
                <TyreCard tyre={tyre} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-stone-50 dark:bg-stone-900 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        </div>

        {/* Carousel with side navigation */}
        <div className="relative pt-2" role="region" aria-label="Карусель популярних шин">
          {/* Left navigation button - hidden on small mobile, visible from sm breakpoint */}
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 md:-translate-x-6 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-1.5 sm:p-2 md:p-3 shadow-lg transition-all hover:bg-stone-100 dark:hover:bg-stone-700 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed z-10"
            aria-label="Попередній слайд"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </button>

          {/* Carousel content - overflow-visible for hover effects, overflow-x-hidden for mobile safety */}
          <div className="overflow-x-clip overflow-y-visible mx-4 sm:mx-6 md:mx-10" ref={emblaRef}>
            <div className="flex touch-pan-y -ml-4">
              {tyres.map((tyre) => (
                <div
                  key={tyre.slug}
                  className="flex-[0_0_calc(100%-1rem)] min-w-0 pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
                >
                  <div className="h-full">
                    <TyreCard tyre={tyre} variant="compact" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right navigation button - smaller on mobile */}
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 md:translate-x-6 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-1.5 sm:p-2 md:p-3 shadow-lg transition-all hover:bg-stone-100 dark:hover:bg-stone-700 hover:shadow-xl disabled:opacity-30 disabled:cursor-not-allowed z-10"
            aria-label="Наступний слайд"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* View all link */}
        <div className="mt-8 text-center">
          <a
            href="/passenger-tyres"
            className="inline-flex items-center gap-2 rounded-full border border-primary bg-transparent px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-text"
          >
            Переглянути всі шини
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
