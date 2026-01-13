import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Trophy, Award, Medal } from 'lucide-react';
import type { TestResult } from '@/lib/data';

interface TestResultCardProps {
  result: TestResult;
}

const sourceLabels: Record<string, string> = {
  adac: 'ADAC',
  autobild: 'Auto Bild',
  tyrereviews: 'Tyre Reviews',
  tcs: 'TCS',
};

const sourceLogos: Record<string, string> = {
  adac: '/images/logos/adac.svg',
  autobild: '/images/logos/autobild.svg',
  tyrereviews: '/images/logos/tyrereviews.svg',
  tcs: '/images/logos/tcs.svg',
};

const testTypeLabels: Record<string, string> = {
  summer: 'Літній тест',
  winter: 'Зимовий тест',
  allseason: 'Всесезонний тест',
};

function getRatingColor(ratingNumeric: number): string {
  if (ratingNumeric <= 2.0) return 'bg-green-500 text-white';
  if (ratingNumeric <= 2.5) return 'bg-lime-500 text-white';
  return 'bg-stone-400 text-white';
}

function getRatingLabel(ratingNumeric: number): string {
  if (ratingNumeric <= 2.0) return 'Відмінно';
  if (ratingNumeric <= 2.5) return 'Добре';
  return 'Задовільно';
}

function getPositionIcon(position: number) {
  if (position === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
  if (position === 2) return <Award className="h-4 w-4 text-stone-400" />;
  if (position === 3) return <Medal className="h-4 w-4 text-amber-600" />;
  return null;
}

export function TestResultCard({ result }: TestResultCardProps) {
  const ratingColorClass = getRatingColor(result.ratingNumeric);
  const positionIcon = getPositionIcon(result.position);
  const logoPath = sourceLogos[result.source];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      {/* Header - fixed height container */}
      <div className="mb-3 h-[2.5rem] flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {logoPath ? (
            <div className="relative h-10 w-20 shrink-0 overflow-hidden rounded">
              <Image
                src={logoPath}
                alt={sourceLabels[result.source] || result.source}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {sourceLabels[result.source] || result.source}
            </div>
          )}
          <div className="text-sm font-medium">
            {testTypeLabels[result.testType] || result.testType} {result.year}
          </div>
        </div>
        <div className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-bold ${ratingColorClass}`}>
          {result.rating}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Позиція:</span>
          <div className="flex items-center gap-1.5 font-medium">
            {positionIcon}
            <span>{result.position} з {result.totalTested}</span>
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">Розмір:</span>
          <div className="font-medium">{result.testedSize}</div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">
          {getRatingLabel(result.ratingNumeric)}
        </span>
        {result.articleSlug && (
          <Link
            href={`/blog/${result.articleSlug}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Детальніше
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
