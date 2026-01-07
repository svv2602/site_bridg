"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, ArrowRight } from "lucide-react";

const contactMethods = [
  {
    icon: Phone,
    title: "Телефон гарячої лінії",
    details: "0 800 123 456",
    subtitle: "Безкоштовно з усіх телефонів",
    action: "Зателефонувати",
    href: "tel:0800123456",
  },
  {
    icon: Mail,
    title: "Електронна пошта",
    details: "support@bridgestone.ua",
    subtitle: "Відповідь протягом 24 годин",
    action: "Написати",
    href: "mailto:support@bridgestone.ua",
  },
  {
    icon: MapPin,
    title: "Офіційне представництво",
    details: "м. Київ, вул. Прикладна, 10",
    subtitle: "Пн‑Пт 9:00–18:00",
    action: "Показати на карті",
    href: "#",
  },
  {
    icon: Clock,
    title: "Графік роботи",
    details: "Пн‑Пт: 9:00–18:00",
    subtitle: "Сб‑Нд: вихідні",
    action: "Дізнатися більше",
    href: "#",
  },
];

const faqs = [
  {
    question: "Як знайти найближчого дилера Bridgestone?",
    answer: "Скористайтеся інтерактивною картою в розділі «Де купити» або зателефонуйте на гарячу лінію.",
  },
  {
    question: "Чи можна замовити шини через сайт?",
    answer: "Наразі сайт не підтримує онлайн‑продаж, але ми допоможемо підібрати шини та знайти дилера.",
  },
  {
    question: "Які гарантії надаються на шини Bridgestone?",
    answer: "Гарантія виробника діє від 3 до 5 років залежно від моделі. Деталі уточнюйте у дилера.",
  },
  {
    question: "Чи можна отримати консультацію щодо підбору шин?",
    answer: "Так, наші експерти готові допомогти за телефоном або через форму зворотного зв'язку.",
  },
];

export default function ContactsPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-left text-zinc-50"
          >
            <nav className="mb-2 text-xs text-zinc-400">
              <span className="cursor-pointer hover:text-zinc-100">Головна</span>
              <span className="mx-2">/</span>
              <span className="font-medium text-zinc-100">Контакти</span>
            </nav>
            <h1 className="mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Зв’язок з Bridgestone Україна
              <span className="mt-1 block text-base font-normal text-zinc-300 md:text-lg">
                технічна підтримка, підбір шин та інформація про дилерів
              </span>
            </h1>
            <p className="mb-6 max-w-2xl text-sm text-zinc-300 md:text-base">
              Ми готові допомогти з вибором шин, пошуком офіційного дилера або відповісти на технічні
              запитання щодо продукції Bridgestone. Скористайтеся контактами нижче або формою зворотного
              зв’язку.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, idx) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-lg hover:border-primary/30"
              >
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3">
                  <method.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{method.title}</h3>
                <p className="mb-1 break-all text-xl font-bold text-secondary md:text-2xl">
                  {method.details}
                </p>
                <p className="mb-4 text-sm text-muted-foreground">{method.subtitle}</p>
                <a
                  href={method.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {method.action} <Send className="h-4 w-4" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form & Info */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-8 shadow-lg"
            >
              <h2 className="mb-6 text-2xl font-bold">Надішліть нам повідомлення</h2>
              <p className="mb-8 text-muted-foreground">
                Заповніть форму, і наші фахівці зв’язуться з вами найближчим часом.
              </p>
              <form className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Ім’я *</label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                      placeholder="Ваше ім'я"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Телефон *</label>
                    <input
                      type="tel"
                      required
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                      placeholder="+380 (__) ___ __ __"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Електронна пошта *</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Тема звернення</label>
                  <select className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                    <option>Оберіть тему</option>
                    <option>Питання щодо вибору шин</option>
                    <option>Пошук дилера / де купити</option>
                    <option>Гарантія та сервіс</option>
                    <option>Інше запитання</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Повідомлення *</label>
                  <textarea
                    rows={4}
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    placeholder="Опишіть ваше запитання або ситуацію..."
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Ми гарантуємо конфіденційність ваших даних</span>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-primary py-3.5 text-lg font-semibold text-white shadow-lg hover:bg-primary-dark"
                >
                  Надіслати запит
                </button>
              </form>
            </motion.div>

            {/* FAQ & Map */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/5 p-8"
              >
                <h3 className="mb-6 text-2xl font-bold">Часті запитання</h3>
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <h4 className="font-semibold text-secondary">{faq.question}</h4>
                      <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                <a
                  href="/advice"
                  className="mt-6 inline-flex items-center gap-2 text-primary hover:underline"
                >
                  Перейти до всіх питань <ArrowRight className="h-4 w-4" />
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="overflow-hidden rounded-2xl border border-border bg-gradient-to-tr from-primary/5 to-secondary/5 p-8"
              >
                <h3 className="mb-4 text-2xl font-bold">Ми на карті</h3>
                <div className="h-64 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-4 font-medium">Інтерактивна карта дилерів</p>
                    <p className="text-sm text-muted-foreground">
                      У фінальній версії тут буде вбудована карта з локаціями дилерів.
                    </p>
                    <button className="mt-4 rounded-full border border-primary bg-transparent px-6 py-2 text-primary hover:bg-primary/10">
                      Відкрити карту
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
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
            className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-10 text-white shadow-2xl"
          >
            <h3 className="mb-4 text-3xl font-bold">Потрібна негайна допомога?</h3>
            <p className="mb-8 text-lg opacity-90">
              Зателефонуйте на гарячу лінію або напишіть у месенджер — ми відповімо протягом 15 хвилин.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="rounded-full bg-white px-8 py-3 font-semibold text-primary hover:bg-gray-100">
                Зателефонувати зараз
              </button>
              <button className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white hover:bg-white/10">
                Написати в Telegram
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}