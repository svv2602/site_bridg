'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { MegaMenuColumn } from '@/lib/navigation';

interface MegaMenuProps {
  trigger: string;
  columns: MegaMenuColumn[];
}

export function MegaMenu({ trigger, columns }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openedWithKeyboard = useRef(false);

  const closeMenu = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 150);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      openedWithKeyboard.current = false;
      setIsOpen(true);
      requestAnimationFrame(() => setIsVisible(true));
    }, 150);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      closeMenu();
    }, 100);
  }, [closeMenu]);

  // Get all focusable menuitem elements inside the dropdown
  const getMenuItems = useCallback((): HTMLElement[] => {
    if (!menuRef.current) return [];
    return Array.from(menuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'));
  }, []);

  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen) {
        closeMenu();
      } else {
        openedWithKeyboard.current = true;
        setIsOpen(true);
        requestAnimationFrame(() => setIsVisible(true));
      }
    }
    if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault();
      openedWithKeyboard.current = true;
      setIsOpen(true);
      requestAnimationFrame(() => setIsVisible(true));
    }
  }, [isOpen, closeMenu]);

  // Handle Arrow key navigation inside the menu
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = getMenuItems();
    if (items.length === 0) return;
    const currentIndex = items.indexOf(e.target as HTMLElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[next].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prev].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (e.key === 'Escape') {
      closeMenu();
      triggerRef.current?.focus();
    } else if (e.key === 'Tab') {
      // Close menu on Tab out (natural browser behavior)
      closeMenu();
    }
  }, [getMenuItems, closeMenu]);

  // Auto-focus first menuitem when opened with keyboard
  useEffect(() => {
    if (isOpen && isVisible && openedWithKeyboard.current) {
      requestAnimationFrame(() => {
        const items = getMenuItems();
        if (items.length > 0) {
          items[0].focus();
        }
      });
      openedWithKeyboard.current = false;
    }
  }, [isOpen, isVisible, getMenuItems]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
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

  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-stone-900"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onKeyDown={handleTriggerKeyDown}
      >
        {trigger}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2"
          role="menu"
          onKeyDown={handleMenuKeyDown}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'opacity 0.15s ease-out, transform 0.15s ease-out',
          }}
        >
          <div className="min-w-[600px] rounded-2xl border border-stone-700 bg-stone-900/98 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            <div className={`grid gap-8 grid-cols-${columns.length}`} style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
              {columns.map((column) => (
                <div key={column.title}>
                  <div className="heading-3 mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                    {column.title}
                  </div>
                  <ul className="space-y-1" role="menu">
                    {column.items.map((item) => (
                      <li key={item.href} role="none">
                        <Link
                          href={item.href}
                          role="menuitem"
                          className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-stone-800"
                          onClick={handleLinkClick}
                        >
                          {item.icon && (
                            <div className={`mt-0.5 rounded-lg p-2 ${item.iconColor?.replace('text-', 'bg-').replace('-400', '-500/20') || 'bg-primary/20'}`}>
                              <item.icon className={`h-4 w-4 ${item.iconColor || 'text-primary'}`} />
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
                onClick={handleLinkClick}
              >
                Переглянути всі шини
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
