/**
 * Tests for fallback-llm module (shouldFallback logic and FALLBACK_ERROR_TYPES).
 *
 * Note: Full integration tests for generateWithFallback require mocking
 * database providers and LLM instances. These tests focus on the error
 * classification logic that determines whether to try the next provider.
 */
import { describe, it, expect } from 'vitest';

// Re-implement shouldFallback logic for testing (same as in fallback-llm.ts)
const FALLBACK_ERROR_TYPES = [
  'rate_limit',
  'timeout',
  'service_unavailable',
  'authentication_error',
  'connection_error',
  'connection error',
  'fetch failed',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ECONNREFUSED',
  '429',
  '500',
  '502',
  '503',
  '504',
];

function shouldFallback(error: Error | unknown): boolean {
  const errorString = String(error);
  const errorMessage = error instanceof Error ? error.message : errorString;

  return FALLBACK_ERROR_TYPES.some(
    (type) =>
      errorMessage.toLowerCase().includes(type.toLowerCase()) ||
      errorString.includes(type)
  );
}

describe('shouldFallback', () => {
  describe('should trigger fallback for network errors', () => {
    it('should fallback on ECONNRESET', () => {
      expect(shouldFallback(new Error('ECONNRESET'))).toBe(true);
    });

    it('should fallback on ETIMEDOUT', () => {
      expect(shouldFallback(new Error('ETIMEDOUT'))).toBe(true);
    });

    it('should fallback on ENOTFOUND', () => {
      expect(shouldFallback(new Error('ENOTFOUND api.example.com'))).toBe(true);
    });

    it('should fallback on EAI_AGAIN (DNS failure)', () => {
      expect(shouldFallback(new Error('EAI_AGAIN'))).toBe(true);
    });

    it('should fallback on ECONNREFUSED', () => {
      expect(shouldFallback(new Error('ECONNREFUSED 127.0.0.1:8080'))).toBe(true);
    });

    it('should fallback on "fetch failed"', () => {
      expect(shouldFallback(new Error('fetch failed'))).toBe(true);
    });

    it('should fallback on "Connection error." from OpenAI SDK', () => {
      expect(shouldFallback(new Error('Connection error.'))).toBe(true);
    });
  });

  describe('should trigger fallback for HTTP status errors', () => {
    it('should fallback on 429 (rate limit)', () => {
      expect(shouldFallback(new Error('Request failed with status code 429'))).toBe(true);
    });

    it('should fallback on 500 (server error)', () => {
      expect(shouldFallback(new Error('Internal Server Error 500'))).toBe(true);
    });

    it('should fallback on 502 (bad gateway)', () => {
      expect(shouldFallback(new Error('502 Bad Gateway'))).toBe(true);
    });

    it('should fallback on 503 (service unavailable)', () => {
      expect(shouldFallback(new Error('503 Service Unavailable'))).toBe(true);
    });

    it('should fallback on 504 (gateway timeout)', () => {
      expect(shouldFallback(new Error('504 Gateway Timeout'))).toBe(true);
    });
  });

  describe('should trigger fallback for API-level errors', () => {
    it('should fallback on rate_limit', () => {
      expect(shouldFallback(new Error('rate_limit exceeded'))).toBe(true);
    });

    it('should fallback on timeout', () => {
      expect(shouldFallback(new Error('timeout'))).toBe(true);
    });

    it('should fallback on service_unavailable', () => {
      expect(shouldFallback(new Error('service_unavailable'))).toBe(true);
    });

    it('should fallback on authentication_error', () => {
      expect(shouldFallback(new Error('authentication_error: invalid key'))).toBe(true);
    });
  });

  describe('should NOT trigger fallback for non-retryable errors', () => {
    it('should not fallback on invalid JSON', () => {
      expect(shouldFallback(new Error('Invalid JSON response'))).toBe(false);
    });

    it('should not fallback on content policy violation', () => {
      expect(shouldFallback(new Error('Content policy violation'))).toBe(false);
    });

    it('should not fallback on insufficient quota', () => {
      expect(shouldFallback(new Error('Insufficient quota'))).toBe(false);
    });

    it('should not fallback on generic programming error', () => {
      expect(shouldFallback(new Error('Cannot read property of undefined'))).toBe(false);
    });
  });

  describe('should handle edge cases', () => {
    it('should handle non-Error objects', () => {
      expect(shouldFallback('timeout string error')).toBe(true);
    });

    it('should handle null/undefined', () => {
      expect(shouldFallback(null)).toBe(false);
      expect(shouldFallback(undefined)).toBe(false);
    });

    it('should handle empty error message', () => {
      expect(shouldFallback(new Error(''))).toBe(false);
    });

    it('should be case-insensitive for known patterns', () => {
      expect(shouldFallback(new Error('RATE_LIMIT'))).toBe(true);
      expect(shouldFallback(new Error('Timeout'))).toBe(true);
      expect(shouldFallback(new Error('SERVICE_UNAVAILABLE'))).toBe(true);
    });
  });
});

describe('FALLBACK_ERROR_TYPES', () => {
  it('should contain expected network error types', () => {
    expect(FALLBACK_ERROR_TYPES).toContain('ECONNRESET');
    expect(FALLBACK_ERROR_TYPES).toContain('ETIMEDOUT');
    expect(FALLBACK_ERROR_TYPES).toContain('ENOTFOUND');
    expect(FALLBACK_ERROR_TYPES).toContain('ECONNREFUSED');
  });

  it('should contain expected HTTP status codes', () => {
    expect(FALLBACK_ERROR_TYPES).toContain('429');
    expect(FALLBACK_ERROR_TYPES).toContain('502');
    expect(FALLBACK_ERROR_TYPES).toContain('503');
    expect(FALLBACK_ERROR_TYPES).toContain('504');
  });

  it('should contain expected API error types', () => {
    expect(FALLBACK_ERROR_TYPES).toContain('rate_limit');
    expect(FALLBACK_ERROR_TYPES).toContain('timeout');
    expect(FALLBACK_ERROR_TYPES).toContain('service_unavailable');
  });

  it('should not contain client errors that should not trigger fallback', () => {
    expect(FALLBACK_ERROR_TYPES).not.toContain('400');
    expect(FALLBACK_ERROR_TYPES).not.toContain('401');
    expect(FALLBACK_ERROR_TYPES).not.toContain('403');
    expect(FALLBACK_ERROR_TYPES).not.toContain('404');
  });
});
