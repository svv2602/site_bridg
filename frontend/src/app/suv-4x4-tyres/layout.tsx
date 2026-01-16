import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Шини для SUV та 4x4 | Bridgestone Україна",
  description: "Шини Bridgestone для кросоверів та позашляховиків. Літні, зимові та всесезонні шини з підвищеною прохідністю та надійним зчепленням.",
  alternates: {
    canonical: '/suv-4x4-tyres',
  },
};

export default function SuvTyresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
