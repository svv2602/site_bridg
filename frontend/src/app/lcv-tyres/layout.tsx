import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Шини для комерційних авто (LCV) | Bridgestone Україна",
  description: "Шини Bridgestone для легких комерційних авто: фургони, мікроавтобуси, вантажні мінівени. Літні, зимові та всесезонні шини з високою вантажопідйомністю.",
  alternates: {
    canonical: '/lcv-tyres',
  },
};

export default function LcvTyresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
