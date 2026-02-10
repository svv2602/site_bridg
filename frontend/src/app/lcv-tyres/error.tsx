"use client";

import { ErrorPageContent } from "@/components/ErrorPageContent";

export default function LcvTyresError({
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
      description="Не вдалося завантажити каталог комерційних шин. Спробуйте оновити сторінку."
      backLink={{ href: "/", label: "На головну" }}
    />
  );
}
