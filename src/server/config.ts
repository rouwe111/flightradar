import {
  RADIUS_DEFAULT_NM,
  RADIUS_MAX_NM,
  RADIUS_MIN_NM,
} from '@/lib/constants'
import { parseFlightNumber } from '@/lib/flight-number'
import { DEFAULTS } from '@/server/constants'
import type { ClientConfig } from '@/lib/types'
import type { AppConfig } from '@/server/types'

let cached: AppConfig | undefined

function text(name: string) {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

function number(
  name: string,
  fallback: number | undefined,
  min: number,
  max: number,
) {
  const raw = text(name)
  if (raw === undefined) {
    if (fallback === undefined)
      throw new Error(`${name} is required (see .env.example).`)
    return fallback
  }
  const value = Number(raw)
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(
      `${name} must be a number between ${min} and ${max}, got "${raw}".`,
    )
  }
  return value
}

/** A number of seconds from the environment, as milliseconds. */
function seconds(name: string, fallback: number, min: number, max: number) {
  return Math.round(number(name, fallback, min, max) * 1000)
}

function url(name: string, fallback: string) {
  return (text(name) ?? fallback).replace(/\/+$/, '')
}

/**
 * Reads the setup from the environment (Next.js loads `.env` itself, and real
 * environment variables win). Throws a readable error for anything missing or
 * invalid; `instrumentation.ts` calls this at start so a typo fails early.
 */
export function getConfig(): AppConfig {
  if (cached) return cached
  const timezone =
    text('TIMEZONE') ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: timezone })
  } catch {
    throw new Error(
      `TIMEZONE "${timezone}" is not a valid time zone (e.g. Europe/Amsterdam).`,
    )
  }

  const rawFlight = text('FLIGHT_NUMBER')
  const flightNumber = rawFlight ? parseFlightNumber(rawFlight) : null
  if (rawFlight && !flightNumber) {
    throw new Error(
      `FLIGHT_NUMBER "${rawFlight}" is not a flight number such as KL1001.`,
    )
  }

  const view = (text('VIEW') ?? 'led').toLowerCase()
  if (view !== 'led' && view !== 'dashboard') {
    throw new Error(`VIEW must be "led" or "dashboard", got "${view}".`)
  }

  const bloom = (text('BLOOM') ?? 'true').toLowerCase()
  if (bloom !== 'true' && bloom !== 'false') {
    throw new Error(`BLOOM must be "true" or "false", got "${bloom}".`)
  }

  const adsbCacheMs = seconds('ADSB_CACHE_SECONDS', DEFAULTS.adsbCacheS, 1, 300)
  const flightCacheMs = seconds(
    'FLIGHT_CACHE_SECONDS',
    DEFAULTS.flightCacheS,
    1,
    600,
  )
  const adsbStaleMs = seconds(
    'ADSB_STALE_SECONDS',
    DEFAULTS.adsbStaleS,
    10,
    3600,
  )
  if (adsbStaleMs < Math.max(adsbCacheMs, flightCacheMs)) {
    throw new Error(
      'ADSB_STALE_SECONDS must be at least ADSB_CACHE_SECONDS and FLIGHT_CACHE_SECONDS.',
    )
  }

  const aircraftFilter = (text('AIRCRAFT_FILTER') ?? 'airline').toLowerCase()
  if (aircraftFilter !== 'airline' && aircraftFilter !== 'all') {
    throw new Error(
      `AIRCRAFT_FILTER must be "airline" or "all", got "${aircraftFilter}".`,
    )
  }

  cached = {
    latitude: number('HOME_LATITUDE', undefined, -90, 90),
    longitude: number('HOME_LONGITUDE', undefined, -180, 180),
    timezone,
    radiusNm: Math.round(
      number('RADIUS_NM', RADIUS_DEFAULT_NM, RADIUS_MIN_NM, RADIUS_MAX_NM),
    ),
    flightNumber,
    view,
    brightness: number('BRIGHTNESS', 1, 0.2, 1),
    bloom: bloom === 'true',
    pollMs: Math.round(number('POLL_SECONDS', 10, 5, 300) * 1000),
    adsbUrl: url('ADSB_API_URL', 'https://api.adsb.lol'),
    routesUrl: url('ROUTES_API_URL', 'https://adsb.im/api/0/routeset'),
    adsbdbUrl: url('ADSBDB_API_URL', 'https://api.adsbdb.com'),
    userAgent: text('USER_AGENT') ?? 'flightradar (personal flight display)',
    aircraftFilter,
    idleMs: seconds('IDLE_SECONDS', DEFAULTS.idleS, 1, 60),
    ledFps: Math.round(number('LED_FPS', DEFAULTS.ledFps, 1, 60)),
    adsbCacheMs,
    flightCacheMs,
    adsbStaleMs,
    adsbMinGapMs: seconds(
      'ADSB_MIN_GAP_SECONDS',
      DEFAULTS.adsbMinGapS,
      0.5,
      60,
    ),
    adsbPauseMs: seconds('ADSB_PAUSE_SECONDS', DEFAULTS.adsbPauseS, 1, 600),
    callsignCacheMs: seconds(
      'CALLSIGN_CACHE_SECONDS',
      DEFAULTS.callsignCacheS,
      60,
      7 * 24 * 3600,
    ),
    routeCacheMs: seconds(
      'ROUTE_CACHE_SECONDS',
      DEFAULTS.routeCacheS,
      60,
      24 * 3600,
    ),
  }
  return cached
}

// About 1 km. The browser never learns the house itself; distances and the
// radar centre don't need more.
const roundCoordinate = (value: number) => Math.round(value * 100) / 100

/** The part of the setup the browser may see. */
export function getClientConfig(): ClientConfig {
  const config = getConfig()
  return {
    home: {
      latitude: roundCoordinate(config.latitude),
      longitude: roundCoordinate(config.longitude),
      timezone: config.timezone,
    },
    radius: config.radiusNm,
    view: config.view,
    brightness: config.brightness,
    bloom: config.bloom,
    pollMs: config.pollMs,
    airlineOnly: config.aircraftFilter === 'airline',
    idleMs: config.idleMs,
    ledFps: config.ledFps,
    adsbdbUrl: config.adsbdbUrl,
  }
}
