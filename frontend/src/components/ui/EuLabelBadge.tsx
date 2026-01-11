import { Droplets, Fuel, Volume2 } from "lucide-react";

type EuLabelType = "wetGrip" | "fuelEfficiency" | "noise";
type EuGrade = "A" | "B" | "C" | "D" | "E";
type BadgeSize = "sm" | "md" | "lg";

interface EuLabelBadgeProps {
  type: EuLabelType;
  value: EuGrade | number; // number for noise (dB)
  size?: BadgeSize;
  showLabel?: boolean;
  className?: string;
}

const gradeColors: Record<EuGrade, string> = {
  A: "bg-green-500 text-white",
  B: "bg-lime-500 text-lime-950",
  C: "bg-yellow-500 text-yellow-950",
  D: "bg-orange-500 text-white",
  E: "bg-red-500 text-white",
};

const typeLabels: Record<EuLabelType, string> = {
  wetGrip: "Зчеплення",
  fuelEfficiency: "Паливо",
  noise: "Шум",
};

const typeIcons: Record<EuLabelType, React.ReactNode> = {
  wetGrip: <Droplets className="h-3.5 w-3.5" />,
  fuelEfficiency: <Fuel className="h-3.5 w-3.5" />,
  noise: <Volume2 className="h-3.5 w-3.5" />,
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-1 text-xs gap-1",
  md: "px-2.5 py-1.5 text-sm gap-1",
  lg: "px-3 py-2 text-base gap-1.5",
};

const iconSizes: Record<BadgeSize, string> = {
  sm: "[&_svg]:h-2.5 [&_svg]:w-2.5",
  md: "[&_svg]:h-3.5 [&_svg]:w-3.5",
  lg: "[&_svg]:h-4 [&_svg]:w-4",
};

export function EuLabelBadge({
  type,
  value,
  size = "md",
  showLabel = true,
  className = "",
}: EuLabelBadgeProps) {
  // For noise, show dB value with neutral color
  if (type === "noise" && typeof value === "number") {
    return (
      <span
        className={`inline-flex items-center rounded-lg bg-stone-100 font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300 ${sizeStyles[size]} ${iconSizes[size]} ${className}`}
      >
        {typeIcons[type]}
        {showLabel && <span className="uppercase opacity-70">{typeLabels[type]}</span>}
        <span className="font-semibold">{value} дБ</span>
      </span>
    );
  }

  // For grades A-E
  const grade = value as EuGrade;
  const colorClass = gradeColors[grade] || gradeColors.C;

  return (
    <span
      className={`inline-flex items-center rounded-lg font-medium ${colorClass} ${sizeStyles[size]} ${iconSizes[size]} ${className}`}
    >
      {typeIcons[type]}
      {showLabel && <span className="uppercase opacity-80">{typeLabels[type]}</span>}
      <span className="font-bold">{grade}</span>
    </span>
  );
}

// Compact EU Label group for cards
interface EuLabelGroupProps {
  wetGrip?: EuGrade;
  fuelEfficiency?: EuGrade;
  noiseDb?: number;
  size?: BadgeSize;
  className?: string;
}

export function EuLabelGroup({
  wetGrip,
  fuelEfficiency,
  noiseDb,
  size = "sm",
  className = "",
}: EuLabelGroupProps) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {wetGrip && <EuLabelBadge type="wetGrip" value={wetGrip} size={size} />}
      {fuelEfficiency && <EuLabelBadge type="fuelEfficiency" value={fuelEfficiency} size={size} />}
      {noiseDb && <EuLabelBadge type="noise" value={noiseDb} size={size} />}
    </div>
  );
}
