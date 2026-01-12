"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { type TyreModel, type Season } from "@/lib/data";
import { seasonLabels, SeasonIcons } from "@/lib/utils/tyres";

interface SeasonCategoryCardProps {
  season: Season;
  items: TyreModel[];
  initialCount?: number;
  description: string;
}

export function SeasonCategoryCard({
  season,
  items,
  initialCount = 3,
  description,
}: SeasonCategoryCardProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedItems = showAll ? items : items.slice(0, initialCount);
  const hasMore = items.length > initialCount;
  const Icon = SeasonIcons[season];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold">{seasonLabels[season]}</h3>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {items.length} моделей
        </span>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">{description}</p>
      <div className="space-y-4">
        {displayedItems.map((model) => (
          <div
            key={model.slug}
            className="rounded-xl border border-border bg-background p-4"
          >
            <h4 className="font-semibold">{model.name}</h4>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {model.shortDescription}
            </p>
            <Link
              href={`/shyny/${model.slug}`}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Детальніше <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium text-primary hover:bg-muted transition-colors"
        >
          {showAll ? (
            <>
              Згорнути <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Показати всі ({items.length}) <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
