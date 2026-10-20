import { LRUCache } from 'lru-cache'

// One in-memory cache per process, kept on globalThis so a dev-server reload
// doesn't throw the data away. Entries expire on their own `ttl`, and the
// least recently used go first when MAX_ENTRIES is reached.
const MAX_ENTRIES = 2_000

const globalForCache = globalThis as {
  __flightradarCache?: LRUCache<string, { data: unknown }>
}
const cache = (globalForCache.__flightradarCache ??= new LRUCache({
  max: MAX_ENTRIES,
}))

export function fromCache<T>(key: string): T | null {
  const hit = cache.get(key)
  return hit ? (hit.data as T) : null
}

export function toCache(key: string, data: unknown, ttlMs: number) {
  cache.set(key, { data }, { ttl: ttlMs })
}
