import { PINK, SOFT } from '@/components/dashboard/constants'
import { flag } from '@/components/dashboard/format'
import { NM_KM } from '@/lib/constants'
import { num } from '@/lib/format'
import { clamp, distKm } from '@/lib/geo'
import type { FlightRoute, SkyPlane } from '@/lib/types'

export function RouteCard({
  route,
  plane,
}: {
  route: FlightRoute | null
  plane: SkyPlane
}) {
  const o = route?.origin
  const d = route?.destination
  if (!o || !d) {
    return (
      <section className="ov-card" style={{ background: SOFT[1] }}>
        <h2>Route</h2>
        <p className="ov-muted">
          No route known for this callsign. Private, military and some cargo
          flights are not in the route database.
        </p>
      </section>
    )
  }
  const total = distKm(o.latitude, o.longitude, d.latitude, d.longitude)
  const flown = distKm(o.latitude, o.longitude, plane.lat, plane.lon)
  const left = distKm(plane.lat, plane.lon, d.latitude, d.longitude)
  const pct = clamp(flown / (flown + left || 1), 0, 1)
  const hours = plane.gs ? left / (plane.gs * NM_KM) : null
  const eta =
    hours == null
      ? null
      : hours >= 1
        ? `${Math.floor(hours)} h ${Math.round((hours % 1) * 60)} min`
        : `${Math.round(hours * 60)} min`

  return (
    <section className="ov-card" style={{ background: SOFT[1] }}>
      <div className="ov-route">
        <div>
          <div className="ov-iata">{o.iata_code}</div>
          <div className="ov-muted">
            {o.municipality}
            <br />
            {flag(o.country_iso_name)} {o.name}
          </div>
        </div>
        <div className="ov-route-end">
          <div className="ov-iata">{d.iata_code}</div>
          <div className="ov-muted">
            {d.municipality}
            <br />
            {flag(d.country_iso_name)} {d.name}
          </div>
        </div>
      </div>

      <div
        className="ov-track"
        aria-label={`${Math.round(pct * 100)} percent of the route flown`}
      >
        <div className="ov-track-line" />
        <div className="ov-track-done" style={{ width: `${pct * 100}%` }} />
        <svg
          className="ov-track-plane"
          style={{ left: `${pct * 100}%` }}
          viewBox="-12 -12 24 24"
        >
          <path
            d="M0 -10 L6 8 L0 5 L-6 8 Z"
            transform="rotate(90)"
            fill={PINK}
          />
        </svg>
      </div>

      <div className="ov-route-stats">
        <span>
          <b>{num(flown)} km</b> flown
        </span>
        <span>
          <b>{num(left)} km</b> to go{eta ? `, about ${eta}` : ''}
        </span>
        <span className="ov-muted">{num(total)} km in total</span>
      </div>
    </section>
  )
}
