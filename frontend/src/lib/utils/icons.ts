import {
  Car,
  Shield,
  Zap,
  Star,
  Mountain,
  Truck,
  Weight,
  Gauge,
  Snowflake,
  Thermometer,
  Cloud,
  Sun,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  car: Car,
  shield: Shield,
  zap: Zap,
  star: Star,
  mountain: Mountain,
  truck: Truck,
  weight: Weight,
  gauge: Gauge,
  snowflake: Snowflake,
  thermometer: Thermometer,
  cloud: Cloud,
  sun: Sun,
};

export function resolveIcon(name: string): LucideIcon {
  return iconMap[name] || Star;
}
