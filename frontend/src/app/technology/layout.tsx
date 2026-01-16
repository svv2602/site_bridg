import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Технології Bridgestone | Інновації у виробництві шин",
  description: "Передові технології Bridgestone: ENLITEN, Run-Flat, DriveGuard та інші. Дізнайтеся про інновації, що роблять ваші поїздки безпечнішими.",
  alternates: {
    canonical: '/technology',
  },
};

export default function TechnologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
