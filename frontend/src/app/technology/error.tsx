"use client";

import { ErrorPageContent } from "@/components/ErrorPageContent";

export default function TechnologyError({
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
      description="Не вдалося завантажити інформацію про технології. Спробуйте оновити сторінку."
      backLink={{ href: "/", label: "На головну" }}
    />
  );
}
