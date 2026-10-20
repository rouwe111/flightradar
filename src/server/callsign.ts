import { fromCache, toCache } from '@/server/cache'
import { getConfig } from '@/server/config'
import { textOrNull } from '@/server/parse'

/**
 * Aircraft broadcast the ICAO callsign (KLM1001), people type the flight
 * number (KL1001). adsbdb knows both; when it doesn't, the input is used
 * as the callsign.
 */
export async function resolveCallsign(flightNumber: string) {
  const key = `adsbdb-callsign:${flightNumber}`
  const hit = fromCache<string>(key)
  if (hit) return hit
  let callsign = flightNumber
  try {
    const response = await fetch(
      `${getConfig().adsbdbUrl}/v0/callsign/${encodeURIComponent(flightNumber)}`,
      {
        headers: {
          accept: 'application/json',
          'user-agent': getConfig().userAgent,
        },
        signal: AbortSignal.timeout(8_000),
      },
    )
    if (response.ok) {
      const json = (await response.json()) as {
        response?: { flightroute?: { callsign_icao?: unknown } }
      }
      callsign =
        textOrNull(json.response?.flightroute?.callsign_icao) ?? flightNumber
    }
  } catch {
    // Unknown route or adsbdb down: try the input as typed.
  }
  toCache(key, callsign, getConfig().callsignCacheMs)
  return callsign
}
