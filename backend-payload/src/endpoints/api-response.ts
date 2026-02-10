/**
 * Standardized API response helpers.
 *
 * Envelope format:
 *   { data: T, meta?: { jobId?, timestamp?, page? } }
 *   { error: string, meta?: { timestamp? } }
 */

interface ApiMeta {
  jobId?: string;
  timestamp?: string;
  page?: number;
  totalPages?: number;
  totalDocs?: number;
}

export function apiResponse<T>(data: T, meta?: ApiMeta): Response {
  return Response.json({
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

export function apiError(message: string, status: number = 500, meta?: ApiMeta): Response {
  return Response.json(
    {
      error: message,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status }
  );
}
