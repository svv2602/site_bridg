"use client";

import { ErrorPageContent } from "@/components/ErrorPageContent";

export default function BlogError({
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
      description="Не вдалося завантажити статті. Спробуйте ще раз або поверніться до блогу."
      backLink={{ href: "/blog", label: "До блогу" }}
    />
  );
}
