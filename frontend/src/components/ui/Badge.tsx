import { type ReactNode } from "react";
import { Trophy, CheckCircle, Medal, Sun, Snowflake, Cloud, Leaf, Gauge } from "lucide-react";

type BadgeVariant =
  | "winner"
  | "recommended"
  | "top3"
  | "category"
  | "eco"
  | "summer"
  | "winter"
  | "allseason"
  | "default";

type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  winner: "bg-amber-500 text-amber-950 border-amber-600",
  recommended: "bg-green-500 text-green-950 border-green-600",
  top3: "bg-blue-500 text-blue-950 border-blue-600",
  category: "bg-stone-200 text-stone-800 border-stone-300 dark:bg-stone-700 dark:text-stone-100 dark:border-stone-600",
  eco: "bg-emerald-500 text-emerald-950 border-emerald-600",
  summer: "bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-orange-600",
  winter: "bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-blue-600",
  allseason: "bg-gradient-to-r from-emerald-500 to-teal-400 text-white border-emerald-600",
  default: "bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700",
};

const variantIcons: Record<BadgeVariant, ReactNode> = {
  winner: <Trophy className="h-3.5 w-3.5" aria-hidden="true" />,
  recommended: <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />,
  top3: <Medal className="h-3.5 w-3.5" aria-hidden="true" />,
  category: <Gauge className="h-3.5 w-3.5" aria-hidden="true" />,
  eco: <Leaf className="h-3.5 w-3.5" aria-hidden="true" />,
  summer: <Sun className="h-3.5 w-3.5" aria-hidden="true" />,
  winter: <Snowflake className="h-3.5 w-3.5" aria-hidden="true" />,
  allseason: <Cloud className="h-3.5 w-3.5" aria-hidden="true" />,
  default: null,
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2.5 py-1 text-xs gap-1",
  md: "px-3 py-1.5 text-sm gap-1.5",
  lg: "px-4 py-2 text-base gap-2",
};

const iconSizes: Record<BadgeSize, string> = {
  sm: "[&_svg]:h-3 [&_svg]:w-3",
  md: "[&_svg]:h-3.5 [&_svg]:w-3.5",
  lg: "[&_svg]:h-4 [&_svg]:w-4",
};

export function Badge({
  variant = "default",
  size = "md",
  children,
  className = "",
  showIcon = true,
}: BadgeProps) {
  const icon = showIcon ? variantIcons[variant] : null;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${variantStyles[variant]} ${sizeStyles[size]} ${iconSizes[size]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

// Test badge component - shows source and year
interface TestBadgeProps {
  source: "adac" | "autobild" | "tcs" | "oamtc";
  year: number;
  result: "winner" | "recommended" | "top3";
  children?: ReactNode;
  size?: BadgeSize;
}

const sourceLabels: Record<TestBadgeProps["source"], string> = {
  adac: "ADAC",
  autobild: "Auto Bild",
  tcs: "TCS",
  oamtc: "ÖAMTC",
};

export function TestBadge({
  source,
  year,
  result,
  children,
  size = "md",
}: TestBadgeProps) {
  // Don't show badges older than 3 years
  const currentYear = new Date().getFullYear();
  if (currentYear - year > 3) {
    return null;
  }

  return (
    <Badge variant={result} size={size}>
      {children || `${sourceLabels[source]} ${year}`}
    </Badge>
  );
}

// Season badge shortcut
interface SeasonBadgeProps {
  season: "summer" | "winter" | "allseason";
  size?: BadgeSize;
  showLabel?: boolean;
}

const seasonLabels: Record<SeasonBadgeProps["season"], string> = {
  summer: "Літня",
  winter: "Зимова",
  allseason: "Всесезонна",
};

export function SeasonBadge({
  season,
  size = "md",
  showLabel = true,
}: SeasonBadgeProps) {
  return (
    <Badge variant={season} size={size}>
      {showLabel && seasonLabels[season]}
    </Badge>
  );
}
