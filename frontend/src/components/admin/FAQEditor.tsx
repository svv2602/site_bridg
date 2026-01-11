/**
 * FAQ Editor Component
 *
 * Editable list of FAQ items with add/remove functionality.
 */

"use client";

import { Trash2, Plus, GripVertical } from "lucide-react";
import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQEditorProps {
  faqs: FAQ[];
  onChange: (faqs: FAQ[]) => void;
  maxItems?: number;
  readOnly?: boolean;
}

export function FAQEditor({
  faqs,
  onChange,
  maxItems = 10,
  readOnly = false,
}: FAQEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (faqs.length >= maxItems) return;
    onChange([...faqs, { question: "", answer: "" }]);
  };

  const handleRemove = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...faqs];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, removed);

    onChange(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (faqs.length === 0 && readOnly) {
    return (
      <div className="text-center text-muted-foreground py-4">
        Немає FAQ
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div
          key={index}
          draggable={!readOnly}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`rounded-lg border border-border bg-white p-4 dark:bg-stone-800 ${
            draggedIndex === index ? "opacity-50" : ""
          } ${!readOnly ? "cursor-move" : ""}`}
        >
          <div className="flex items-start gap-3">
            {/* Drag handle */}
            {!readOnly && (
              <div className="mt-2 text-muted-foreground">
                <GripVertical className="h-5 w-5" />
              </div>
            )}

            {/* Fields */}
            <div className="flex-1 space-y-3">
              {/* Question */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Питання {index + 1}
                </label>
                {readOnly ? (
                  <p className="font-medium">{faq.question}</p>
                ) : (
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) =>
                      handleChange(index, "question", e.target.value)
                    }
                    placeholder="Введіть питання..."
                    className="w-full rounded-lg border border-border bg-stone-50 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:bg-stone-900"
                  />
                )}
              </div>

              {/* Answer */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Відповідь
                </label>
                {readOnly ? (
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                ) : (
                  <textarea
                    value={faq.answer}
                    onChange={(e) =>
                      handleChange(index, "answer", e.target.value)
                    }
                    placeholder="Введіть відповідь..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-border bg-stone-50 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:bg-stone-900"
                  />
                )}
              </div>
            </div>

            {/* Remove button */}
            {!readOnly && (
              <button
                onClick={() => handleRemove(index)}
                className="mt-2 rounded p-1 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add button */}
      {!readOnly && faqs.length < maxItems && (
        <button
          onClick={handleAdd}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Додати питання ({faqs.length}/{maxItems})
        </button>
      )}
    </div>
  );
}
