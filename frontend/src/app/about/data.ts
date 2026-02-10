import { Globe, Award, Shield, Users, Target, Zap } from "lucide-react";

export const stats = [
  { label: "Країн присутності", value: "150+", icon: Globe, color: { bg: "bg-teal-500/15", text: "text-teal-500" } },
  { label: "Років на ринку", value: "90+", icon: Award, color: { bg: "bg-yellow-500/15", text: "text-yellow-500" } },
  { label: "Дослідницьких центрів", value: "12", icon: Zap, color: { bg: "bg-amber-500/15", text: "text-amber-500" } },
  { label: "Сертифікатів якості", value: "ISO 9001", icon: Shield, color: { bg: "bg-emerald-500/15", text: "text-emerald-500" } },
];

export const values = [
  {
    icon: Shield,
    title: "Безпека",
    description: "Пріоритет номер один у кожній шині Bridgestone.",
    color: { bg: "bg-emerald-500/15", text: "text-emerald-500" },
  },
  {
    icon: Target,
    title: "Точність",
    description: "Інженерна точність та контроль якості на всіх етапах.",
    color: { bg: "bg-orange-500/15", text: "text-orange-500" },
  },
  {
    icon: Users,
    title: "Клієнтоорієнтованість",
    description: "Розуміння потреб водіїв та пропозиція оптимальних рішень.",
    color: { bg: "bg-pink-500/15", text: "text-pink-500" },
  },
  {
    icon: Globe,
    title: "Екологічність",
    description: "Інновації для зменшення впливу на довкілля.",
    color: { bg: "bg-teal-500/15", text: "text-teal-500" },
  },
];

export const timelineEvents = [
  { year: "1931", event: "Заснування компанії в місті Куробе, Японія." },
  { year: "1960", event: "Початок міжнародної експансії та відкриття перших заводів за межами Японії." },
  { year: "1988", event: "Придбання Firestone та зміцнення позицій на американському ринку." },
  { year: "2000\u2011ні", event: "Активний розвиток екологічних технологій та запуск лінійки \u00ABенергоефективних\u00BB шин." },
  { year: "Сьогодні", event: "Bridgestone — глобальний лідер з представництвом у понад 150 країнах, включаючи Україну." },
];
