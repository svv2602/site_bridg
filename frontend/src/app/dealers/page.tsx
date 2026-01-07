"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MOCK_DEALERS, type Dealer } from "@/lib/data";
import { Search, MapPin, Phone, Globe, Clock, Navigation, Filter, ChevronDown } from "lucide-react";
import { generateLocalBusinessSchema, generateBreadcrumbSchema, jsonLdScript } from "@/lib/schema";
import DealersMap from "@/components/DealersMap";

type FilteredDealer = Dealer & {
  displayAddress: string;
};

const dealerTypes = [
  { key: "all", label: "Всі типи" },
  { key: "official", label: "Офіційний дилер" },
  { key: "partner", label: "Партнер" },
  { key: "service", label: "Сервісний центр" },
];

// Note: Metadata is defined in layout.tsx for client components

export default function DealersPage() {
  const [cityQuery, setCityQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [expandedDealer, setExpandedDealer] = useState<string | null>(null);

  const normalizedQuery = cityQuery.trim().toLowerCase();

  const dealers: FilteredDealer[] = useMemo(
    () =>
      MOCK_DEALERS.map((d) => ({
        ...d,
        displayAddress: [d.city, d.address].filter(Boolean).join(", "),
      })),
    [],
  );

  const filteredDealers = useMemo(() => {
    let filtered = dealers;
    if (normalizedQuery) {
      filtered = filtered.filter((dealer) => {
        const city = dealer.city?.toLowerCase() ?? "";
        const address = dealer.address?.toLowerCase() ?? "";
        return city.includes(normalizedQuery) || address.includes(normalizedQuery);
      });
    }
    if (selectedType !== "all") {
      filtered = filtered.filter((dealer) => dealer.type === selectedType);
    }
    return filtered;
  }, [dealers, normalizedQuery, selectedType]);

  const dealerSchemas = MOCK_DEALERS.map((dealer) => generateLocalBusinessSchema(dealer));
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Головна", url: "https://bridgestone.ua/" },
    { name: "Де купити", url: "https://bridgestone.ua/dealers" },
  ]);

  return (
    <div className="bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
      />
      {dealerSchemas.map((schema, idx) => (
        <script
          key={`dealer-schema-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(schema) }}
        />
      ))}
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto flex max-w-4xl flex-col gap-4 text-left text-zinc-50 md:gap-5"
          >
            <nav className="mb-1 text-xs text-zinc-400">
              <span className="cursor-pointer hover:text-zinc-100">Головна</span>
              <span className="mx-2">/</span>
              <span className="font-medium text-zinc-100">Дилери / Де купити</span>
            </nav>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Пошук офіційних дилерів Bridgestone
              <span className="mt-1 block text-base font-normal text-zinc-300 md:text-lg">
                використовуйте технічний пошук за містом, адресою та типом точки
              </span>
            </h1>
            <p className="max-w-2xl text-sm text-zinc-300 md:text-base">
              Фільтруйте офіційні точки продажу та сервісні партнери Bridgestone по всій Україні.
              Дизайн секції узгоджений зі сторінкою пошуку шин у більш «технічному» стилі.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 text-zinc-50 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                <h2 className="mb-4 text-2xl font-semibold">Пошук дилерів</h2>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-medium text-zinc-100">
                      Місто або адреса
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Наприклад, Київ, Львів..."
                        value={cityQuery}
                        onChange={(e) => setCityQuery(e.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-zinc-50 outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <label className="mb-2 block text-sm font-medium text-zinc-100">Тип точки</label>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-8 text-sm text-zinc-50 outline-none focus:border-primary"
                      >
                        {dealerTypes.map((type) => (
                          <option key={type.key} value={type.key}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-300">
                      Знайдено дилерів:{" "}
                      <span className="text-2xl font-bold text-zinc-50">{filteredDealers.length}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCityQuery("");
                      setSelectedType("all");
                    }}
                    className="rounded-full border border-zinc-400 bg-transparent px-5 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
                  >
                    Скинути фільтри
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Map */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <MapPin className="h-5 w-5 text-primary" />
                Інтерактивна карта
              </h3>
              <div className="h-80 overflow-hidden rounded-xl">
                <DealersMap
                  dealers={MOCK_DEALERS}
                  selectedDealerId={expandedDealer}
                  onDealerSelect={(id) => setExpandedDealer(id)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dealers List */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-8 text-3xl font-bold">Список дилерів</h2>
          {filteredDealers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-border bg-card p-12 text-center"
            >
              <Search className="mx-auto h-12 w-12 text-muted" />
              <h3 className="mt-4 text-xl font-semibold">Дилерів не знайдено</h3>
              <p className="mt-2 text-muted-foreground">
                Спробуйте змінити параметри пошуку або обрати інше місто.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDealers.map((dealer, idx) => (
                <motion.article
                  key={dealer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-xl"
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${dealer.type === "official"
                              ? "bg-primary/10 text-primary"
                              : dealer.type === "partner"
                                ? "bg-secondary/10 text-secondary"
                                : "bg-green-500/10 text-green-600"
                            }`}
                        >
                          {dealer.type === "official"
                            ? "Офіційний дилер"
                            : dealer.type === "partner"
                              ? "Партнер"
                              : "Сервісний центр"}
                        </span>
                        <h3 className="mt-3 text-xl font-bold group-hover:text-primary transition-colors">
                          {dealer.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{dealer.displayAddress}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dealer.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted">Телефон</p>
                            <a
                              href={`tel:${dealer.phone}`}
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {dealer.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {dealer.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-xs text-muted">Вебсайт</p>
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
                            <p className="text-xs text-muted">Години роботи</p>
                            <p className="font-medium">{dealer.workingHours}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <button
                        onClick={() => setExpandedDealer(expandedDealer === dealer.id ? null : dealer.id)}
                        className="rounded-full border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-card"
                      >
                        {expandedDealer === dealer.id ? "Менше" : "Детальніше"}
                      </button>
                      <button className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
                        Побудувати маршрут
                      </button>
                    </div>

                    {expandedDealer === dealer.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
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
                      </motion.div>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
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
            <h3 className="mb-4 text-3xl font-bold">Не знайшли потрібного дилера?</h3>
            <p className="mb-8 text-lg opacity-90">
              Зв’яжіться з нами напряму — ми допоможемо знайти найближчу точку продажу
              або організуємо доставку шин у ваше місто.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="rounded-full bg-white px-8 py-3 font-semibold text-primary hover:bg-gray-100">
                Зателефонувати
              </button>
              <button className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10">
                Заповнити форму
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}