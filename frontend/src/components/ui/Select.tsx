import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

type SelectSize = "sm" | "md" | "lg";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  selectSize?: SelectSize;
  error?: boolean;
  icon?: React.ReactNode;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const sizeStyles: Record<SelectSize, string> = {
  sm: "py-1.5 text-xs",
  md: "py-2.5 text-sm",
  lg: "py-3 text-base",
};

/**
 * Select component following Bridgestone design system standards.
 * Uses stone palette with explicit dark: variants. No zinc/gray/slate.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      selectSize = "md",
      error = false,
      icon,
      options,
      placeholder,
      className = "",
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "w-full appearance-none rounded-xl border bg-white text-stone-900 outline-none transition-colors focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-800 dark:text-stone-100";
    const borderClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
      : "border-stone-300 focus:border-primary focus:ring-primary/30 dark:border-stone-600 dark:focus:border-primary";
    const paddingClasses = icon ? "pl-10 pr-10" : "pl-4 pr-10";

    return (
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400">
            {icon}
          </span>
        )}
        <select
          ref={ref}
          className={`${baseClasses} ${borderClasses} ${paddingClasses} ${sizeStyles[selectSize]} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500"
          aria-hidden="true"
        />
      </div>
    );
  },
);

Select.displayName = "Select";
