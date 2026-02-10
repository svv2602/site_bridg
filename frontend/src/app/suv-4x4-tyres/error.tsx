"use client";

import { ErrorPageContent } from "@/components/ErrorPageContent";

export default function Suv4x4TyresError({
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
      description="Не вдалося завантажити каталог шин SUV. Спробуйте оновити сторінку."
      backLink={{ href: "/", label: "На головну" }}
    />
  );
}
