/**
 * Model Selector Component
 *
 * Dropdown to select a tire model with status indicators.
 */

"use client";

import { ChevronDown, Check, Circle, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface TyreModel {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
}

interface ModelSelectorProps {
  tyres: TyreModel[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  filter?: "all" | "no-content" | "has-content";
  disabled?: boolean;
}

export function ModelSelector({
  tyres,
  selectedSlug,
  onSelect,
  filter = "all",
  disabled = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTyre = tyres.find((t) => t.slug === selectedSlug);

  // Filter tyres based on filter prop
  const filteredTyres = tyres.filter((tyre) => {
    if (filter === "all") return true;
    const hasContent = !!tyre.shortDescription;
    return filter === "has-content" ? hasContent : !hasContent;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-left transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-800 dark:hover:bg-stone-700"
      >
        <div>
          {selectedTyre ? (
            <div>
              <p className="font-medium">{selectedTyre.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedTyre.slug}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Оберіть модель шини...</p>
          )}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border border-border bg-white shadow-lg dark:bg-stone-800">
          {filteredTyres.length === 0 ? (
            <div className="px-4 py-3 text-center text-muted-foreground">
              Немає моделей
            </div>
          ) : (
            <ul className="py-1">
              {filteredTyres.map((tyre) => {
                const hasContent = !!tyre.shortDescription;
                const isSelected = tyre.slug === selectedSlug;

                return (
                  <li key={tyre.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(tyre.slug);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-700 ${
                        isSelected ? "bg-stone-100 dark:bg-stone-700" : ""
                      }`}
                    >
                      {/* Status indicator */}
                      {hasContent ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-stone-300" />
                      )}

                      {/* Tyre info */}
                      <div className="flex-1">
                        <p className="font-medium">{tyre.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tyre.slug}
                        </p>
                      </div>

                      {/* Selected check */}
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
