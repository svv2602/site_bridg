"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  FileText,
  Trophy,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Play,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

// Types
interface AutomationStats {
  tiresProcessed: number;
  articlesCreated: number;
  badgesAssigned: number;
  totalCost: number;
  errorCount: number;
  lastRun: string | null;
}

interface AutomationStatus {
  status: "running" | "idle";
  nextRun: string;
  timezone: string;
}

interface Job {
  id: string;
  type: "full" | "scrape" | "generate" | "publish";
  status: "success" | "failed" | "running";
  startedAt: string;
  completedAt: string | null;
  itemsProcessed: number;
  errors: string[];
}

// API URL
const AUTOMATION_API =
  process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3001";

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
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: Job["status"] }) {
  const statusClasses = {
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    running: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };

  const statusIcons = {
    success: CheckCircle2,
    failed: XCircle,
    running: Loader2,
  };

  const Icon = statusIcons[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusClasses[status]}`}
    >
      <Icon className={`h-3 w-3 ${status === "running" ? "animate-spin" : ""}`} />
      {status === "success" ? "Успішно" : status === "failed" ? "Помилка" : "В процесі"}
    </span>
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
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}) {
  const baseClasses =
    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses =
    variant === "primary"
      ? "bg-primary text-white hover:bg-primary/90"
      : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600";

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export default function AutomationDashboard() {
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [status, setStatus] = useState<AutomationStatus | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [statsRes, statusRes] = await Promise.all([
        fetch(`${AUTOMATION_API}/api/automation/stats`),
        fetch(`${AUTOMATION_API}/api/automation/status`),
      ]);

      if (!statsRes.ok || !statusRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [statsData, statusData] = await Promise.all([
        statsRes.json(),
        statusRes.json(),
      ]);

      setStats(statsData);
      setStatus(statusData);

      // Mock jobs data for now (until backend implements it)
      setJobs([
        {
          id: "1",
          type: "full",
          status: "success",
          startedAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date(Date.now() - 86400000 + 300000).toISOString(),
          itemsProcessed: 12,
          errors: [],
        },
        {
          id: "2",
          type: "scrape",
          status: "success",
          startedAt: new Date(Date.now() - 172800000).toISOString(),
          completedAt: new Date(Date.now() - 172800000 + 120000).toISOString(),
          itemsProcessed: 45,
          errors: [],
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Trigger automation
  const triggerAutomation = async (type: "full" | "scrape" | "generate") => {
    setActionLoading(type);
    try {
      const res = await fetch(`${AUTOMATION_API}/api/automation/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) {
        throw new Error("Failed to trigger automation");
      }

      // Add running job to list
      const newJob: Job = {
        id: Date.now().toString(),
        type,
        status: "running",
        startedAt: new Date().toISOString(),
        completedAt: null,
        itemsProcessed: 0,
        errors: [],
      };
      setJobs((prev) => [newJob, ...prev]);

      // Refresh after a short delay
      setTimeout(fetchData, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setActionLoading(null);
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("uk-UA", {
      timeZone: "Europe/Kyiv",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Job type labels
  const jobTypeLabels: Record<Job["type"], string> = {
    full: "Повний цикл",
    scrape: "Скрапінг",
    generate: "Генерація",
    publish: "Публікація",
  };

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
          <h1 className="text-2xl font-bold">Content Automation</h1>
          <p className="text-muted-foreground">
            Моніторинг та керування автоматизацією контенту
          </p>
        </div>
        <ActionButton
          onClick={fetchData}
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

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={Package}
          label="Шин оброблено"
          value={stats?.tiresProcessed ?? 0}
          color="blue"
        />
        <StatCard
          icon={FileText}
          label="Статей створено"
          value={stats?.articlesCreated ?? 0}
          color="green"
        />
        <StatCard
          icon={Trophy}
          label="Badges додано"
          value={stats?.badgesAssigned ?? 0}
          color="amber"
        />
        <StatCard
          icon={DollarSign}
          label="Витрати"
          value={`$${(stats?.totalCost ?? 0).toFixed(2)}`}
          color="purple"
        />
        <StatCard
          icon={AlertCircle}
          label="Помилок"
          value={stats?.errorCount ?? 0}
          color={stats?.errorCount ? "red" : "gray"}
        />
      </div>

      {/* Schedule Info & Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Schedule Info */}
        <div className="rounded-lg border border-border bg-white p-6 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Розклад</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Останній запуск</p>
                <p className="font-medium">
                  {stats?.lastRun ? formatDate(stats.lastRun) : "Ще не було"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Наступний запуск</p>
                <p className="font-medium">
                  {status?.nextRun ? formatDate(status.nextRun) : "—"}
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-zinc-50 p-3 text-sm text-muted-foreground dark:bg-zinc-900">
              Автоматичний запуск: щонеділі о 03:00 ({status?.timezone})
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-lg border border-border bg-white p-6 dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold">Дії</h2>
          <div className="space-y-3">
            <ActionButton
              onClick={() => triggerAutomation("full")}
              loading={actionLoading === "full"}
              disabled={actionLoading !== null}
            >
              <Play className="h-4 w-4" />
              Повний цикл
            </ActionButton>
            <div className="flex gap-3">
              <ActionButton
                onClick={() => triggerAutomation("scrape")}
                loading={actionLoading === "scrape"}
                disabled={actionLoading !== null}
                variant="secondary"
              >
                Тільки скрапінг
              </ActionButton>
              <ActionButton
                onClick={() => triggerAutomation("generate")}
                loading={actionLoading === "generate"}
                disabled={actionLoading !== null}
                variant="secondary"
              >
                Тільки генерація
              </ActionButton>
            </div>
            <p className="text-xs text-muted-foreground">
              Запустіть автоматизацію вручну, якщо потрібно оновити контент до наступного запланованого запуску.
            </p>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="rounded-lg border border-border bg-white dark:bg-zinc-800">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold">Останні запуски</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-zinc-50 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Тип
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Статус
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Початок
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Завершення
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Оброблено
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Немає записів
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {jobTypeLabels[job.type]}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(job.startedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {job.completedAt ? formatDate(job.completedAt) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm">{job.itemsProcessed}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
