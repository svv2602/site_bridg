import { FlaskConical } from 'lucide-react';
import type { TestResult } from '@/lib/data';
import { TestResultCard } from './TestResultCard';

interface TestResultsSectionProps {
  results: TestResult[];
  tireName: string;
}

export function TestResultsSection({ results, tireName }: TestResultsSectionProps) {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/15">
            <FlaskConical className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Результати незалежних тестів</h2>
            <p className="text-sm text-muted-foreground">
              Оцінки {tireName} від провідних автомобільних організацій
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((result, index) => (
            <TestResultCard key={index} result={result} />
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          * Результати тестів базуються на офіційних публікаціях організацій ADAC, Auto Bild, Tyre Reviews та TCS.
          Рейтинги можуть відрізнятися залежно від розміру шини та умов тестування.
        </p>
      </div>
    </section>
  );
}
