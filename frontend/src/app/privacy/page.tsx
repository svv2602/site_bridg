import { Metadata } from 'next';
import { Breadcrumb } from '@/components/ui';
import { PHONE_DISPLAY, EMAIL_PRIVACY } from '@/lib/constants';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Політика конфіденційності',
  description: 'Політика конфіденційності та захисту персональних даних офіційного сайту Bridgestone Україна.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: "Політика конфіденційності | Bridgestone Україна",
    description: "Політика конфіденційності та захисту персональних даних офіційного сайту Bridgestone Україна.",
    type: "website",
    locale: "uk_UA",
    siteName: "Bridgestone Україна",
  },
};

export default function PrivacyPage() {
  return (
    <div className="bg-background py-12">
      <div className="container mx-auto max-w-4xl px-4 md:px-8">
        <Breadcrumb
          className="mb-4"
          items={[
            { label: "Головна", href: "/" },
            { label: "Політика конфіденційності" },
          ]}
        />
        <h1 className="mb-8 text-3xl font-bold md:text-4xl">Політика конфіденційності</h1>

        <article className="prose max-w-none">
          <p className="lead text-lg text-muted-foreground">
            Ця політика конфіденційності описує, як ми збираємо, використовуємо та захищаємо
            вашу персональну інформацію під час використання нашого вебсайту.
          </p>

          <h2>1. Збір інформації</h2>
          <p>
            Ми можемо збирати наступну інформацію:
          </p>
          <ul>
            <li>Контактні дані (ім&apos;я, email, телефон) при заповненні форм</li>
            <li>Технічну інформацію про ваш пристрій та браузер</li>
            <li>Дані про використання сайту через cookies</li>
          </ul>

          <h2>2. Використання інформації</h2>
          <p>
            Зібрана інформація використовується для:
          </p>
          <ul>
            <li>Обробки ваших запитів та надання консультацій</li>
            <li>Покращення роботи сайту та користувацького досвіду</li>
            <li>Надсилання важливих повідомлень за вашою згодою</li>
          </ul>

          <h2>3. Захист даних</h2>
          <p>
            Ми вживаємо технічних та організаційних заходів для захисту вашої персональної
            інформації від несанкціонованого доступу, зміни, розголошення або знищення.
          </p>

          <h2>4. Cookies</h2>
          <p>
            Наш сайт використовує cookies для покращення функціональності та аналізу
            відвідуваності. Ви можете керувати налаштуваннями cookies у своєму браузері.
          </p>

          <h2>5. Ваші права</h2>
          <p>
            Ви маєте право:
          </p>
          <ul>
            <li>Отримати доступ до своїх персональних даних</li>
            <li>Вимагати виправлення або видалення даних</li>
            <li>Відкликати згоду на обробку даних</li>
          </ul>

          <h2>6. Контактна інформація</h2>
          <p>
            З питань щодо політики конфіденційності звертайтесь:
            <br />
            Email: <a href={`mailto:${EMAIL_PRIVACY}`}>{EMAIL_PRIVACY}</a>
            <br />
            Телефон: {PHONE_DISPLAY}
          </p>

          <p className="mt-8 text-sm text-muted-foreground">
            Останнє оновлення: січень 2026
          </p>
        </article>
      </div>
    </div>
  );
}
