'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  heroTitle: 'Шини Bridgestone',
  heroSubtitle: 'Офіційний представник в Україні',
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
    <section className="hero-dark relative border-b border-hero-border py-8 md:py-12 hero-glow hero-grid-pattern overflow-hidden">
      <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            {/* Season badge */}
            <div className="hero-badge">
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
            <h1 className="hero-title text-3xl md:text-4xl lg:text-[2.9rem]">
              {isLoading ? (
                <span className="animate-pulse bg-white/20 rounded inline-block">
                  Технічний контроль на кожному кілометрі
                </span>
              ) : (
                seasonalData.heroTitle
              )}
              <span className="hero-subtitle mt-1 block text-base md:text-lg">
                {isLoading ? (
                  <span className="animate-pulse">
                    літні, зимові та всесезонні шини під ваш стиль водіння
                  </span>
                ) : (
                  seasonalData.heroSubtitle
                )}
              </span>
            </h1>

            <p className="hero-text max-w-xl text-sm md:text-base">
              Підбір шин за параметрами авто, типорозміром та сценаріями використання —
              інтерфейс у більш «технічному» стилі, узгодженому з сторінкою пошуку шин.
            </p>

            <ul className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 md:text-sm">
              <li className="flex items-start gap-3 text-hero-muted">
                <div className="mt-1 rounded-full bg-hero-accent p-1">
                  <Car className="h-3 w-3" />
                </div>
                <span>{t('hero.searchBySize')}</span>
              </li>
              <li className="flex items-start gap-3 text-hero-muted">
                <div className="mt-1 rounded-full bg-hero-accent p-1">
                  <Shield className="h-3 w-3" />
                </div>
                <span>{t('hero.catalogDescription')}</span>
              </li>
              <li className="flex items-start gap-3 text-hero-muted">
                <div className="mt-1 rounded-full bg-hero-accent p-1">
                  <MapPin className="h-3 w-3" />
                </div>
                <span>{t('hero.dealersMap')}</span>
              </li>
              <li className="flex items-start gap-3 text-hero-muted">
                <div className="mt-1 rounded-full bg-hero-accent p-1">
                  <Zap className="h-3 w-3" />
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
            {/* Season visual card with tyre image */}
            <div className={`hero-card relative h-64 overflow-hidden lg:h-80 ${seasonalData.featuredSeason ? `bg-gradient-to-br ${seasonalData.gradient}` : ''}`}>
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
              <div className="absolute bottom-0 left-0 right-0 border-t border-hero-border bg-black/50 backdrop-blur-sm p-6">
                <h3 className="text-xl font-semibold text-hero-foreground">
                  {seasonalData.featuredSeason === 'summer'
                    ? t('hero.readyForSummer')
                    : seasonalData.featuredSeason === 'winter'
                    ? t('hero.readyForWinter')
                    : t('hero.readyForAny')}
                </h3>
                <p className="text-sm text-hero-muted">
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
