"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { type TyreSize } from "@/lib/data";
import { formatSize } from "@/lib/utils/tyres";

interface SizesByDiameterProps {
  sizes: TyreSize[];
  modelSlug: string;
}

export function SizesByDiameter({ sizes, modelSlug }: SizesByDiameterProps) {
  // Group sizes by diameter and sort diameters ascending
  const sizesByDiameter = useMemo(() => {
    const grouped = sizes.reduce(
      (acc, size) => {
        const d = size.diameter;
        if (!acc[d]) acc[d] = [];
        acc[d].push(size);
        return acc;
      },
      {} as Record<number, TyreSize[]>,
    );

    // Sort diameters ascending
    const sortedDiameters = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => a - b);

    return { grouped, sortedDiameters };
  }, [sizes]);

  const { grouped, sortedDiameters } = sizesByDiameter;
  const [activeDiameter, setActiveDiameter] = useState(sortedDiameters[0]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let newIndex = index;
      if (e.key === 'ArrowRight') {
        newIndex = (index + 1) % sortedDiameters.length;
      } else if (e.key === 'ArrowLeft') {
        newIndex = (index - 1 + sortedDiameters.length) % sortedDiameters.length;
      } else if (e.key === 'Home') {
        newIndex = 0;
      } else if (e.key === 'End') {
        newIndex = sortedDiameters.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      setActiveDiameter(sortedDiameters[newIndex]);
      tabRefs.current[newIndex]?.focus();
    },
    [sortedDiameters],
  );

  if (sizes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Дані про типорозміри для цієї моделі будуть додані пізніше.
      </p>
    );
  }

  // If only one diameter, don't show tabs
  if (sortedDiameters.length === 1) {
    return (
      <SizesTable
        sizes={grouped[sortedDiameters[0]]}
        modelSlug={modelSlug}
      />
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Діаметри шин">
        {sortedDiameters.map((diameter, index) => {
          const isActive = activeDiameter === diameter;
          return (
            <button
              key={diameter}
              ref={(el) => { tabRefs.current[index] = el; }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`sizes-panel-${diameter}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveDiameter(diameter)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-text"
                  : "bg-stone-200 text-stone-700 hover:bg-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:hover:bg-stone-600"
              }`}
            >
              R{diameter}
              <span className={`ml-1.5 text-xs ${isActive ? "" : "opacity-60"}`}>
                ({grouped[diameter].length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Active tab content */}
      <div
        id={`sizes-panel-${activeDiameter}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeDiameter}`}
      >
        <SizesTable
          sizes={grouped[activeDiameter]}
          modelSlug={modelSlug}
        />
      </div>
    </div>
  );
}

function SizesTable({
  sizes,
  modelSlug,
}: {
  sizes: TyreSize[];
  modelSlug: string;
}) {
  // Sort sizes within diameter by width, then aspect ratio
  const sortedSizes = useMemo(
    () =>
      [...sizes].sort((a, b) => {
        if (a.width !== b.width) return a.width - b.width;
        return a.aspectRatio - b.aspectRatio;
      }),
    [sizes],
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2 pr-4">Типорозмір</th>
            <th className="py-2 pr-4">Індекс навантаження</th>
            <th className="py-2 pr-4">Індекс швидкості</th>
          </tr>
        </thead>
        <tbody>
          {sortedSizes.map((size, idx) => (
            <tr
              key={`${modelSlug}-${size.width}-${size.aspectRatio}-${size.diameter}-${idx}`}
              className="border-b border-border/60 last:border-0"
            >
              <td className="py-2 pr-4 font-medium text-foreground">
                {formatSize(size, true)}
              </td>
              <td className="py-2 pr-4 text-muted-foreground">
                {size.loadIndex ?? "—"}
              </td>
              <td className="py-2 pr-4 text-muted-foreground">
                {size.speedIndex ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
