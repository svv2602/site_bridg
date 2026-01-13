"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Car,
  Database,
  Layers,
  AlertCircle,
  RefreshCw,
  Play,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";

// Types
interface ImportProgress {
  stage:
    | "idle"
    | "preparing"
    | "brands"
    | "models"
    | "kits"
    | "sizes"
    | "indexing"
    | "done"
    | "error";
  currentTable: string;
  processedRows: number;
  totalRows: number;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  stats: ImportStats;
}

interface ImportStats {
  brands: number;
  models: number;
  kits: number;
  tyreSizes: number;
  filteredKits: number;
  filteredSizes: number;
}

interface StatusResponse {
  progress: ImportProgress;
  dbStats: ImportStats | null;
}

// API URL - бекенд Payload
const IMPORT_API =
  process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3001";

// Stage labels
const stageLabels: Record<ImportProgress["stage"], string> = {
  idle: "Очікування",
  preparing: "Підготовка",
  brands: "Імпорт марок",
  models: "Імпорт моделей",
  kits: "Імпорт комплектацій",
  sizes: "Імпорт розмірів шин",
  indexing: "Створення індексів",
  done: "Завершено",
  error: "Помилка",
};

// Stat Card Component
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
    green:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    purple:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    gray: "bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className="rounded-lg border border-border bg-white p-4 dark:bg-zinc-800">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">
            {typeof value === "number" ? value.toLocaleString("uk-UA") : value}
          </p>
        </div>
      </div>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({
  progress,
}: {
  progress: ImportProgress;
}) {
  const stages: ImportProgress["stage"][] = [
    "brands",
    "models",
    "kits",
    "sizes",
    "indexing",
  ];

  const currentIndex = stages.indexOf(progress.stage);
  const isRunning =
    progress.stage !== "idle" &&
    progress.stage !== "done" &&
    progress.stage !== "error";

  if (progress.stage === "idle") {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-white p-6 dark:bg-zinc-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Прогрес імпорту</h2>
        {isRunning && (
          <span className="inline-flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            {stageLabels[progress.stage]}
          </span>
        )}
        {progress.stage === "done" && (
          <span className="inline-flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Завершено
          </span>
        )}
        {progress.stage === "error" && (
          <span className="inline-flex items-center gap-2 text-sm text-red-600">
            <XCircle className="h-4 w-4" />
            Помилка
          </span>
        )}
      </div>

      {/* Stage progress bar */}
      <div className="mb-4 flex gap-1">
        {stages.map((stage, index) => {
          let bgClass = "bg-zinc-200 dark:bg-zinc-700";
          if (progress.stage === "done") {
            bgClass = "bg-green-500";
          } else if (progress.stage === "error" && index <= currentIndex) {
            bgClass = "bg-red-500";
          } else if (index < currentIndex) {
            bgClass = "bg-green-500";
          } else if (index === currentIndex && isRunning) {
            bgClass = "bg-blue-500 animate-pulse";
          }
          return (
            <div
              key={stage}
              className={`h-2 flex-1 rounded-full transition-colors ${bgClass}`}
            />
          );
        })}
      </div>

      {/* Current stage info */}
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Поточна таблиця:</span>
          <span className="font-medium">{progress.currentTable || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Оброблено рядків:</span>
          <span className="font-medium">
            {progress.processedRows.toLocaleString("uk-UA")}
          </span>
        </div>
        {progress.startedAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Розпочато:</span>
            <span className="font-medium">
              {new Date(progress.startedAt).toLocaleString("uk-UA")}
            </span>
          </div>
        )}
        {progress.completedAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Завершено:</span>
            <span className="font-medium">
              {new Date(progress.completedAt).toLocaleString("uk-UA")}
            </span>
          </div>
        )}
        {progress.error && (
          <div className="mt-2 rounded bg-red-50 p-2 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {progress.error}
          </div>
        )}
      </div>
    </div>
  );
}

