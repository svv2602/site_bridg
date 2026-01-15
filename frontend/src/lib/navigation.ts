import { Sun, Snowflake, Cloud, Car, Truck, Search, Mountain, type LucideIcon } from 'lucide-react';

export interface MegaMenuItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  description?: string;
  iconColor?: string; // Tailwind text color class
}

export interface MegaMenuColumn {
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuData {
  trigger: string;
  columns: MegaMenuColumn[];
}

export const tyresMenuData: MegaMenuData = {
  trigger: 'Шини',
  columns: [
    {
      title: 'За сезоном',
      items: [
        {
          label: 'Літні шини',
          href: '/passenger-tyres/summer',
          icon: Sun,
          iconColor: 'text-emerald-400',
          description: 'Для теплої пори року',
        },
        {
          label: 'Зимові шини',
          href: '/passenger-tyres/winter',
          icon: Snowflake,
          iconColor: 'text-sky-400',
          description: 'Для снігу та льоду',
        },
        {
          label: 'Всесезонні',
          href: '/passenger-tyres/all-season',
          icon: Cloud,
          iconColor: 'text-amber-400',
          description: 'Цілорічне використання',
        },
      ],
    },
    {
      title: 'За типом авто',
      items: [
        {
          label: 'Легкові',
          href: '/passenger-tyres',
          icon: Car,
          iconColor: 'text-blue-400',
          description: 'Седани та хетчбеки',
        },
        {
          label: 'SUV / 4x4',
          href: '/suv-4x4-tyres',
          icon: Mountain,
          iconColor: 'text-orange-400',
          description: 'Кросовери та позашляховики',
        },
        {
          label: 'Комерційні',
          href: '/lcv-tyres',
          icon: Truck,
          iconColor: 'text-stone-400',
          description: 'Вантажні та мікроавтобуси',
        },
      ],
    },
    {
      title: 'Підібрати шини',
      items: [
        {
          label: 'За типорозміром',
          href: '/tyre-search?mode=size',
          icon: Search,
          iconColor: 'text-purple-400',
          description: '205/55 R16 тощо',
        },
        {
          label: 'За автомобілем',
          href: '/tyre-search?mode=car',
          icon: Car,
          iconColor: 'text-cyan-400',
          description: 'Марка, модель, рік',
        },
      ],
    },
  ],
};

// Primary nav items (excluding mega-menu items)
export const primaryNav = [
  { href: '/dealers', label: 'Дилери' },
  { href: '/blog', label: 'Блог' },
  { href: '/about', label: 'Про нас' },
];

// Full nav for mobile/burger menu
export const fullNav = [
  { href: '/passenger-tyres', label: 'Легкові шини' },
  { href: '/suv-4x4-tyres', label: 'Шини для SUV' },
  { href: '/lcv-tyres', label: 'Комерційні шини' },
  { href: '/tyre-search', label: 'Пошук шин' },
  { href: '/dealers', label: 'Де купити' },
  { href: '/about', label: 'Про нас' },
  { href: '/blog', label: 'Блог' },
  { href: '/contacts', label: 'Контакти' },
];
