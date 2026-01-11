/**
 * Generation Controls Component
 *
 * Action buttons for generating, previewing, and publishing content.
 */

"use client";

import { Loader2, Sparkles, Eye, Upload, RefreshCw } from "lucide-react";

interface ContentStatus {
  hasRawData: boolean;
  hasGeneratedContent: boolean;
  isPublished: boolean;
}

interface GenerationControlsProps {
  modelSlug: string | null;
  status: ContentStatus | null;
  onGenerate: () => void;
  onRegenerate: () => void;
  onPreview: () => void;
  onPublish: () => void;
  isGenerating: boolean;
  isPublishing: boolean;
  disabled?: boolean;
}

export function GenerationControls({
  modelSlug,
  status,
  onGenerate,
  onRegenerate,
  onPreview,
  onPublish,
  isGenerating,
  isPublishing,
  disabled = false,
}: GenerationControlsProps) {
  const isDisabled = disabled || !modelSlug;

  return (
    <div className="flex flex-wrap gap-3">
      {/* Generate Button */}
      {!status?.hasGeneratedContent ? (
        <button
          onClick={onGenerate}
          disabled={isDisabled || isGenerating}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGenerating ? "Генерація..." : "Генерувати контент"}
        </button>
      ) : (
        <button
          onClick={onRegenerate}
          disabled={isDisabled || isGenerating}
          className="inline-flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-stone-600"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isGenerating ? "Генерація..." : "Перегенерувати"}
        </button>
      )}

      {/* Preview Button */}
      <button
        onClick={onPreview}
        disabled={isDisabled || !status?.hasGeneratedContent}
        className="inline-flex items-center gap-2 rounded-lg bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-stone-600"
      >
        <Eye className="h-4 w-4" />
        Переглянути
      </button>

      {/* Publish Button */}
      <button
        onClick={onPublish}
        disabled={isDisabled || !status?.hasGeneratedContent || isPublishing}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPublishing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {isPublishing ? "Публікація..." : "Опублікувати"}
      </button>
    </div>
  );
}
