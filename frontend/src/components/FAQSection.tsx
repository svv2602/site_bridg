'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import type { FAQ } from '@/lib/data';

interface FAQSectionProps {
  faqs: FAQ[];
  tireName: string;
}

export function FAQSection({ faqs, tireName }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12">
      <div className="container mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Часті запитання</h2>
            <p className="text-sm text-muted-foreground">
              Відповіді на популярні питання про {tireName}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-border bg-card"
            >
              <button
                onClick={() => toggleItem(index)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted/50"
                aria-expanded={openIndex === index}
              >
                <span className="pr-4 font-medium">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
              </button>
              {openIndex === index && (
                <div className="border-t border-border px-6 py-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
