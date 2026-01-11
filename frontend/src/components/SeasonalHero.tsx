'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, Car, Shield, MapPin, Zap, Sun, Snowflake } from 'lucide-react';
import { getSeasonalContent } from '@/lib/api/payload';
import { t } from '@/lib/i18n';

interface SeasonalData {
  heroTitle: string;
  heroSubtitle: string;
  featuredSeason: 'summer' | 'winter' | null;
  gradient: string;
  ctaText: string;
  ctaLink: string;
}

const defaultData: SeasonalData = {
  heroTitle: 'Шини Bridgestone',
  heroSubtitle: 'Офіційний представник в Україні',
  featuredSeason: null,
  gradient: 'from-zinc-800 to-zinc-900',
  ctaText: 'Переглянути каталог',
  ctaLink: '/passenger-tyres',
};

interface SeasonalHeroProps {
  children?: React.ReactNode; // For the Quick Search form
}

export function SeasonalHero({ children }: SeasonalHeroProps) {
  const [seasonalData, setSeasonalData] = useState<SeasonalData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  const SeasonIcon = seasonalData.featuredSeason === 'winter' ? Snowflake : Sun;

  return (
    <section className={`border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12`}>
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-5 text-zinc-50"
          >
            {/* Season badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-200 ring-1 ring-zinc-700">
              {seasonalData.featuredSeason ? (
                <>
                  <SeasonIcon className="h-4 w-4 text-zinc-100" />
                  {seasonalData.featuredSeason === 'summer' ? t('hero.summerSeason') : t('hero.winterSeason')}
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 text-zinc-100" />
                  {t('hero.officialSite')}
                </>
              )}
            </div>

            {/* Dynamic Title */}
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
              {isLoading ? (
                <span className="animate-pulse bg-zinc-700 rounded">
                  Технічний контроль на кожному кілометрі
                </span>
              ) : (
                seasonalData.heroTitle
              )}
              <span className="mt-1 block text-base font-normal text-zinc-100 md:text-lg">
                {isLoading ? (
                  <span className="animate-pulse">
                    літні, зимові та всесезонні шини під ваш стиль водіння
                  </span>
                ) : (
                  seasonalData.heroSubtitle
                )}
              </span>
            </h1>

            <p className="max-w-xl text-sm text-zinc-100 md:text-base">
              Підбір шин за параметрами авто, типорозміром та сценаріями використання —
              інтерфейс у більш «технічному» стилі, узгодженому з сторінкою пошуку шин.
            </p>

            <ul className="grid grid-cols-1 gap-3 text-xs text-zinc-200 sm:grid-cols-2 md:text-sm">
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-zinc-800 p-1">
                  <Car className="h-3 w-3 text-zinc-200" />
                </div>
                <span>{t('hero.searchBySize')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-zinc-800 p-1">
                  <Shield className="h-3 w-3 text-zinc-200" />
                </div>
                <span>{t('hero.catalogDescription')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-zinc-800 p-1">
                  <MapPin className="h-3 w-3 text-zinc-200" />
                </div>
                <span>{t('hero.dealersMap')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-zinc-800 p-1">
                  <Zap className="h-3 w-3 text-zinc-200" />
                </div>
                <span>{t('hero.tyreAdvice')}</span>
              </li>
            </ul>

            {/* Seasonal CTA */}
            {seasonalData.featuredSeason && !isLoading && (
              <Link
                href={seasonalData.ctaLink}
                className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${seasonalData.gradient} px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity`}
              >
                <SeasonIcon className="h-4 w-4" />
                {seasonalData.ctaText}
              </Link>
            )}
          </motion.div>

          {/* Right side - Quick Search */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Season visual card */}
            <div className={`relative h-64 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br ${seasonalData.featuredSeason ? seasonalData.gradient : 'from-zinc-900 to-zinc-800'} lg:h-80`}>
              <div className="absolute inset-0 flex items-center justify-center">
                {seasonalData.featuredSeason ? (
                  <SeasonIcon className="h-40 w-40 text-white/20" />
                ) : (
                  <Car className="h-40 w-40 text-zinc-700" />
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900/95 p-6">
                <h3 className="text-xl font-semibold text-zinc-50">
                  {seasonalData.featuredSeason === 'summer'
                    ? t('hero.readyForSummer')
                    : seasonalData.featuredSeason === 'winter'
                    ? t('hero.readyForWinter')
                    : t('hero.readyForAny')}
                </h3>
                <p className="text-sm text-zinc-100">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
