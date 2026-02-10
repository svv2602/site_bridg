"use client";

import { ErrorPageContent } from "@/components/ErrorPageContent";

export default function TyreError({
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
      title="Помилка завантаження шини"
      description="Не вдалося завантажити інформацію про цю модель шини. Спробуйте оновити сторінку."
      backLink={{ href: "/tyre-search", label: "Пошук шин" }}
    />
  );
}
