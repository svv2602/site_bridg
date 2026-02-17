import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send, ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui";
import { getSiteSettingsWithDefaults } from "@/lib/constants";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Контакти",
  description:
    "Зв'яжіться з Bridgestone Україна: гаряча лінія, електронна пошта, форма зворотного зв'язку. Консультація щодо підбору шин та пошук офіційних дилерів.",
  alternates: {
    canonical: "/contacts",
  },
  openGraph: {
    title: "Контакти — Bridgestone Україна",
    description:
      "Зв'яжіться з Bridgestone Україна: гаряча лінія, електронна пошта, форма зворотного зв'язку.",
  },
};

const faqs = [
  {
    question: "Як знайти найближчого дилера Bridgestone?",
    answer: "Скористайтеся інтерактивною картою в розділі \u00ABДе купити\u00BB або зателефонуйте на гарячу лінію.",
  },
  {
    question: "Чи можна замовити шини через сайт?",
    answer: "Наразі сайт не підтримує онлайн\u2011продаж, але ми допоможемо підібрати шини та знайти дилера.",
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

export default async function ContactsPage() {
  const settings = await getSiteSettingsWithDefaults();

  const contactMethods = [
    {
      icon: Phone,
      title: "Телефон гарячої лінії",
      details: settings.phoneDisplay,
      subtitle: "Безкоштовно з усіх телефонів",
      action: "Зателефонувати",
      href: settings.phoneHref,
      color: { bg: "bg-green-500/15", text: "text-green-500" },
    },
    {
      icon: Mail,
      title: "Електронна пошта",
      details: settings.emailSupport,
      subtitle: "Відповідь протягом 24 годин",
      action: "Написати",
      href: `mailto:${settings.emailSupport}`,
      color: { bg: "bg-blue-500/15", text: "text-blue-500" },
    },
    {
      icon: MapPin,
      title: "Офіційне представництво",
      details: settings.addressFull,
      subtitle: settings.workingHours,
      action: "Знайти дилера",
      href: "/dealers",
      color: { bg: "bg-rose-500/15", text: "text-rose-500" },
    },
    {
      icon: Clock,
      title: "Графік роботи",
      details: settings.workingHours,
      subtitle: "Сб\u2011Нд: вихідні",
      action: "Наші контакти",
      href: "#contact-form",
      color: { bg: "bg-amber-500/15", text: "text-amber-500" },
    },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-4xl text-left">
            <Breadcrumb
              className="hero-breadcrumb-adaptive mb-2"
              items={[
                { label: "Головна", href: "/" },
                { label: "Контакти" },
              ]}
            />
            <h1 className="hero-title-adaptive mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Зв&apos;язок з Bridgestone Україна
              <span className="hero-subtitle-adaptive mt-1 block text-base font-normal md:text-lg">
                технічна підтримка, підбір шин та інформація про дилерів
              </span>
            </h1>
            <p className="hero-text-adaptive mb-6 max-w-2xl text-sm md:text-base">
              Ми готові допомогти з вибором шин, пошуком офіційного дилера або відповісти на технічні
              запитання щодо продукції Bridgestone. Скористайтеся контактами нижче або формою зворотного
              зв&apos;язку.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="group rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-lg hover:border-primary/30"
              >
                <div className={`mb-4 inline-flex rounded-full ${method.color.bg} p-3`}>
                  <method.icon className={`h-6 w-6 ${method.color.text}`} />
                </div>
                <div className="heading-2 mb-2 text-lg font-semibold">{method.title}</div>
                <p className="mb-1 break-all text-xl font-bold text-secondary md:text-2xl">
                  {method.details}
                </p>
                <p className="mb-4 text-sm text-muted-foreground">{method.subtitle}</p>
                {method.href.startsWith('/') ? (
                  <Link
                    href={method.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {method.action} <Send className="h-4 w-4" />
                  </Link>
                ) : (
                  <a
                    href={method.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {method.action} <Send className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form & Info */}
      <section className="py-12" id="contact-form">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form — client component */}
            <ContactForm />

            {/* FAQ & Map — server-rendered */}
            <div className="space-y-8">
              <div
                className="rounded-2xl border border-border bg-gradient-to-br from-card to-secondary/5 p-8"
              >
                <div className="heading-2 mb-6 text-2xl font-bold">Часті запитання</div>
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <div className="heading-3 font-semibold text-secondary">{faq.question}</div>
                      <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/blog?tag=FAQ"
                  className="mt-6 inline-flex items-center gap-2 text-primary hover:underline"
                >
                  Більше питань та відповідей <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div
                className="overflow-hidden rounded-2xl border border-border bg-gradient-to-tr from-primary/5 to-secondary/5 p-8"
              >
                <div className="heading-2 mb-4 text-2xl font-bold">Ми на карті</div>
                <div className="h-64 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-4 font-medium">Інтерактивна карта дилерів</p>
                    <p className="text-sm text-muted-foreground">
                      Знайдіть найближчого офіційного дилера Bridgestone.
                    </p>
                    <Link
                      href="/dealers"
                      className="mt-4 inline-block rounded-full border border-primary bg-transparent px-6 py-2 text-primary hover:bg-stone-100 dark:hover:bg-stone-700"
                    >
                      Відкрити карту
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <div
            className="rounded-3xl bg-graphite p-10 text-white shadow-2xl dark:ring-1 dark:ring-stone-700"
          >
            <div className="heading-2 mb-4 text-3xl font-bold">Потрібна негайна допомога?</div>
            <p className="mb-8 text-lg">
              Зателефонуйте на гарячу лінію або напишіть у месенджер — ми відповімо протягом 15 хвилин.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={settings.phoneHref}
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-graphite transition-colors hover:bg-stone-100"
              >
                <Phone className="h-4 w-4" />
                Зателефонувати зараз
              </a>
              <a
                href={settings.socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white bg-transparent px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Написати в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
