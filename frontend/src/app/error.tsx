"use client";

import { ErrorPageContent } from "@/components/ErrorPageContent";

export default function RootError({
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
      backLink={{ href: "/", label: "На головну" }}
    />
  );
}
