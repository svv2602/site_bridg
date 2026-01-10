/**
 * Benefits Editor Component
 *
 * Editable list of key benefits with add/remove functionality.
 */

"use client";

import { Trash2, Plus, GripVertical } from "lucide-react";
import { useState } from "react";

interface Benefit {
  benefit: string;
}

interface BenefitsEditorProps {
  benefits: Benefit[];
  onChange: (benefits: Benefit[]) => void;
  minItems?: number;
  maxItems?: number;
  readOnly?: boolean;
}

export function BenefitsEditor({
  benefits,
  onChange,
  minItems = 3,
  maxItems = 6,
  readOnly = false,
}: BenefitsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (benefits.length >= maxItems) return;
    onChange([...benefits, { benefit: "" }]);
  };

  const handleRemove = (index: number) => {
    if (benefits.length <= minItems) return;
    onChange(benefits.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, value: string) => {
    const updated = [...benefits];
    updated[index] = { benefit: value };
    onChange(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...benefits];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, removed);

    onChange(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (benefits.length === 0 && readOnly) {
    return (
      <div className="text-center text-muted-foreground py-4">
        Немає переваг
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {benefits.map((item, index) => (
        <div
          key={index}
          draggable={!readOnly}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-2 rounded-lg border border-border bg-white p-3 dark:bg-zinc-800 ${
            draggedIndex === index ? "opacity-50" : ""
          } ${!readOnly ? "cursor-move" : ""}`}
        >
          {/* Drag handle */}
          {!readOnly && (
            <div className="text-muted-foreground">
              <GripVertical className="h-4 w-4" />
            </div>
          )}

          {/* Number */}
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {index + 1}
          </span>

          {/* Input */}
          {readOnly ? (
            <p className="flex-1 text-sm">{item.benefit}</p>
          ) : (
            <input
              type="text"
              value={item.benefit}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`Перевага ${index + 1}...`}
              className="flex-1 rounded-lg border border-border bg-zinc-50 px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:bg-zinc-900"
            />
          )}

          {/* Remove button */}
          {!readOnly && benefits.length > minItems && (
            <button
              onClick={() => handleRemove(index)}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}

      {/* Add button */}
      {!readOnly && benefits.length < maxItems && (
        <button
          onClick={handleAdd}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Додати перевагу ({benefits.length}/{maxItems})
        </button>
      )}

      {/* Validation hint */}
      {!readOnly && benefits.length < minItems && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Мінімум {minItems} переваг
        </p>
      )}
    </div>
  );
}
