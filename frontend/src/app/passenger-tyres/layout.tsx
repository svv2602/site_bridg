import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Легкові шини Bridgestone | Літні, зимові, всесезонні",
  description: "Шини Bridgestone для легкових автомобілів: літні, зимові та всесезонні моделі. Преміум якість, безпека та комфорт для вашого авто.",
  alternates: {
    canonical: '/passenger-tyres',
  },
};

export default function PassengerTyresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
