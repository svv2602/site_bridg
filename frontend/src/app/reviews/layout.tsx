import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Відгуки про шини Bridgestone | Bridgestone Україна",
  description: "Відгуки покупців про шини Bridgestone в Україні. Реальні враження від використання літніх, зимових та всесезонних шин.",
  alternates: {
    canonical: '/reviews',
  },
};

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
