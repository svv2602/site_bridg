import { Shield, Zap, Sun, Snowflake, Cloud, Users, Globe } from "lucide-react";

export const tyreCategories = [
  {
    id: "summer",
    name: "Літні шини",
    description: "Для теплої пори року, оптимальні для сухого та мокрого асфальту.",
    icon: Sun,
    color: "from-emerald-500 to-teal-400",
    href: "/passenger-tyres/summer",
  },
  {
    id: "winter",
    name: "Зимові шини",
    description: "Максимальне зчеплення на снігу та льоду в зимових умовах.",
    icon: Snowflake,
    color: "from-blue-500 to-cyan-400",
    href: "/passenger-tyres/winter",
  },
  {
    id: "allseason",
    name: "Всесезонні шини",
    description: "Компромісне рішення для помірного клімату без екстремальних умов.",
    icon: Cloud,
    color: "from-orange-500 to-amber-400",
    href: "/passenger-tyres/all-season",
  },
];

export const features = [
  {
    icon: Shield,
    title: "Безпека на першому місці",
    description: "Технології, що забезпечують надійне зчеплення в будь-яких умовах.",
    color: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
  },
  {
    icon: Zap,
    title: "Економія палива",
    description: "Знижений опір коченню для зменшення витрат на пального.",
    color: { bg: "bg-amber-500/15", text: "text-amber-500" },
  },
  {
    icon: Users,
    title: "Експертна підтримка",
    description: "Консультації від офіційних дилерів та сервісних центрів.",
    color: { bg: "bg-pink-500/15", text: "text-pink-500" },
  },
  {
    icon: Globe,
    title: "Глобальна якість",
    description: "Продукція, що відповідає міжнародним стандартам безпеки.",
    color: { bg: "bg-teal-500/15", text: "text-teal-500" },
  },
];
