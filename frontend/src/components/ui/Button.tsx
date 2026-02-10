import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "brand" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-text hover:bg-primary-hover focus:ring-silver/50",
  secondary:
    "border border-stone-300 bg-transparent text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-700 focus:ring-stone-400/50",
  ghost:
    "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100 focus:ring-stone-400/50",
  brand:
    "bg-brand text-white hover:bg-brand-dark focus:ring-brand/50",
  outline:
    "border border-primary bg-transparent text-primary hover:bg-stone-100 dark:hover:bg-stone-700 focus:ring-silver/50",
  danger:
    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-2.5 text-base",
};

/**
 * Button component following Bridgestone design system standards.
 * Uses stone palette with explicit dark: variants. No zinc/gray/slate.
 *
 * Variants:
 * - primary: Silver CTA (bg-primary)
 * - secondary: Bordered with stone colors
 * - ghost: Minimal style
 * - brand: Red Bridgestone (only for promo/brand elements)
 * - outline: Primary-colored border
 * - danger: Destructive action
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
