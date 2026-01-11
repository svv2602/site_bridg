import {
  Leaf,
  Shield,
  Volume2,
  Droplets,
  Snowflake,
  Zap,
  Gauge,
  Fuel,
  Target,
  type LucideIcon,
} from "lucide-react";

type TechnologySlug =
  | "enliten"
  | "run-flat"
  | "runflat"
  | "noise-reduction"
  | "b-silent"
  | "wet-grip"
  | "winter-compound"
  | "ice-guard"
  | "ev-ready"
  | "fuel-efficiency"
  | "performance"
  | "default";

interface TechConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
}

const techConfigs: Record<TechnologySlug, TechConfig> = {
  enliten: {
    icon: Leaf,
    color: "text-green-500",
    bg: "bg-green-500/10",
    label: "ENLITEN",
  },
  "run-flat": {
    icon: Shield,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Run-Flat",
  },
  runflat: {
    icon: Shield,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Run-Flat",
  },
  "noise-reduction": {
    icon: Volume2,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    label: "Noise Reduction",
  },
  "b-silent": {
    icon: Volume2,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    label: "B-Silent",
  },
  "wet-grip": {
    icon: Droplets,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    label: "Wet Grip",
  },
  "winter-compound": {
    icon: Snowflake,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    label: "Winter Compound",
  },
  "ice-guard": {
    icon: Snowflake,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    label: "Ice Guard",
  },
  "ev-ready": {
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    label: "EV Ready",
  },
  "fuel-efficiency": {
    icon: Fuel,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Fuel Efficiency",
  },
  performance: {
    icon: Gauge,
    color: "text-red-500",
    bg: "bg-red-500/10",
    label: "Performance",
  },
  default: {
    icon: Target,
    color: "text-stone-500",
    bg: "bg-stone-500/10",
    label: "Technology",
  },
};

// Normalize technology name to slug
function normalizeSlug(name: string): TechnologySlug {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (normalized in techConfigs) {
    return normalized as TechnologySlug;
  }

  // Try to match partial
  if (normalized.includes("enliten")) return "enliten";
  if (normalized.includes("run") && normalized.includes("flat")) return "run-flat";
  if (normalized.includes("silent") || normalized.includes("noise")) return "noise-reduction";
  if (normalized.includes("wet") || normalized.includes("grip")) return "wet-grip";
  if (normalized.includes("winter") || normalized.includes("snow")) return "winter-compound";
  if (normalized.includes("ice")) return "ice-guard";
  if (normalized.includes("ev") || normalized.includes("electric")) return "ev-ready";
  if (normalized.includes("fuel") || normalized.includes("eco")) return "fuel-efficiency";
  if (normalized.includes("performance") || normalized.includes("sport")) return "performance";

  return "default";
}

interface TechnologyIconProps {
  name: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const badgeSizeStyles = {
  sm: "px-2 py-1 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

export function TechnologyIcon({
  name,
  size = "md",
  showLabel = true,
  className = "",
}: TechnologyIconProps) {
  const slug = normalizeSlug(name);
  const config = techConfigs[slug];
  const Icon = config.icon;

  if (!showLabel) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full ${config.bg} ${config.color} p-1.5 ${className}`}
        title={name}
      >
        <Icon className={sizeStyles[size]} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full ${config.bg} ${config.color} font-medium ${badgeSizeStyles[size]} ${className}`}
    >
      <Icon className={sizeStyles[size]} />
      <span>{config.label}</span>
    </span>
  );
}

// Group of technology icons for cards
interface TechnologyGroupProps {
  technologies: string[];
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  maxVisible?: number;
  className?: string;
}

export function TechnologyGroup({
  technologies,
  size = "sm",
  showLabels = false,
  maxVisible = 4,
  className = "",
}: TechnologyGroupProps) {
  if (!technologies || technologies.length === 0) return null;

  const visible = technologies.slice(0, maxVisible);
  const remaining = technologies.length - maxVisible;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {visible.map((tech, idx) => (
        <TechnologyIcon
          key={`${tech}-${idx}`}
          name={tech}
          size={size}
          showLabel={showLabels}
        />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
          +{remaining}
        </span>
      )}
    </div>
  );
}
