import { fromCache, toCache } from '@/server/cache'
import { getConfig } from '@/server/config'
import { MAX_QUEUE_MS } from '@/server/constants'
import type { Cached, RawAircraft, UpstreamState } from '@/server/types'

// Upstream throttling is per process, so it lives on globalThis like the
// cache: a dev-server reload must not reset the rate-limit bookkeeping.
const globalForUpstream = globalThis as {
  __flightradarUpstream?: UpstreamState
}
const upstream = (globalForUpstream.__flightradarUpstream ??= {
  inflight: new Map(),
  pausedUntil: 0,
  nextSlot: 0,
})

/** Waits for this process's next free upstream slot. */
async function takeSlot() {
  const now = Date.now()
  const at = Math.max(now, upstream.nextSlot)
  if (at - now > MAX_QUEUE_MS) throw new Error('adsb.lol queue is full')
  upstream.nextSlot = at + getConfig().adsbMinGapMs
  if (at > now) await new Promise((resolve) => setTimeout(resolve, at - now))
}

async function fetchUpstream(path: string) {
  await takeSlot()
  if (Date.now() < upstream.pausedUntil) return
  const response = await fetch(`${getConfig().adsbUrl}${path}`, {
    // adsb.lol answers 403 to Node's default user agent.
    headers: {
      accept: 'application/json',
      'user-agent': getConfig().userAgent,
    },
    signal: AbortSignal.timeout(6_000),
  })
  if (response.status === 420 || response.status === 429) {
    const seconds =
      Number(response.headers.get('retry-after')) ||
      getConfig().adsbPauseMs / 1000
    upstream.pausedUntil = Date.now() + seconds * 1000
  }
  if (!response.ok) throw new Error(`adsb.lol answered ${response.status}`)
  const json = (await response.json()) as { ac?: unknown }
  const list = Array.isArray(json.ac) ? (json.ac as RawAircraft[]) : []
  toCache(
    `adsb:${path}`,
    { at: Date.now(), list } satisfies Cached,
    getConfig().adsbStaleMs,
  )
}

/** The latest answer for `path`, or null when there has been none lately. */
export async function adsb(
  path: string,
  ttl = getConfig().adsbCacheMs,
): Promise<Cached | null> {
  const key = `adsb:${path}`
  const hit = fromCache<Cached>(key)
  if (hit && Date.now() - hit.at < ttl) return hit
  if (Date.now() >= upstream.pausedUntil) {
    let pending = upstream.inflight.get(path)
    if (!pending) {
      pending = fetchUpstream(path).finally(() =>
        upstream.inflight.delete(path),
      )
      upstream.inflight.set(path, pending)
    }
    await pending.catch(() => {})
  }
  return fromCache<Cached>(key)
}