// Action Button Component
function ActionButton({
  onClick,
  loading,
  disabled,
  variant = "primary",
  children,
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}) {
  const baseClasses =
    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    primary: "bg-primary text-primary-text hover:bg-primary-hover",
    secondary:
      "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export default function VehiclesImportPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`${IMPORT_API}/api/import/status`);

      if (!res.ok) {
        throw new Error("Failed to fetch status");
      }

      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh during import
  useEffect(() => {
    fetchStatus();

    const isRunning =
      status?.progress.stage &&
      status.progress.stage !== "idle" &&
      status.progress.stage !== "done" &&
      status.progress.stage !== "error";

    if (isRunning) {
      const interval = setInterval(fetchStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [fetchStatus, status?.progress.stage]);

  // Start import
  const startImport = async () => {
    setActionLoading("import");
    try {
      const res = await fetch(`${IMPORT_API}/api/import/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minYear: 2005 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start import");
      }

      // Start polling
      setTimeout(fetchStatus, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setActionLoading(null);
    }
  };

  // Reset tables
  const resetTables = async () => {
    if (!confirm("Ви впевнені, що хочете видалити всі дані та створити таблиці заново?")) {
      return;
    }

    setActionLoading("reset");
    try {
      const res = await fetch(`${IMPORT_API}/api/import/reset`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset tables");
      }

      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setActionLoading(null);
    }
  };

  const isRunning =
    status?.progress.stage &&
    status.progress.stage !== "idle" &&
    status.progress.stage !== "done" &&
    status.progress.stage !== "error";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicles Database</h1>
          <p className="text-muted-foreground">
            Імпорт бази автомобілів для підбору шин
          </p>
        </div>
        <ActionButton
          onClick={fetchStatus}
          loading={loading}
          variant="secondary"
        >
          <RefreshCw className="h-4 w-4" />
          Оновити
        </ActionButton>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards - DB Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Car}
          label="Марок авто"
          value={status?.dbStats?.brands ?? 0}
          color="blue"
        />
        <StatCard
          icon={Layers}
          label="Моделей"
          value={status?.dbStats?.models ?? 0}
          color="green"
        />
        <StatCard
          icon={Database}
          label="Комплектацій"
          value={status?.dbStats?.kits ?? 0}
          color="amber"
        />
        <StatCard
          icon={Database}
          label="Розмірів шин"
          value={status?.dbStats?.tyreSizes ?? 0}
          color="purple"
        />
      </div>

      {/* Progress */}
      {status?.progress && <ProgressBar progress={status.progress} />}

      {/* Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Import Info */}
        <div className="rounded-lg border border-border bg-white p-6 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Інформація</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Джерело даних</p>
                <p className="font-medium">CSV файли (db_size_auto/)</p>
              </div>
            </div>
            <div className="rounded-lg bg-zinc-50 p-3 text-muted-foreground dark:bg-zinc-900">
              <p className="mb-2 font-medium text-foreground">Фільтрація:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Тільки авто з 2005 року</li>
                <li>~207K комплектацій</li>
                <li>~800K розмірів шин</li>
              </ul>
            </div>
            <div className="rounded-lg bg-zinc-50 p-3 text-muted-foreground dark:bg-zinc-900">
              <p className="mb-2 font-medium text-foreground">Час імпорту:</p>
              <p>Приблизно 3-4 хвилини</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-lg border border-border bg-white p-6 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Дії</h2>
          <div className="space-y-3">
            <ActionButton
              onClick={startImport}
              loading={actionLoading === "import"}
              disabled={!!actionLoading || isRunning}
            >
              <Play className="h-4 w-4" />
              Запустити імпорт
            </ActionButton>
            <ActionButton
              onClick={resetTables}
              loading={actionLoading === "reset"}
              disabled={!!actionLoading || isRunning}
              variant="danger"
            >
              <Trash2 className="h-4 w-4" />
              Скинути таблиці
            </ActionButton>
            <p className="text-xs text-muted-foreground">
              &quot;Скинути таблиці&quot; видалить всі дані та створить порожні таблиці.
              Потім запустіть імпорт для заповнення даними.
            </p>
          </div>
        </div>
      </div>

      {/* Import Stats (if completed) */}
      {status?.progress.stage === "done" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-800 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Імпорт завершено успішно
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div>
              <p className="text-green-700 dark:text-green-500">Марок</p>
              <p className="text-xl font-semibold text-green-900 dark:text-green-300">
                {status.progress.stats.brands.toLocaleString("uk-UA")}
              </p>
            </div>
            <div>
              <p className="text-green-700 dark:text-green-500">Моделей</p>
              <p className="text-xl font-semibold text-green-900 dark:text-green-300">
                {status.progress.stats.models.toLocaleString("uk-UA")}
              </p>
            </div>
            <div>
              <p className="text-green-700 dark:text-green-500">Комплектацій</p>
              <p className="text-xl font-semibold text-green-900 dark:text-green-300">
                {status.progress.stats.filteredKits.toLocaleString("uk-UA")}
              </p>
            </div>
            <div>
              <p className="text-green-700 dark:text-green-500">Розмірів шин</p>
              <p className="text-xl font-semibold text-green-900 dark:text-green-300">
                {status.progress.stats.filteredSizes.toLocaleString("uk-UA")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
