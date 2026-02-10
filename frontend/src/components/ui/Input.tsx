import { forwardRef, type InputHTMLAttributes } from "react";

type InputSize = "sm" | "md" | "lg";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  error?: boolean;
  icon?: React.ReactNode;
}

const sizeStyles: Record<InputSize, string> = {
  sm: "py-1.5 text-xs",
  md: "py-2.5 text-sm",
  lg: "py-3 text-base",
};

/**
 * Input component following Bridgestone design system standards.
 * Uses stone palette with explicit dark: variants. No zinc/gray/slate.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ inputSize = "md", error = false, icon, className = "", ...props }, ref) => {
    const baseClasses =
      "w-full rounded-xl border bg-white text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500";
    const borderClasses = error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
      : "border-stone-300 focus:border-primary focus:ring-primary/30 dark:border-stone-600 dark:focus:border-primary";
    const paddingClasses = icon ? "pl-10 pr-4" : "px-4";

    return (
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${borderClasses} ${paddingClasses} ${sizeStyles[inputSize]} ${className}`}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";
