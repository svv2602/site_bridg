"use client";

import { ErrorPageContent } from "@/components/ErrorPageContent";

export default function ReviewsError({
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
      description="Не вдалося завантажити відгуки. Спробуйте ще раз або поверніться на головну."
      backLink={{ href: "/", label: "На головну" }}
    />
  );
}
