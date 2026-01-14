"use client";

import { useState, useMemo } from "react";
import { type TyreSize } from "@/lib/data";

interface SizesByDiameterProps {
  sizes: TyreSize[];
  modelSlug: string;
}

function formatSize(size: TyreSize) {
  const base = `${size.width}/${size.aspectRatio} R${size.diameter}`;
  const li = size.loadIndex ? ` ${size.loadIndex}` : "";
  const si = size.speedIndex ?? "";
  return `${base}${li}${si}`;
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
        {sortedDiameters.map((diameter) => {
          const isActive = activeDiameter === diameter;
          return (
            <button
              key={diameter}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveDiameter(diameter)}
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
      <SizesTable
        sizes={grouped[activeDiameter]}
        modelSlug={modelSlug}
      />
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
                {formatSize(size)}
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
