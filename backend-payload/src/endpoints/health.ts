import type { Endpoint } from 'payload';

/**
 * GET /api/health
 *
 * Health check endpoint for monitoring and load balancers.
 * Checks database connectivity and returns system status.
 */
export const healthEndpoint: Endpoint = {
  path: '/health',
  method: 'get',
  handler: async (req) => {
    const startTime = Date.now();
    const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

    // Check database connectivity
    try {
      const dbStart = Date.now();
      await req.payload.find({
        collection: 'users',
        limit: 1,
      });
      checks.database = {
        status: 'healthy',
        latency: Date.now() - dbStart,
      };
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // Check Payload CMS
    checks.payload = {
      status: req.payload ? 'healthy' : 'unhealthy',
    };

    // Determine overall status
    const isHealthy = Object.values(checks).every((c) => c.status === 'healthy');
    const totalLatency = Date.now() - startTime;

    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      latency: totalLatency,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
    };

    return Response.json(response, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  },
};

/**
 * GET /api/health/ready
 *
 * Readiness probe for Kubernetes/Docker.
 * Returns 200 only when the service is ready to accept traffic.
 */
export const readinessEndpoint: Endpoint = {
  path: '/health/ready',
  method: 'get',
  handler: async (req) => {
    try {
      // Check if we can query the database
      await req.payload.find({
        collection: 'users',
        limit: 1,
      });

      return Response.json(
        { ready: true, timestamp: new Date().toISOString() },
        { status: 200 }
      );
    } catch {
      return Response.json(
        { ready: false, timestamp: new Date().toISOString() },
        { status: 503 }
      );
    }
  },
};

/**
 * GET /api/health/live
 *
 * Liveness probe for Kubernetes/Docker.
 * Returns 200 if the process is running (regardless of dependencies).
 */
export const livenessEndpoint: Endpoint = {
  path: '/health/live',
  method: 'get',
  handler: async () => {
    return Response.json(
      { alive: true, timestamp: new Date().toISOString() },
      { status: 200 }
    );
  },
};
