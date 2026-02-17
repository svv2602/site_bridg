import Image from "next/image";
import { ExternalLink, ShoppingCart } from "lucide-react";

const onlineStores = [
  {
    name: "ProKoleso",
    url: "https://prokoleso.ua",
    logo: "/images/logos/prokoleso.svg",
    description:
      "Широкий асортимент шин Bridgestone з доставкою по всій Україні. Зручний підбір за параметрами та сезоном.",
  },
  {
    name: "Tvoya Shina",
    url: "https://tshina.ua",
    logo: "/images/logos/tshina.svg",
    description:
      "Офіційний інтернет-магазин мережі «Твоя Шина» — шини Bridgestone з можливістю самовивозу або доставки.",
  },
];

export function OnlineStores() {
  return (
    <section className="border-b border-border py-10 md:py-14">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <div>
            <div className="heading-2 text-2xl font-semibold tracking-tight">
              Купити онлайн
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Замовте шини Bridgestone в перевірених інтернет-магазинах
            </p>
          </div>
        </div>

        <div className="grid gap-6 pt-2 md:grid-cols-2">
          {onlineStores.map((store) => (
            <a
              key={store.url}
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 dark:bg-stone-200">
                  <Image
                    src={store.logo}
                    alt={store.name}
                    width={140}
                    height={32}
                    className="h-7 w-auto"
                  />
                </span>
                <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-700 dark:bg-stone-700 dark:text-stone-200">
                  Онлайн-магазин
                </span>
              </div>

              <p className="mb-6 text-sm text-muted-foreground">
                {store.description}
              </p>

              <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text transition-colors group-hover:bg-primary-hover">
                Перейти на сайт
                <ExternalLink className="h-4 w-4" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
