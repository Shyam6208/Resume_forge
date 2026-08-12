// ============================================================
// ResumeForge — useAIRequest Hook (Duplicate Prevention + Client Cache)
// ============================================================

"use client";

import { useState, useCallback, useRef } from "react";
import {
  generateClientCacheKey,
  getClientCached,
  setClientCached,
} from "@/lib/ai/ai-client-cache";

interface UseAIRequestOptions {
  /** The API endpoint path, e.g. "/api/ai/analyze" */
  endpoint: string;
  /** A unique operation name for cache keying, e.g. "analyze" */
  operation: string;
  /** Cache key params — if provided, enables caching */
  cacheParams?: {
    resumeId?: string;
    sectionKey?: string;
    content?: unknown;
    targetRole?: string;
    jobDescription?: string;
  };
}

interface UseAIRequestReturn<T> {
  /** Execute the AI request with the given body. Returns result or null. */
  execute: (body: Record<string, unknown>) => Promise<T | null>;
  /** Whether a request is currently in flight */
  isLoading: boolean;
  /** The last result */
  result: T | null;
  /** The last error message */
  error: string | null;
  /** Whether the last result was from cache */
  wasCached: boolean;
}

/**
 * Hook that wraps AI API calls with:
 * - Duplicate request prevention (rejects concurrent calls)
 * - Client-side result caching
 * - Loading state
 */
export function useAIRequest<T = unknown>(
  options: UseAIRequestOptions
): UseAIRequestReturn<T> {
  const { endpoint, operation, cacheParams } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wasCached, setWasCached] = useState(false);

  // Track in-flight requests to prevent duplicates
  const inFlightRef = useRef(false);

  const execute = useCallback(
    async (body: Record<string, unknown>): Promise<T | null> => {
      // Prevent duplicate concurrent requests
      if (inFlightRef.current) {
        return null;
      }

      // Check client cache
      if (cacheParams) {
        const cacheKey = generateClientCacheKey({
          ...cacheParams,
          operation,
        });
        const cached = getClientCached<T>(cacheKey);
        if (cached) {
          setResult(cached);
          setWasCached(true);
          setError(null);
          return cached;
        }
      }

      inFlightRef.current = true;
      setIsLoading(true);
      setError(null);
      setWasCached(false);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `Request failed (HTTP ${res.status})`);
        }

        const data: T = await res.json();
        setResult(data);

        // Cache the result
        if (cacheParams) {
          const cacheKey = generateClientCacheKey({
            ...cacheParams,
            operation,
          });
          setClientCached(cacheKey, data);
        }

        return data;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "AI request failed";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
        inFlightRef.current = false;
      }
    },
    [endpoint, operation, cacheParams]
  );

  return { execute, isLoading, result, error, wasCached };
}
