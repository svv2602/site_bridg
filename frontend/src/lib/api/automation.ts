/**
 * Automation API Client
 *
 * Client for interacting with the content automation API endpoints.
 */

const AUTOMATION_API =
  process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3001";

// Types
export interface AutomationStats {
  tiresProcessed: number;
  articlesCreated: number;
  badgesAssigned: number;
  totalCost: number;
  errorCount: number;
  lastRun: string | null;
}

export interface AutomationStatus {
  status: "running" | "idle";
  nextRun: string;
  timezone: string;
}

export interface Job {
  id: string;
  type: "full" | "scrape" | "generate" | "publish";
  status: "success" | "failed" | "running";
  startedAt: string;
  completedAt: string | null;
  itemsProcessed: number;
  errors: string[];
}

export interface TriggerResponse {
  success: boolean;
  message: string;
}

/**
 * Fetch automation statistics
 */
export async function getAutomationStats(): Promise<AutomationStats> {
  const response = await fetch(`${AUTOMATION_API}/api/automation/stats`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch automation status (current state and next run)
 */
export async function getAutomationStatus(): Promise<AutomationStatus> {
  const response = await fetch(`${AUTOMATION_API}/api/automation/status`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Trigger automation run
 */
export async function triggerAutomation(
  type: "full" | "scrape" | "generate"
): Promise<TriggerResponse> {
  const response = await fetch(`${AUTOMATION_API}/api/automation/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger automation: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch recent jobs (placeholder - not yet implemented in backend)
 */
export async function getRecentJobs(): Promise<Job[]> {
  // TODO: Implement when backend endpoint is ready
  // For now, return empty array as there's no persistent job storage yet
  return [];
}
