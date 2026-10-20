export type RawAircraft = Record<string, unknown>
export type Cached = { at: number; list: RawAircraft[] }

export type RouteAirport = {
  iata?: unknown
  icao?: unknown
  lat?: unknown
  lon?: unknown
  location?: unknown
  name?: unknown
  countryiso2?: unknown
}

/** Per-process upstream bookkeeping, shared across dev-server reloads. */
export type UpstreamState = {
  inflight: Map<string, Promise<void>>
  pausedUntil: number
  nextSlot: number
}

export type AppConfig = {
  latitude: number
  longitude: number
  timezone: string
  radiusNm: number
  /** Follow this flight instead of showing the sky above the house. */
  flightNumber: string | null
  view: 'led' | 'dashboard'
  brightness: number
  bloom: boolean
  pollMs: number
  adsbUrl: string
  routesUrl: string
  adsbdbUrl: string
  userAgent: string
  /** `airline`: airline and military flights only. `all`: every aircraft. */
  aircraftFilter: 'airline' | 'all'
  idleMs: number
  ledFps: number
  /** Cache and throttle timings, in milliseconds. */
  adsbCacheMs: number
  flightCacheMs: number
  adsbStaleMs: number
  adsbMinGapMs: number
  adsbPauseMs: number
  callsignCacheMs: number
  routeCacheMs: number
}
