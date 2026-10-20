import { AIRLINE_CALLSIGN, LIGHT_CATEGORIES } from '@/lib/constants'
import type { Plane } from '@/lib/types'

/**
 * Whether the screens show this aircraft: military flights, and anything
 * that looks like an airline flight rather than a private or light one.
 * The server drops the rest (`loadSky`) before routes are looked up, so
 * the route test only counts when a route is already known.
 */
export function isPreferredFlight(plane: Plane) {
  if (plane.military) return true
  const category = plane.category ?? ''
  if (LIGHT_CATEGORIES.has(category) || category.startsWith('C')) return false
  if (plane.route) return true
  const registration = plane.registration?.replace(/-/g, '')
  return (
    AIRLINE_CALLSIGN.test(plane.callsign) && plane.callsign !== registration
  )
}
