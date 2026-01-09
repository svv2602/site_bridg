import { NextResponse } from 'next/server'

export async function GET() {
  const month = new Date().getMonth() + 1

  let season: 'spring' | 'autumn' | 'default' = 'default'
  if (month >= 3 && month <= 4) season = 'spring'
  if (month >= 10 && month <= 11) season = 'autumn'

  const seasonConfig = {
    spring: {
      heroTitle: 'Час переходити на літні шини',
      heroSubtitle: 'Температура стабільно вище +7°C — оптимальний час для заміни',
      featuredSeason: 'summer',
      gradient: 'from-orange-500 to-yellow-500',
      ctaText: 'Переглянути літні шини',
      ctaLink: '/passenger-tyres?season=summer',
    },
    autumn: {
      heroTitle: 'Готуйтесь до зими завчасно',
      heroSubtitle: 'Перші заморозки вже близько — оберіть надійні зимові шини',
      featuredSeason: 'winter',
      gradient: 'from-blue-500 to-cyan-400',
      ctaText: 'Переглянути зимові шини',
      ctaLink: '/passenger-tyres?season=winter',
    },
    default: {
      heroTitle: 'Шини Bridgestone',
      heroSubtitle: 'Офіційний представник в Україні',
      featuredSeason: null,
      gradient: 'from-zinc-800 to-zinc-900',
      ctaText: 'Переглянути каталог',
      ctaLink: '/passenger-tyres',
    },
  }

  return NextResponse.json(seasonConfig[season])
}
