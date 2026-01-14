'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { MegaMenuColumn } from '@/lib/navigation';

interface MegaMenuProps {
  trigger: string;
  columns: MegaMenuColumn[];
}

export function MegaMenu({ trigger, columns }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), 150);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 100);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-stone-900"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onKeyDown={handleKeyDown}
      >
        {trigger}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2"
            role="menu"
          >
            <div className="min-w-[600px] rounded-2xl border border-stone-700 bg-stone-900/98 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
              <div className={`grid gap-8 grid-cols-${columns.length}`} style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
                {columns.map((column) => (
                  <div key={column.title}>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                      {column.title}
                    </h3>
                    <ul className="space-y-1" role="menu">
                      {column.items.map((item) => (
                        <li key={item.href} role="none">
                          <Link
                            href={item.href}
                            role="menuitem"
                            className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-stone-800"
                            onClick={() => setIsOpen(false)}
                          >
                            {item.icon && (
                              <div className="mt-0.5 rounded-lg bg-stone-800 p-2">
                                <item.icon className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <div>
                              <span className="block text-sm font-medium text-stone-100">
                                {item.label}
                              </span>
                              {item.description && (
                                <span className="block text-xs text-stone-400">
                                  {item.description}
                                </span>
                              )}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="mt-6 border-t border-stone-700 pt-4">
                <Link
                  href="/passenger-tyres"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-stone-900 ring-1 ring-stone-300 transition-colors hover:ring-stone-400"
                  onClick={() => setIsOpen(false)}
                >
                  Переглянути всі шини
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
