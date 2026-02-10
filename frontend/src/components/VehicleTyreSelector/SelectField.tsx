"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, Loader2 } from "lucide-react";

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  loading?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  searchable?: boolean;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
  loading,
  icon: Icon,
  placeholder = "Оберіть",
  searchable = false,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  // Filter options
  const filteredOptions = searchable && search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Reset search when options change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on prop change
    setSearch("");
  }, [options.length]);

  // Reset active index when dropdown opens/closes or filtered options change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on state change
    setActiveIndex(-1);
  }, [isOpen, filteredOptions.length]);

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listboxRef.current) {
      const activeEl = listboxRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  // Keyboard navigation for searchable dropdown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
            onChange(filteredOptions[activeIndex].value);
            setIsOpen(false);
            setSearch("");
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          setSearch("");
          break;
      }
    },
    [isOpen, activeIndex, filteredOptions, onChange]
  );

  if (!searchable || options.length < 50) {
    // Standard select for small lists
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-100">
          {label}
        </label>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
          {loading ? (
            <div className="flex h-12 w-full items-center justify-center rounded-xl border border-stone-300 bg-stone-100 dark:border-stone-700 dark:bg-stone-800">
              <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
            </div>
          ) : (
            <select
              className="w-full appearance-none rounded-xl border border-stone-300 bg-stone-100 py-3 pl-10 pr-8 text-sm text-stone-900 outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-50"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled || options.length === 0}
            >
              <option value="">{placeholder}</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-stone-500 dark:text-stone-400" />
        </div>
      </div>
    );
  }

  // Searchable dropdown for large lists
  return (
    <div className="relative" ref={containerRef}>
      <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-100">
        {label} <span className="text-xs text-stone-500 dark:text-stone-400">({options.length})</span>
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary z-10" />
        {loading ? (
          <div className="flex h-12 w-full items-center justify-center rounded-xl border border-stone-300 bg-stone-100 dark:border-stone-700 dark:bg-stone-800">
            <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
          </div>
        ) : (
          <>
            <input
              type="text"
              role="combobox"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-controls={isOpen ? `${label}-listbox` : undefined}
              aria-activedescendant={
                isOpen && activeIndex >= 0
                  ? `${label}-option-${activeIndex}`
                  : undefined
              }
              className="w-full rounded-xl border border-stone-300 bg-stone-100 py-3 pl-10 pr-8 text-sm text-stone-900 outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-50"
              placeholder={value ? selectedLabel : placeholder}
              value={isOpen ? search : (value ? selectedLabel : "")}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              disabled={disabled || options.length === 0}
            />
            <ChevronRight
              className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500 dark:text-stone-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
            />

            {isOpen && !disabled && (
              <div
                ref={listboxRef}
                id={`${label}-listbox`}
                role="listbox"
                aria-label={label}
                className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-stone-300 bg-white py-1 shadow-xl dark:border-stone-700 dark:bg-stone-800"
              >
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-stone-500 dark:text-stone-400">
                    Нічого не знайдено
                  </div>
                ) : (
                  filteredOptions.map((opt, index) => (
                    <button
                      key={opt.value}
                      id={`${label}-option-${index}`}
                      data-index={index}
                      type="button"
                      role="option"
                      aria-selected={opt.value === value}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-stone-100 dark:hover:bg-stone-700 ${
                        opt.value === value
                          ? "bg-stone-200 text-stone-900 dark:bg-stone-700 dark:text-white"
                          : index === activeIndex
                            ? "bg-stone-100 text-stone-900 dark:bg-stone-700/50 dark:text-stone-50"
                            : "text-stone-900 dark:text-stone-50"
                      }`}
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearch("");
                      }}
                    >
                      {opt.label}
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
