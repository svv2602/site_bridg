"use client";

import { useState, useEffect, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

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
    setSearch("");
  }, [options.length]);

  if (!searchable || options.length < 50) {
    // Standard select for small lists
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-100">
          {label}
        </label>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
          {loading ? (
            <div className="flex h-12 w-full items-center justify-center rounded-xl border border-stone-700 bg-stone-800">
              <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
            </div>
          ) : (
            <select
              className="w-full appearance-none rounded-xl border border-stone-700 bg-stone-800 py-3 pl-10 pr-8 text-sm text-stone-50 outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
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
          <ChevronRight className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-stone-400" />
        </div>
      </div>
    );
  }

  // Searchable dropdown for large lists
  return (
    <div className="relative" ref={containerRef}>
      <label className="mb-2 block text-sm font-medium text-stone-100">
        {label} <span className="text-xs text-stone-400">({options.length})</span>
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary z-10" />
        {loading ? (
          <div className="flex h-12 w-full items-center justify-center rounded-xl border border-stone-700 bg-stone-800">
            <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
          </div>
        ) : (
          <>
            <input
              type="text"
              className="w-full rounded-xl border border-stone-700 bg-stone-800 py-3 pl-10 pr-8 text-sm text-stone-50 outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={value ? selectedLabel : placeholder}
              value={isOpen ? search : (value ? selectedLabel : "")}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              disabled={disabled || options.length === 0}
            />
            <ChevronRight
              className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
            />

            {isOpen && !disabled && (
              <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-stone-700 bg-stone-800 py-1 shadow-xl">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-stone-400">
                    Нічого не знайдено
                  </div>
                ) : (
                  filteredOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-stone-700 ${
                        opt.value === value
                          ? "bg-stone-700 text-white"
                          : "text-stone-50"
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
