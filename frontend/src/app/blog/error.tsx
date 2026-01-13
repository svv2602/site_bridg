"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-background text-foreground">
      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center md:px-8">
          <AlertCircle className="mx-auto mb-6 h-16 w-16 text-destructive" />
          <h1 className="mb-4 text-3xl font-bold">Помилка завантаження</h1>
          <p className="mb-8 text-muted-foreground">
            Не вдалося завантажити статті. Спробуйте ще раз або поверніться на головну.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => reset()}
              className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-text hover:bg-primary-hover"
            >
              Спробувати ще раз
            </button>
            <Link
              href="/"
              className="rounded-full border border-border px-8 py-3 font-semibold hover:bg-muted"
            >
              На головну
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
