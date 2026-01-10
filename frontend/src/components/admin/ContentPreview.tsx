/**
 * Content Preview Component
 *
 * Side-by-side comparison of current vs generated content.
 */

"use client";

import { Check, AlertCircle } from "lucide-react";
import { useState } from "react";

interface ContentPreviewProps {
  current: {
    shortDescription: string;
    fullDescription: string;
    seoTitle: string;
    seoDescription: string;
    keyBenefitsCount: number;
    faqsCount: number;
  } | null;
  generated: {
    shortDescription: string;
    fullDescription: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string[];
    keyBenefits: Array<{ benefit: string }>;
    faqs: Array<{ question: string; answer: string }>;
    metadata: {
      generatedAt: string;
      provider: string;
      model: string;
      cost: number;
    };
  };
  diff: {
    hasChanges: boolean;
    fields: string[];
  };
  selectedFields: string[];
  onFieldToggle: (field: string) => void;
}

// Field configuration
const FIELDS = [
  { key: "shortDescription", label: "Короткий опис" },
  { key: "fullDescription", label: "Повний опис" },
  { key: "seoTitle", label: "SEO заголовок" },
  { key: "seoDescription", label: "SEO опис" },
  { key: "keyBenefits", label: "Переваги" },
  { key: "faqs", label: "FAQ" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

export function ContentPreview({
  current,
  generated,
  diff,
  selectedFields,
  onFieldToggle,
}: ContentPreviewProps) {
  const [expandedField, setExpandedField] = useState<FieldKey | null>(null);

  const renderFieldContent = (
    field: FieldKey,
    content: typeof current | typeof generated,
    isGenerated: boolean
  ) => {
    if (!content) {
      return <span className="text-muted-foreground italic">Порожньо</span>;
    }

    switch (field) {
      case "shortDescription":
        return (
          <p className="text-sm">
            {isGenerated
              ? generated.shortDescription
              : current?.shortDescription || "-"}
          </p>
        );

      case "fullDescription":
        if (isGenerated) {
          return (
            <div className="prose prose-sm max-h-60 overflow-y-auto dark:prose-invert">
              <pre className="whitespace-pre-wrap text-sm">
                {generated.fullDescription}
              </pre>
            </div>
          );
        }
        return (
          <p className="text-sm text-muted-foreground">
            {current?.fullDescription === "[Lexical content]"
              ? "[Lexical формат]"
              : current?.fullDescription || "-"}
          </p>
        );

      case "seoTitle":
        return (
          <p className="text-sm">
            {isGenerated ? generated.seoTitle : current?.seoTitle || "-"}
          </p>
        );

      case "seoDescription":
        return (
          <p className="text-sm">
            {isGenerated
              ? generated.seoDescription
              : current?.seoDescription || "-"}
          </p>
        );

      case "keyBenefits":
        if (isGenerated && generated.keyBenefits?.length) {
          return (
            <ul className="list-disc pl-4 text-sm">
              {generated.keyBenefits.map((item, i) => (
                <li key={i}>{item.benefit}</li>
              ))}
            </ul>
          );
        }
        return (
          <p className="text-sm text-muted-foreground">
            {current?.keyBenefitsCount
              ? `${current.keyBenefitsCount} переваг`
              : "-"}
          </p>
        );

      case "faqs":
        if (isGenerated && generated.faqs?.length) {
          return (
            <div className="space-y-2 text-sm">
              {generated.faqs.map((faq, i) => (
                <div key={i} className="rounded bg-zinc-50 p-2 dark:bg-zinc-900">
                  <p className="font-medium">{faq.question}</p>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          );
        }
        return (
          <p className="text-sm text-muted-foreground">
            {current?.faqsCount ? `${current.faqsCount} питань` : "-"}
          </p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Metadata */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Провайдер: {generated.metadata.provider} ({generated.metadata.model})
        </span>
        <span>Вартість: ${generated.metadata.cost.toFixed(4)}</span>
        <span>
          Згенеровано:{" "}
          {new Date(generated.metadata.generatedAt).toLocaleString("uk-UA")}
        </span>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {FIELDS.map(({ key, label }) => {
          const isChanged = diff.fields.includes(key);
          const isSelected = selectedFields.includes(key);
          const isExpanded = expandedField === key;

          return (
            <div
              key={key}
              className={`rounded-lg border ${
                isChanged
                  ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-900/10"
                  : "border-border bg-white dark:bg-zinc-800"
              }`}
            >
              {/* Header */}
              <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => setExpandedField(isExpanded ? null : key)}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFieldToggle(key);
                    }}
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white dark:bg-zinc-700"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </button>

                  {/* Label */}
                  <span className="font-medium">{label}</span>

                  {/* Changed indicator */}
                  {isChanged && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <AlertCircle className="h-3 w-3" />
                      Змінено
                    </span>
                  )}
                </div>

                <span className="text-sm text-muted-foreground">
                  {isExpanded ? "Згорнути" : "Розгорнути"}
                </span>
              </div>

              {/* Content comparison */}
              {isExpanded && (
                <div className="grid gap-4 border-t border-border p-4 md:grid-cols-2">
                  {/* Current */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                      Поточний контент
                    </p>
                    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
                      {renderFieldContent(key, current, false)}
                    </div>
                  </div>

                  {/* Generated */}
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                      Згенерований
                    </p>
                    <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                      {renderFieldContent(key, generated, true)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SEO Keywords */}
      {generated.seoKeywords?.length > 0 && (
        <div className="rounded-lg border border-border bg-white p-4 dark:bg-zinc-800">
          <p className="mb-2 text-sm font-medium">SEO ключові слова</p>
          <div className="flex flex-wrap gap-2">
            {generated.seoKeywords.map((keyword, i) => (
              <span
                key={i}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs dark:bg-zinc-700"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
