import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Car, Truck, type LucideIcon } from 'lucide-react';

interface VehicleTypeCardProps {
  title: string;
  description: string;
  image?: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
}

export function VehicleTypeCard({
  title,
  description,
  image,
  href,
  icon: Icon,
  gradient,
}: VehicleTypeCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Background */}
      <div className="relative h-64 md:h-72 lg:h-80">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          // Fallback: gradient with icon
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Icon className="h-48 w-48 text-white" strokeWidth={0.5} />
            </div>
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Категорія</span>
        </div>
        {/* Title - fixed height container */}
        <div className="mb-2 h-[2rem]">
          <h3 className="text-xl font-bold md:text-2xl line-clamp-1">{title}</h3>
        </div>
        {/* Description - fixed height container */}
        <div className="mb-4 h-[2.5rem]">
          <p className="text-sm opacity-90 line-clamp-2">{description}</p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3">
          Переглянути шини
          <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

// Pre-defined vehicle types data
export const vehicleTypesData = [
  {
    title: 'Легкові шини',
    description: 'Преміум шини для седанів, хетчбеків та компактних авто. Комфорт та безпека на кожному кілометрі.',
    href: '/passenger-tyres',
    icon: Car,
    gradient: 'from-blue-600 to-blue-900',
    image: undefined, // Add image path when available
  },
  {
    title: 'Шини для SUV',
    description: 'Надійні шини для кросоверів та позашляховиків. Впевненість на будь-якій дорозі.',
    href: '/suv-4x4-tyres',
    icon: Car,
    gradient: 'from-emerald-600 to-emerald-900',
    image: undefined,
  },
  {
    title: 'Комерційні шини',
    description: 'Шини для фургонів та мікроавтобусів. Максимальна довговічність та вантажопідйомність.',
    href: '/lcv-tyres',
    icon: Truck,
    gradient: 'from-amber-600 to-amber-900',
    image: undefined,
  },
];
