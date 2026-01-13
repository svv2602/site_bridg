/**
 * Content Generation Admin Page
 *
 * Interface for generating, previewing, and publishing AI content for tires.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Package,
  FileCheck,
  Clock,
  AlertCircle,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  DollarSign,
} from "lucide-react";
import { ModelSelector } from "@/components/admin/ModelSelector";
import { GenerationControls } from "@/components/admin/GenerationControls";
import { ContentPreview } from "@/components/admin/ContentPreview";
import { useContentGeneration } from "@/hooks/useContentGeneration";

// Stat Card Component (reused from automation page)
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "blue" | "green" | "amber" | "purple" | "gray" | "red";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    gray: "bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className="rounded-lg border border-border bg-white p-4 dark:bg-card">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Status Info Component
function StatusInfo({
  status,
}: {
  status: {
    hasRawData: boolean;
    hasGeneratedContent: boolean;
    isPublished: boolean;
    rawDataDate: string | null;
    generatedDate: string | null;
  } | null;
}) {
  if (!status) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 dark:bg-card">
        {status.hasRawData ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-muted" />
        )}
        <div>
          <p className="text-sm font-medium">Raw дані</p>
          <p className="text-xs text-muted-foreground">
            {status.hasRawData ? formatDate(status.rawDataDate) : "Немає"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 dark:bg-card">
        {status.hasGeneratedContent ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-muted" />
        )}
        <div>
          <p className="text-sm font-medium">Згенеровано</p>
          <p className="text-xs text-muted-foreground">
            {status.hasGeneratedContent
              ? formatDate(status.generatedDate)
              : "Немає"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 dark:bg-card">
        {status.isPublished ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-muted" />
        )}
        <div>
          <p className="text-sm font-medium">Опубліковано</p>
          <p className="text-xs text-muted-foreground">
            {status.isPublished ? "Так" : "Ні"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ContentGenerationPage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "shortDescription",
    "fullDescription",
    "seoTitle",
    "seoDescription",
    "keyBenefits",
    "faqs",
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const {
    tyres,
    status,
    preview,
    isLoading,
    isGenerating,
    isPublishing,
    error,
    fetchTyres,
    fetchStatus,
    fetchPreview,
    generate,
    publish,
    clearError,
  } = useContentGeneration();

  // Fetch tyres on mount
  useEffect(() => {
    fetchTyres();
  }, [fetchTyres]);

  // Fetch status when model selected
  useEffect(() => {
    if (selectedSlug) {
      fetchStatus(selectedSlug);
      setShowPreview(false);
    }
  }, [selectedSlug, fetchStatus]);

  // Calculate stats
  const totalTyres = tyres.length;
  const tyresWithContent = tyres.filter((t) => t.shortDescription).length;
  const tyresWithoutContent = totalTyres - tyresWithContent;

  // Handle generate
  const handleGenerate = useCallback(async () => {
    if (!selectedSlug) return;
    const success = await generate(selectedSlug, { scrape: true });
    if (success) {
      setShowPreview(true);
      await fetchPreview(selectedSlug);
    }
  }, [selectedSlug, generate, fetchPreview]);

  // Handle regenerate
  const handleRegenerate = useCallback(async () => {
    if (!selectedSlug) return;
    const success = await generate(selectedSlug, { regenerate: true });
    if (success) {
      setShowPreview(true);
      await fetchPreview(selectedSlug);
    }
  }, [selectedSlug, generate, fetchPreview]);

  // Handle preview
  const handlePreview = useCallback(async () => {
    if (!selectedSlug) return;
    await fetchPreview(selectedSlug);
    setShowPreview(true);
  }, [selectedSlug, fetchPreview]);

  // Handle publish
  const handlePublish = useCallback(async () => {
    if (!selectedSlug) return;
    await publish(selectedSlug, selectedFields);
  }, [selectedSlug, selectedFields, publish]);

  // Handle field toggle
  const handleFieldToggle = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Content Generation</h1>
          <p className="text-muted-foreground">
            Генерація контенту для шин за допомогою AI
          </p>
        </div>
        <button
          onClick={fetchTyres}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-stone-200 disabled:opacity-50 dark:bg-graphite dark:hover:bg-graphite-hover"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Оновити
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-sm underline hover:no-underline"
          >
            Закрити
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="Всього моделей"
          value={totalTyres}
          color="blue"
        />
        <StatCard
          icon={FileCheck}
          label="З контентом"
          value={tyresWithContent}
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Без контенту"
          value={tyresWithoutContent}
          color="amber"
        />
        <StatCard
          icon={DollarSign}
          label="Приблизна вартість"
          value={`$${(tyresWithoutContent * 0.05).toFixed(2)}`}
          color="purple"
        />
      </div>

      {/* Model Selection */}
      <div className="rounded-lg border border-border bg-white p-6 dark:bg-card">
        <h2 className="mb-4 text-lg font-semibold">Вибір моделі</h2>
        <ModelSelector
          tyres={tyres}
          selectedSlug={selectedSlug}
          onSelect={setSelectedSlug}
          disabled={isLoading}
        />

        {/* Status Info */}
        {selectedSlug && status && (
          <div className="mt-6 space-y-4">
            <StatusInfo status={status} />

            {/* Generation Controls */}
            <GenerationControls
              modelSlug={selectedSlug}
              status={status}
              onGenerate={handleGenerate}
              onRegenerate={handleRegenerate}
              onPreview={handlePreview}
              onPublish={handlePublish}
              isGenerating={isGenerating}
              isPublishing={isPublishing}
            />
          </div>
        )}
      </div>

      {/* Info Block */}
      {!selectedSlug && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          <Info className="mt-0.5 h-5 w-5" />
          <div>
            <p className="font-medium">Як використовувати</p>
            <ol className="mt-2 list-inside list-decimal text-sm">
              <li>Оберіть модель шини зі списку</li>
              <li>
                Натисніть &quot;Генерувати контент&quot; для збору даних та генерації
              </li>
              <li>Перегляньте згенерований контент та виберіть поля</li>
              <li>Натисніть &quot;Опублікувати&quot; для збереження в CMS</li>
            </ol>
          </div>
        </div>
      )}

      {/* Content Preview */}
      {showPreview && preview && (
        <div className="rounded-lg border border-border bg-white p-6 dark:bg-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Превью контенту</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>
                Обрано полів: {selectedFields.length}
              </span>
            </div>
          </div>

          <ContentPreview
            current={preview.current}
            generated={preview.generated}
            diff={preview.diff}
            selectedFields={selectedFields}
            onFieldToggle={handleFieldToggle}
          />
        </div>
      )}
    </div>
  );
}
