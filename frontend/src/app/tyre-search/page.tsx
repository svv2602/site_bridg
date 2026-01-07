import type { Metadata } from "next";
import TyreSearchPage from "./new-page";

export const metadata: Metadata = {
  title: "Пошук шин Bridgestone — за розміром та за авто",
  description:
    "Онлайн‑пошук шин Bridgestone в Україні: підбір за типорозміром або за маркою, моделлю та роком випуску автомобіля. Результати з демонстраційного каталогу.",
};

export default function Page() {
  return <TyreSearchPage />;
}