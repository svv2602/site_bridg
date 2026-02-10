"use client";

import { ErrorPageContent } from "@/components/ErrorPageContent";

export default function PassengerTyresError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPageContent
      error={error}
      reset={reset}
      title="Помилка завантаження"
      description="Не вдалося завантажити каталог шин. Спробуйте оновити сторінку."
      backLink={{ href: "/", label: "На головну" }}
    />
  );
}
