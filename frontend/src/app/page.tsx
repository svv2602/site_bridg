"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Car, Shield, Zap, Sun, Snowflake, Cloud, ChevronRight, Star, Users, Globe, Clock } from "lucide-react";

const tyreCategories = [
  {
    id: "summer",
    name: "Літні шини",
    description: "Для теплої пори року, оптимальні для сухого та мокрого асфальту.",
    icon: Sun,
    color: "from-orange-500 to-yellow-500",
  },
  {
    id: "winter",
    name: "Зимові шини",
    description: "Максимальне зчеплення на снігу та льоду в зимових умовах.",
    icon: Snowflake,
    color: "from-blue-500 to-cyan-400",
  },
  {
    id: "allseason",
    name: "Всесезонні шини",
    description: "Компромісне рішення для помірного клімату без екстремальних умов.",
    icon: Cloud,
    color: "from-gray-500 to-gray-300",
  },
];

const featuredTyres = [
  {
    name: "Bridgestone Turanza T005",
    tag: "Літня • Легковий авто",
    description: "Комфорт і контроль на мокрій дорозі для щоденних поїздок містом і трасою.",
    rating: 4.8,
  },
  {
    name: "Bridgestone Blizzak LM005",
    tag: "Зимова • Легковий / SUV",
    description: "Відмінне зчеплення на снігу та мокрому асфальті для безпечної зими.",
    rating: 4.9,
  },
  {
    name: "Bridgestone Weather Control A005",
    tag: "Всесезонна • Легковий авто",
    description: "Цілорічне рішення з акцентом на дощову та змінну погоду.",
    rating: 4.7,
  },
];

const articles = [
  {
    title: "Як обрати шини для міста та траси",
    readingTime: "4 хвилини читання",
    category: "Поради",
  },
  {
    title: "Як читати маркування шин: повний гід",
    readingTime: "6 хвилин читання",
    category: "Освіта",
  },
  {
    title: "Коли змінювати сезонні шини в Україні",
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

type SearchTab = "size" | "car";

export default function Home() {
  const [activeTab, setActiveTab] = useState<SearchTab>("size");

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-5 text-zinc-50"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-200 ring-1 ring-zinc-700">
                <Star className="h-4 w-4 text-zinc-100" />
                Офіційний сайт шин Bridgestone в Україні
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.9rem]">
                Технічний контроль на кожному кілометрі
                <span className="mt-1 block text-base font-normal text-zinc-100 md:text-lg">
                  літні, зимові та всесезонні шини під ваш стиль водіння
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
                  <span>Пошук шин за розміром та маркою авто</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-zinc-800 p-1">
                    <Shield className="h-3 w-3 text-zinc-200" />
                  </div>
                  <span>Каталог літніх, зимових та всесезонних шин</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-zinc-800 p-1">
                    <MapPin className="h-3 w-3 text-zinc-200" />
                  </div>
                  <span>Карта офіційних дилерів та партнерів</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-zinc-800 p-1">
                    <Zap className="h-3 w-3 text-zinc-200" />
                  </div>
                  <span>Поради щодо вибору та експлуатації шин</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="relative h-64 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-800 lg:h-80">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car className="h-40 w-40 text-zinc-700" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900/95 p-6">
                  <h3 className="text-xl font-semibold text-zinc-50">Готові до будь‑якої погоди</h3>
                  <p className="text-sm text-zinc-100">
                    Місто, траса чи зима — оберіть шини під свої маршрути.
                  </p>
                </div>
              </div>

              {/* Quick Search */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 text-zinc-50 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                <h2 className="text-xl font-semibold">Швидкий пошук шин</h2>
                <p className="mt-1 text-sm text-zinc-100">
                  Виберіть спосіб пошуку: за розміром або за вашим автомобілем.
                </p>

                <div className="mt-4 flex rounded-full bg-zinc-800 p-1 text-sm font-medium ring-1 ring-zinc-700">
                  <button
                    type="button"
                    className={`flex-1 rounded-full px-4 py-2 transition-colors ${
                      activeTab === "size"
                        ? "bg-zinc-50 text-zinc-900"
                        : "text-zinc-300 hover:text-zinc-50"
                    }`}
                    onClick={() => setActiveTab("size")}
                  >
                    За розміром
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-full px-4 py-2 transition-colors ${
                      activeTab === "car"
                        ? "bg-zinc-50 text-zinc-900"
                        : "text-zinc-300 hover:text-zinc-50"
                    }`}
                    onClick={() => setActiveTab("car")}
                  >
                    За авто
                  </button>
                </div>

                {activeTab === "size" ? (
                  <form className="mt-6 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-100">Ширина</label>
                        <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                          <option value="">Оберіть</option>
                          <option>195</option>
                          <option>205</option>
                          <option>215</option>
                          <option>225</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-100">Висота профілю</label>
                        <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                          <option value="">Оберіть</option>
                          <option>55</option>
                          <option>60</option>
                          <option>65</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-100">Діаметр</label>
                        <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                          <option value="">Оберіть</option>
                          <option>15</option>
                          <option>16</option>
                          <option>17</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-100">Сезонність</label>
                      <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                        <option value="">Не важливо</option>
                        <option>Літні</option>
                        <option>Зимові</option>
                        <option>Всесезонні</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="mt-2 w-full rounded-full bg-zinc-50 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white"
                    >
                      Знайти шини
                    </button>
                    <p className="text-xs text-muted-foreground">
                      Пізніше пошук буде підключено до каталогу шин Bridgestone.
                    </p>
                  </form>
                ) : (
                  <form className="mt-6 space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-100">Марка авто</label>
                      <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                        <option value="">Оберіть марку</option>
                        <option>BMW</option>
                        <option>Mercedes-Benz</option>
                        <option>Toyota</option>
                        <option>Volkswagen</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-100">Модель</label>
                        <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                          <option value="">Оберіть модель</option>
                          <option>3 Series</option>
                          <option>C-Class</option>
                          <option>Corolla</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-zinc-100">Рік випуску</label>
                        <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                          <option value="">Рік</option>
                          <option>2015</option>
                          <option>2018</option>
                          <option>2020</option>
                          <option>2023</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-100">Тип шини</label>
                      <select className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 outline-none focus:border-primary">
                        <option>Не важливо</option>
                        <option>Літня</option>
                        <option>Зимова</option>
                        <option>Всесезонна</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="mt-2 w-full rounded-full bg-zinc-50 py-3 text-sm font-semibold text-zinc-900 shadow-lg ring-2 ring-zinc-400 hover:bg-white"
                    >
                      Підібрати шини
                    </button>
                    <p className="text-xs text-muted-foreground">
                      У продакшн‑версії результат буде сформовано на основі бази авто та
                      рекомендованих типорозмірів Bridgestone.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

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
                    <button className="rounded-full border border-border bg-transparent px-4 py-2 text-sm font-semibold hover:bg-card">
                      Перейти
                    </button>
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
                        <button className="rounded-full border border-border bg-transparent px-4 py-1.5 text-sm font-semibold hover:bg-card">
                          Детальніше
                        </button>
                        <button className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark">
                          Знайти дилера
                        </button>
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
                <button className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Читати статтю <ChevronRight className="h-4 w-4" />
                </button>
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
              <button className="rounded-full bg-white px-8 py-3 font-semibold text-primary hover:bg-gray-100">
                Отримати консультацію
              </button>
              <button className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10">
                Зателефонувати
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}