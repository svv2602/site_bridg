/**
 * Hook for content generation API operations
 */

import { useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3001";

// Types
export interface ContentStatus {
  modelSlug: string;
  tyreId: string | null;
  tyreExists: boolean;
  hasRawData: boolean;
  hasGeneratedContent: boolean;
  isPublished: boolean;
  rawDataDate: string | null;
  generatedDate: string | null;
  currentContent: {
    name: string;
    shortDescription: string | null;
    hasFullDescription: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
    keyBenefitsCount: number;
    faqsCount: number;
  } | null;
  generatedPreview: {
    shortDescription: string;
    seoTitle: string;
    keyBenefitsCount: number;
    faqsCount: number;
    costs: number;
  } | null;
}

export interface GeneratedContent {
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
}

export interface ContentPreview {
  modelSlug: string;
  generated: GeneratedContent;
  current: {
    shortDescription: string;
    fullDescription: string;
    seoTitle: string;
    seoDescription: string;
    keyBenefitsCount: number;
    faqsCount: number;
  } | null;
  diff: {
    hasChanges: boolean;
    fields: string[];
  };
  tyreId: string | null;
}

export interface TyreModel {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
}

export interface UseContentGenerationReturn {
  // Data
  tyres: TyreModel[];
  status: ContentStatus | null;
  preview: ContentPreview | null;

  // State
  isLoading: boolean;
  isGenerating: boolean;
  isPublishing: boolean;
  error: string | null;

  // Actions
  fetchTyres: () => Promise<void>;
  fetchStatus: (modelSlug: string) => Promise<void>;
  fetchPreview: (modelSlug: string) => Promise<void>;
  generate: (modelSlug: string, options?: { scrape?: boolean; regenerate?: boolean }) => Promise<boolean>;
  publish: (modelSlug: string, fields?: string[]) => Promise<boolean>;
  clearError: () => void;
}

export function useContentGeneration(authToken?: string): UseContentGenerationReturn {
  const [tyres, setTyres] = useState<TyreModel[]>([]);
  const [status, setStatus] = useState<ContentStatus | null>(null);
  const [preview, setPreview] = useState<ContentPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    return headers;
  }, [authToken]);

  // Fetch all tyres
  const fetchTyres = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/tyres?limit=100&sort=name`);
      if (!res.ok) throw new Error("Failed to fetch tyres");
      const data = await res.json();
      setTyres(data.docs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch status for a model
  const fetchStatus = useCallback(async (modelSlug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/api/content-generation/status/${modelSlug}`,
        { headers: getHeaders() }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch status");
      }
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  // Fetch preview for a model
  const fetchPreview = useCallback(async (modelSlug: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/api/content-generation/preview/${modelSlug}`,
        { headers: getHeaders() }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch preview");
      }
      const data = await res.json();
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setPreview(null);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  // Generate content
  const generate = useCallback(async (
    modelSlug: string,
    options?: { scrape?: boolean; regenerate?: boolean }
  ): Promise<boolean> => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/content-generation/generate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          modelSlug,
          scrape: options?.scrape ?? true,
          regenerate: options?.regenerate ?? false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate content");
      }

      // Refresh status and preview
      await fetchStatus(modelSlug);
      await fetchPreview(modelSlug);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [getHeaders, fetchStatus, fetchPreview]);

  // Publish content
  const publish = useCallback(async (
    modelSlug: string,
    fields?: string[]
  ): Promise<boolean> => {
    setIsPublishing(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/content-generation/publish`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ modelSlug, fields }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish content");
      }

      // Refresh status
      await fetchStatus(modelSlug);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [getHeaders, fetchStatus]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
  };
}
