/**
 * Описание компонента
 *
 * @example
 * <ComponentName title="Заголовок" />
 */
"use client"; // Удалите если Server Component

// ============================================================================
// IMPORTS
// ============================================================================

// React и Next.js
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Иконки
import { ChevronRight } from 'lucide-react';

// Локальные компоненты
import { Badge } from '@/components/ui/Badge';

// Утилиты
import { cn } from '@/lib/utils';

// Типы
import type { SomeType } from '@/lib/data';

// ============================================================================
// TYPES
// ============================================================================

interface ComponentNameProps {
  /** Заголовок компонента */
  title: string;
  /** Дополнительные CSS классы */
  className?: string;
  /** Вариант отображения */
  variant?: 'default' | 'compact';
  /** Callback при клике */
  onClick?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VARIANT_CLASSES = {
  default: 'p-6',
  compact: 'p-4',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

export function ComponentName({
  title,
  className,
  variant = 'default',
  onClick,
}: ComponentNameProps) {
  // ------------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------------

  const [isHovered, setIsHovered] = useState(false);

  // ------------------------------------------------------------------------
  // Computed
  // ------------------------------------------------------------------------

  const variantClass = VARIANT_CLASSES[variant];

  // ------------------------------------------------------------------------
  // Event Handlers
  // ------------------------------------------------------------------------

  const handleClick = () => {
    onClick?.();
  };

  // ------------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------------

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card',
        'transition-all duration-300',
        variantClass,
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 className="font-semibold text-foreground">{title}</h3>

      {isHovered && (
        <span className="text-primary">Hovered!</span>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS (опционально)
// ============================================================================

/**
 * Skeleton для загрузки
 */
export function ComponentNameSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}
