// src/lib/queryCache.ts
// Lightweight in-memory cache for Supabase SELECT queries.
// Deduplicates identical requests across components on the same page.
// Cache entries expire after TTL to avoid stale data.

const cache = new Map<string, { data: unknown; timestamp: number }>();
const DEFAULT_TTL = 30_000; // 30 seconds

export function getCachedQuery<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > DEFAULT_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCachedQuery<T>(key: string, data: T): void {
  // Limit cache size to prevent memory leaks
  if (cache.size > 50) {
    const oldest = cache.entries().next().value;
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearQueryCache(): void {
  cache.clear();
}
