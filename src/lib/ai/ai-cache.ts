// ============================================================
// ResumeForge — Server-Side AI Request Cache (In-Memory LRU)
// ============================================================
//
// Short-lived in-memory cache for identical AI requests.
// - 5-minute TTL
// - Max 50 entries with LRU eviction
// - Does NOT store API keys
// ============================================================

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRIES = 50;

const cache = new Map<string, CacheEntry>();

/**
 * Generate a deterministic hash string from arbitrary input.
 * Uses a simple djb2-style hash — fast and collision-resistant enough for caching.
 */
export function hashKey(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Build a cache key from operation name and relevant inputs.
 * Only pass content-relevant fields — never include API keys.
 */
export function buildCacheKey(
  operation: string,
  ...parts: (string | undefined | null)[]
): string {
  const raw = [operation, ...parts.filter(Boolean)].join("|");
  return hashKey(raw);
}

/**
 * Evict expired entries, then evict LRU entries if over capacity.
 */
function evict(): void {
  const now = Date.now();

  // 1. Remove expired
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) {
      cache.delete(key);
    }
  }

  // 2. LRU eviction if still over capacity
  while (cache.size > MAX_ENTRIES) {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;
    for (const [key, entry] of cache) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      cache.delete(oldestKey);
    } else {
      break;
    }
  }
}

/**
 * Get a cached result. Returns null on miss or expiration.
 */
export function getCached<T = unknown>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  // Update last accessed for LRU
  entry.lastAccessed = Date.now();
  return entry.value as T;
}

/**
 * Store a result in the cache.
 */
export function setCached<T = unknown>(key: string, value: T): void {
  const now = Date.now();
  cache.set(key, {
    value,
    expiresAt: now + CACHE_TTL_MS,
    lastAccessed: now,
  });
  evict();
}

/**
 * Get current cache size (useful for dev monitoring).
 */
export function getCacheSize(): number {
  return cache.size;
}
