import type { Metadata } from "next";
import { Suspense } from "react";
import TyreSearchPage from "./new-page";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Пошук шин Bridgestone — за розміром та за авто",
  description:
    "Онлайн‑пошук шин Bridgestone в Україні: підбір за типорозміром або за маркою, моделлю та роком випуску автомобіля. Результати з демонстраційного каталогу.",
};

function SearchLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <TyreSearchPage />
    </Suspense>
  );
}