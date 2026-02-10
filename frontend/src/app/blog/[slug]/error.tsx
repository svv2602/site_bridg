"use client";

import { ErrorPageContent } from "@/components/ErrorPageContent";

export default function ArticleError({
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
      title="Помилка завантаження статті"
      description="Не вдалося завантажити цю статтю. Спробуйте оновити сторінку або поверніться до блогу."
      backLink={{ href: "/blog", label: "До блогу" }}
    />
  );
}
