'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Car, Shield, MapPin, Zap, Sun, Snowflake } from 'lucide-react';
import { getSeasonalContent } from '@/lib/api/payload';
import { t } from '@/lib/i18n';

// Mapping сезон → зображення шини для hero
const heroImages: Record<string, string> = {
  summer: '/images/hero/turanza-hero.png',
  winter: '/images/hero/blizzak-hero.png',
  'all-season': '/images/hero/turanza-all-season-hero.png',
  default: '/images/hero/turanza-hero.png',
};

interface SeasonalData {
  heroTitle: string;
  heroSubtitle: string;
  featuredSeason: 'summer' | 'winter' | null;
  gradient: string;
  ctaText: string;
  ctaLink: string;
}

const defaultData: SeasonalData = {
  heroTitle: 'Безпека на кожному кілометрі',
  heroSubtitle: 'Bridgestone & Firestone — офіційний представник в Україні',
  featuredSeason: null,
  gradient: 'from-stone-800 to-stone-900',
  ctaText: 'Переглянути каталог',
  ctaLink: '/passenger-tyres',
};

interface SeasonalHeroProps {
  children?: React.ReactNode; // For the Quick Search form
}

export function SeasonalHero({ children }: SeasonalHeroProps) {
  const [seasonalData, setSeasonalData] = useState<SeasonalData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function fetchSeasonalData() {
      try {
        const data = await getSeasonalContent();
        setSeasonalData(data as SeasonalData);
      } catch (error) {
        console.warn('Failed to fetch seasonal content, using defaults:', error);
        setSeasonalData(defaultData);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSeasonalData();
    // Trigger animation after mount
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const SeasonIcon = seasonalData.featuredSeason === 'winter' ? Snowflake : Sun;

  return (
    <section className="hero-adaptive relative py-8 md:py-12 overflow-hidden">
      <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div
            className="space-y-5"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(-18px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
            }}
          >
            {/* Season badge */}
            <div className="hero-badge-adaptive">
              {seasonalData.featuredSeason ? (
                <>
                  <SeasonIcon className="h-4 w-4" />
                  {seasonalData.featuredSeason === 'summer' ? t('hero.summerSeason') : t('hero.winterSeason')}
                </>
              ) : (
                <>
                  <Star className="h-4 w-4" />
                  {t('hero.officialSite')}
                </>
              )}
            </div>

            {/* Dynamic Title */}
            <h1 className="hero-title-adaptive text-3xl md:text-4xl lg:text-[2.9rem]">
              {isLoading ? (
                <span className="animate-pulse bg-stone-300 dark:bg-white/20 rounded inline-block">
                  Технічний контроль на кожному кілометрі
                </span>
              ) : (
                seasonalData.heroTitle
              )}
              <span className="hero-subtitle-adaptive mt-1 block text-base md:text-lg">
                {isLoading ? (
                  <span className="animate-pulse">
                    літні, зимові та всесезонні шини під ваш стиль водіння
                  </span>
                ) : (
                  seasonalData.heroSubtitle
                )}
              </span>
            </h1>

            <p className="hero-text-adaptive max-w-xl text-sm md:text-base">
              Оберіть шини, які підходять саме вам — за розміром, сезоном
              або маркою автомобіля. Офіційна гарантія та мережа дилерів по всій Україні.
            </p>

            <ul className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 md:text-sm">
              <li className="flex items-start gap-3 text-stone-500 dark:text-stone-400">
                <div className="mt-1 rounded-full bg-blue-500/15 p-1">
                  <Car className="h-3 w-3 text-blue-500" />
                </div>
                <span>{t('hero.searchBySize')}</span>
              </li>
              <li className="flex items-start gap-3 text-stone-500 dark:text-stone-400">
                <div className="mt-1 rounded-full bg-emerald-500/15 p-1">
                  <Shield className="h-3 w-3 text-emerald-500" />
                </div>
                <span>{t('hero.catalogDescription')}</span>
              </li>
              <li className="flex items-start gap-3 text-stone-500 dark:text-stone-400">
                <div className="mt-1 rounded-full bg-rose-500/15 p-1">
                  <MapPin className="h-3 w-3 text-rose-500" />
                </div>
                <span>{t('hero.dealersMap')}</span>
              </li>
              <li className="flex items-start gap-3 text-stone-500 dark:text-stone-400">
                <div className="mt-1 rounded-full bg-amber-500/15 p-1">
                  <Zap className="h-3 w-3 text-amber-500" />
                </div>
                <span>{t('hero.tyreAdvice')}</span>
              </li>
            </ul>

            {/* Seasonal CTA */}
            {seasonalData.featuredSeason && !isLoading && (
              <Link
                href={seasonalData.ctaLink}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-stone-700 hover:scale-105 hover:shadow-xl dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
              >
                <SeasonIcon className="h-4 w-4" />
                {seasonalData.ctaText}
              </Link>
            )}
          </div>

          {/* Right side - Quick Search */}
          <div
            className="space-y-6"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
            }}
          >
            {/* Season visual card with tyre image */}
            <div className={`hero-card-adaptive relative h-64 overflow-hidden lg:h-80 ${seasonalData.featuredSeason ? `bg-gradient-to-br ${seasonalData.gradient}` : ''}`}>
              {/* Tyre image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-48 w-48 md:h-56 md:w-56 lg:h-64 lg:w-64 transform transition-transform duration-500 hover:scale-105">
                  <Image
                    src={heroImages[seasonalData.featuredSeason || 'default']}
                    alt={`Bridgestone ${seasonalData.featuredSeason === 'winter' ? 'Blizzak' : 'Turanza'}`}
                    fill
                    className="object-contain drop-shadow-2xl"
                    sizes="(max-width: 768px) 192px, (max-width: 1024px) 224px, 256px"
                    priority
                  />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 border-t border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-black/50 backdrop-blur-sm p-6">
                <h3 className="text-xl font-semibold text-stone-900 dark:text-white">
                  {seasonalData.featuredSeason === 'summer'
                    ? t('hero.readyForSummer')
                    : seasonalData.featuredSeason === 'winter'
                    ? t('hero.readyForWinter')
                    : t('hero.readyForAny')}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {seasonalData.featuredSeason === 'summer'
                    ? t('hero.summerDescription')
                    : seasonalData.featuredSeason === 'winter'
                    ? t('hero.winterDescription')
                    : t('hero.anyWeatherDescription')}
                </p>
              </div>
            </div>

            {/* Quick Search Form passed as children */}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
