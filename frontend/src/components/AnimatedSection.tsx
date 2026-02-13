'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

/**
 * Shared hook for IntersectionObserver-based viewport detection.
 * Triggers once when element becomes visible, then disconnects.
 */
function useIntersectionObserver(threshold = 0.1, rootMargin = '50px') {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isVisible };
}

type AnimationDirection = 'up' | 'left' | 'right';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Animation direction: "up" (default), "left", or "right" */
  direction?: AnimationDirection;
}

function getTransform(direction: AnimationDirection, isVisible: boolean): string {
  if (isVisible) return 'translate(0, 0)';

  switch (direction) {
    case 'up':
      return 'translateY(20px)';
    case 'left':
      return 'translateX(-12px)';
    case 'right':
      return 'translateX(12px)';
  }
}

function getDuration(direction: AnimationDirection): number {
  return direction === 'up' ? 0.5 : 0.4;
}

/**
 * CSS-based animation component (replaces framer-motion for better performance).
 * Uses Intersection Observer for viewport-based triggering.
 *
 * @param direction - "up" (slide from below), "left" (slide from left), "right" (slide from right)
 */
export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: AnimatedCardProps) {
  const { ref, isVisible } = useIntersectionObserver();
  const duration = getDuration(direction);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(direction, isVisible),
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * @deprecated Use `<AnimatedCard direction="left" />` or `<AnimatedCard direction="right" />` instead.
 */
export function AnimatedCardX({
  children,
  className = '',
  delay = 0,
  direction = 'left',
}: AnimatedCardProps & { direction?: 'left' | 'right' }) {
  return (
    <AnimatedCard
      className={className}
      delay={delay}
      direction={direction}
    >
      {children}
    </AnimatedCard>
  );
}
