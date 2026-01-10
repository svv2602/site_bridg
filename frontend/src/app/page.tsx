"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Zap, Sun, Snowflake, Cloud, ChevronRight, Star, Users, Globe, Phone } from "lucide-react";
import { SeasonalHero } from "@/components/SeasonalHero";
import { QuickSearchForm } from "@/components/QuickSearchForm";

const tyreCategories = [
  {
    id: "summer",
    name: "Літні шини",
    description: "Для теплої пори року, оптимальні для сухого та мокрого асфальту.",
    icon: Sun,
    color: "from-orange-500 to-yellow-500",
    href: "/passenger-tyres?season=summer",
  },
  {
    id: "winter",
    name: "Зимові шини",
    description: "Максимальне зчеплення на снігу та льоду в зимових умовах.",
    icon: Snowflake,
    color: "from-blue-500 to-cyan-400",
    href: "/passenger-tyres?season=winter",
  },
  {
    id: "allseason",
    name: "Всесезонні шини",
    description: "Компромісне рішення для помірного клімату без екстремальних умов.",
    icon: Cloud,
    color: "from-gray-500 to-gray-300",
    href: "/passenger-tyres?season=all-season",
  },
];

const featuredTyres = [
  {
    name: "Bridgestone Turanza T005",
    slug: "turanza-t005",
    tag: "Літня • Легковий авто",
    description: "Комфорт і контроль на мокрій дорозі для щоденних поїздок містом і трасою.",
    rating: 4.8,
  },
  {
    name: "Bridgestone Blizzak LM005",
    slug: "blizzak-lm005",
    tag: "Зимова • Легковий / SUV",
    description: "Відмінне зчеплення на снігу та мокрому асфальті для безпечної зими.",
    rating: 4.9,
  },
  {
    name: "Bridgestone Weather Control A005",
    slug: "weather-control-a005",
    tag: "Всесезонна • Легковий авто",
    description: "Цілорічне рішення з акцентом на дощову та змінну погоду.",
    rating: 4.7,
  },
];

const articles = [
  {
    title: "Як обрати шини для міста та траси",
    slug: "yak-obraty-shyny-dlya-mista-ta-trasy",
    readingTime: "4 хвилини читання",
    category: "Поради",
  },
  {
    title: "Як читати маркування шин: повний гід",
    slug: "yak-chytaty-markuvannya-shyn",
    readingTime: "6 хвилин читання",
    category: "Освіта",
  },
  {
    title: "Коли змінювати сезонні шини в Україні",
    slug: "koly-zminyuvaty-sezonni-shyny",
    readingTime: "3 хвилини читання",
    category: "Сезонність",
  },
];

const features = [
  {
    icon: Shield,
    title: "Безпека на першому місці",
    description: "Технології, що забезпечують надійне зчеплення в будь-яких умовах.",
  },
  {
    icon: Zap,
    title: "Економія палива",
    description: "Знижений опір коченню для зменшення витрат на пального.",
  },
  {
    icon: Users,
    title: "Експертна підтримка",
    description: "Консультації від офіційних дилерів та сервісних центрів.",
  },
  {
    icon: Globe,
    title: "Глобальна якість",
    description: "Продукція, що відповідає міжнародним стандартам безпеки.",
  },
];

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero with Seasonal Content */}
      <SeasonalHero>
        <QuickSearchForm />
      </SeasonalHero>

      {/* Features */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold">Чому обирають Bridgestone</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Поєднання інновацій, безпеки та довіри мільйонів водіїв по всьому світу.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-lg"
              >
                <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <feat.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{feat.title}</h3>
                <p className="text-sm text-muted-foreground">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories & Popular */}
      <section className="py-12 bg-background">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">Шини за сезоном</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Оберіть тип шин, який відповідає умовам експлуатації вашого авто.
              </p>
              <div className="space-y-4">
                {tyreCategories.map((cat, idx) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className={`rounded-full bg-gradient-to-br ${cat.color} p-3`}>
                      <cat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                    <Link
                      href={cat.href}
                      className="rounded-full border border-border bg-transparent px-4 py-2 text-sm font-semibold hover:bg-card"
                    >
                      Перейти
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-6 text-3xl font-bold">Популярні моделі шин</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Обрані моделі Bridgestone для найпоширеніших сценаріїв водіння.
              </p>
              <div className="space-y-6">
                {featuredTyres.map((tyre, idx) => (
                  <motion.div
                    key={tyre.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="mt-1 h-12 w-12 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{tyre.name}</h3>
                      <p className="text-sm uppercase tracking-wide text-primary">{tyre.tag}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{tyre.description}</p>
                      <div className="mt-3 flex gap-3">
                        <Link
                          href={`/shyny/${tyre.slug}`}
                          className="rounded-full border border-border bg-transparent px-4 py-1.5 text-sm font-semibold hover:bg-card"
                        >
                          Детальніше
                        </Link>
                        <Link
                          href="/dealers"
                          className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
                        >
                          Знайти дилера
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold">Корисна інформація та поради</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Розбираємося, як правильно обирати, використовувати та обслуговувати шини Bridgestone.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {articles.map((article, idx) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {article.category}
                </div>
                <h3 className="mb-2 text-xl font-bold">{article.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{article.readingTime}</p>
                <p className="text-sm text-muted-foreground">
                  У цій статті будуть прості пояснення та практичні поради для водіїв в Україні.
                </p>
                <Link
                  href={`/advice/${article.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Читати статтю <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-primary p-10 text-white shadow-2xl"
          >
            <h3 className="mb-4 text-3xl font-bold">Потрібна допомога у виборі?</h3>
            <p className="mb-8 text-lg opacity-90">
              Наші експерти допоможуть підібрати ідеальні шини для вашого автомобіля
              з урахуванням стилю водіння, умов експлуатації та бюджету.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contacts"
                className="rounded-full bg-white px-8 py-3 font-semibold text-primary hover:bg-gray-100"
              >
                Отримати консультацію
              </Link>
              <a
                href="tel:+380800123456"
                className="inline-flex items-center gap-2 rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                Зателефонувати
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
