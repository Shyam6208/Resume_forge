// ============================================================
// ResumeForge — Client-Side AI Result Cache
// ============================================================
//
// Caches AI results on the client to prevent redundant requests
// when content hasn't changed.
//
// - 10-minute TTL
// - Max 30 entries
// - Key = hash(resumeId + operation + sectionKey + contentHash + targetRole + jdHash)
// ============================================================

const CLIENT_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CLIENT_ENTRIES = 30;

interface ClientCacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

const clientCache = new Map<string, ClientCacheEntry>();

/**
 * Simple hash function for cache keys.
 */
function simpleHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Hash content data for cache key generation.
 */
export function contentHash(data: unknown): string {
  return simpleHash(JSON.stringify(data));
}

/**
 * Generate a client-side cache key.
 */
export function generateClientCacheKey(params: {
  resumeId?: string;
  operation: string;
  sectionKey?: string;
  content?: unknown;
  targetRole?: string;
  jobDescription?: string;
}): string {
  const parts = [
    params.resumeId || "no-id",
    params.operation,
    params.sectionKey || "",
    params.content ? contentHash(params.content) : "",
    params.targetRole || "",
    params.jobDescription ? simpleHash(params.jobDescription) : "",
  ];
  return simpleHash(parts.join("|"));
}

/**
 * Evict expired and LRU entries.
 */
function evictClient(): void {
  const now = Date.now();

  for (const [key, entry] of clientCache) {
    if (entry.expiresAt <= now) {
      clientCache.delete(key);
    }
  }

  while (clientCache.size > MAX_CLIENT_ENTRIES) {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;
    for (const [key, entry] of clientCache) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      clientCache.delete(oldestKey);
    } else {
      break;
    }
  }
}

/**
 * Get a cached client-side result. Returns null on miss.
 */
export function getClientCached<T = unknown>(key: string): T | null {
  const entry = clientCache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    clientCache.delete(key);
    return null;
  }

  entry.lastAccessed = Date.now();
  return entry.value as T;
}

/**
 * Store a result in the client-side cache.
 */
export function setClientCached<T = unknown>(key: string, value: T): void {
  const now = Date.now();
  clientCache.set(key, {
    value,
    expiresAt: now + CLIENT_CACHE_TTL_MS,
    lastAccessed: now,
  });
  evictClient();
}
