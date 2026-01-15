/**
 * Key Benefits Component
 *
 * Displays a list of tire key benefits with icons.
 */

import { Check, Star } from "lucide-react";

interface KeyBenefitsProps {
  benefits: string[];
  title?: string;
}

export function KeyBenefits({
  benefits,
  title = "Ключові переваги",
}: KeyBenefitsProps) {
  if (!benefits || benefits.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/15">
          <Star className="h-5 w-5 text-purple-500" />
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {benefits.map((benefit, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-lg bg-background p-3"
          >
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Check className="h-3 w-3" />
            </div>
            <span className="text-sm text-foreground">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
