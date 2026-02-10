"use client";

import { useState, useRef, useEffect } from "react";

import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Breadcrumb, Button } from "@/components/ui";
import { contactFormSchema, type ContactFormData } from "@/lib/schemas/contact";

const contactMethods = [
  {
    icon: Phone,
    title: "Телефон гарячої лінії",
    details: "0 800 123 456",
    subtitle: "Безкоштовно з усіх телефонів",
    action: "Зателефонувати",
    href: "tel:0800123456",
    color: { bg: "bg-green-500/15", text: "text-green-500" },
  },
  {
    icon: Mail,
    title: "Електронна пошта",
    details: "support@bridgestone.ua",
    subtitle: "Відповідь протягом 24 годин",
    action: "Написати",
    href: "mailto:support@bridgestone.ua",
    color: { bg: "bg-blue-500/15", text: "text-blue-500" },
  },
  {
    icon: MapPin,
    title: "Офіційне представництво",
    details: "м. Київ, вул. Прикладна, 10",
    subtitle: "Пн‑Пт 9:00–18:00",
    action: "Знайти дилера",
    href: "/dealers",
    color: { bg: "bg-rose-500/15", text: "text-rose-500" },
  },
  {
    icon: Clock,
    title: "Графік роботи",
    details: "Пн‑Пт: 9:00–18:00",
    subtitle: "Сб‑Нд: вихідні",
    action: "Наші контакти",
    href: "#contact-form",
    color: { bg: "bg-amber-500/15", text: "text-amber-500" },
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

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactsPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Bot detection: record page load timestamp
  const loadedAtRef = useRef<number>(0);
  useEffect(() => {
    loadedAtRef.current = Date.now();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMessage('');

    // Client-side Zod validation
    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string' && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          _loadedAt: loadedAtRef.current,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка відправки');
      }

      setStatus('success');
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Щось пішло не так');
    }
  };

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <section className="hero-adaptive py-8 md:py-12">
        <div className="container mx-auto max-w-7xl px-4 md:px-8">
          <div
            
            
            
            className="mx-auto max-w-4xl text-left"
          >
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
            {contactMethods.map((method, idx) => (
              <div
                key={method.title}
                
                
                
                className="group rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:shadow-lg hover:border-primary/30"
              >
                <div className={`mb-4 inline-flex rounded-full ${method.color.bg} p-3`}>
                  <method.icon className={`h-6 w-6 ${method.color.text}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{method.title}</h3>
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
            {/* Contact Form */}
            <div
              
              
              
              className="rounded-2xl border border-border bg-card p-8 shadow-lg"
            >
              <h2 className="mb-6 text-2xl font-bold">Надішліть нам повідомлення</h2>
              <p className="mb-8 text-muted-foreground">
                Заповніть форму, і наші фахівці зв&apos;язуться з вами найближчим часом.
              </p>

              {status === 'success' ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900 dark:bg-green-950">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-xl font-semibold text-green-800 dark:text-green-200">
                    Дякуємо за звернення!
                  </h3>
                  <p className="mt-2 text-green-700 dark:text-green-300">
                    Ваше повідомлення отримано. Ми зв&apos;яжемося з вами протягом 24 годин.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 rounded-full bg-green-600 px-6 py-2 text-white hover:bg-green-700"
                  >
                    Надіслати ще одне
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {status === 'error' && (
                    <div
                      id="form-error"
                      role="alert"
                      className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950"
                    >
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                        <AlertCircle className="h-5 w-5" aria-hidden="true" />
                        <span>{errorMessage}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium">Ім&apos;я *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        aria-required="true"
                        aria-invalid={!!fieldErrors.name}
                        aria-describedby={fieldErrors.name ? 'name-error' : status === 'error' ? 'form-error' : undefined}
                        value={formData.name}
                        onChange={handleChange}
                        disabled={status === 'loading'}
                        className={`w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-50 ${fieldErrors.name ? 'border-red-500' : 'border-border'}`}
                        placeholder="Ваше ім'я"
                      />
                      {fieldErrors.name && (
                        <p id="name-error" className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-2 block text-sm font-medium">Телефон *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        aria-required="true"
                        aria-invalid={!!fieldErrors.phone}
                        aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={status === 'loading'}
                        className={`w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-50 ${fieldErrors.phone ? 'border-red-500' : 'border-border'}`}
                        placeholder="+380 (__) ___ __ __"
                      />
                      {fieldErrors.phone && (
                        <p id="phone-error" className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">Електронна пошта *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      aria-required="true"
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                      value={formData.email}
                      onChange={handleChange}
                      disabled={status === 'loading'}
                      className={`w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-50 ${fieldErrors.email ? 'border-red-500' : 'border-border'}`}
                      placeholder="you@example.com"
                    />
                    {fieldErrors.email && (
                      <p id="email-error" className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="subject" className="mb-2 block text-sm font-medium">Тема звернення</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      disabled={status === 'loading'}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-50"
                    >
                      <option value="">Оберіть тему</option>
                      <option value="tyre-selection">Питання щодо вибору шин</option>
                      <option value="find-dealer">Пошук дилера / де купити</option>
                      <option value="warranty">Гарантія та сервіс</option>
                      <option value="other">Інше запитання</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium">Повідомлення *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      aria-required="true"
                      aria-invalid={!!fieldErrors.message}
                      aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                      value={formData.message}
                      onChange={handleChange}
                      disabled={status === 'loading'}
                      className={`w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary disabled:opacity-50 ${fieldErrors.message ? 'border-red-500' : 'border-border'}`}
                      placeholder="Опишіть ваше запитання або ситуацію..."
                    />
                    {fieldErrors.message && (
                      <p id="message-error" className="mt-1 text-xs text-red-500">{fieldErrors.message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Ми гарантуємо конфіденційність ваших даних</span>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={status === 'loading'}
                    className="w-full py-3.5 text-lg shadow-lg"
                  >
                    {status === 'loading' ? 'Надсилаємо...' : 'Надіслати запит'}
                  </Button>
                </form>
              )}
            </div>

            {/* FAQ & Map */}
            <div className="space-y-8">
              <div
                
                
                
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
                <Link
                  href="/blog"
                  className="mt-6 inline-flex items-center gap-2 text-primary hover:underline"
                >
                  Перейти до всіх питань <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div
                
                
                
                className="overflow-hidden rounded-2xl border border-border bg-gradient-to-tr from-primary/5 to-secondary/5 p-8"
              >
                <h3 className="mb-4 text-2xl font-bold">Ми на карті</h3>
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
            
            
            
            className="rounded-3xl bg-graphite p-10 text-white shadow-2xl"
          >
            <h3 className="mb-4 text-3xl font-bold">Потрібна негайна допомога?</h3>
            <p className="mb-8 text-lg opacity-90">
              Зателефонуйте на гарячу лінію або напишіть у месенджер — ми відповімо протягом 15 хвилин.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:0800123456"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-graphite transition-colors hover:bg-stone-100"
              >
                <Phone className="h-4 w-4" />
                Зателефонувати зараз
              </a>
              <a
                href="https://t.me/bridgestone_ua"
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
