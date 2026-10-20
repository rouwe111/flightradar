import {
  LONG_CALLSIGN_LENGTH,
  SOFT,
  SQUAWK,
} from '@/components/dashboard/constants'
import { flag } from '@/components/dashboard/format'
import type { Aircraft, FlightRoute, SkyPlane } from '@/lib/types'

type Props = {
  target: SkyPlane
  route: FlightRoute | null
  aircraft: Aircraft | null
  /** Whether the aircraft and airline lookups have finished. */
  done: boolean
}

/** The aircraft on show: operator, callsign, type, registration and photo. */
export function HeroCard({ target, route, aircraft, done }: Props) {
  const callsign = target.callsign || target.hex.toUpperCase()
  return (
    <section className="ov-card ov-hero" style={{ background: SOFT[0] }}>
      <div className="ov-airline">
        {route?.airline ? (
          <span>
            {flag(route.airline.country_iso)} {route.airline.name}
          </span>
        ) : (
          <span className="ov-muted">
            {done ? 'Operator unknown' : 'Looking up the operator'}
          </span>
        )}
      </div>
      <div
        className="ov-callsign"
        style={{
          fontSize: `calc(var(--u) * ${callsign.length > LONG_CALLSIGN_LENGTH ? 11 : 14})`,
        }}
      >
        {callsign}
      </div>
      <div className="ov-chips">
        {(aircraft || target.typeCode) && (
          <span className="ov-chip">
            {aircraft
              ? `${aircraft.manufacturer ?? ''} ${aircraft.type ?? ''}`
              : target.typeCode}
          </span>
        )}
        {(aircraft?.registration || target.registration) && (
          <span className="ov-chip">
            {aircraft?.registration || target.registration}
          </span>
        )}
        {aircraft?.registered_owner && (
          <span className="ov-chip">{aircraft.registered_owner}</span>
        )}
        {aircraft?.registered_owner_country_name && (
          <span className="ov-chip">
            {flag(aircraft.registered_owner_country_iso_name)}{' '}
            {aircraft.registered_owner_country_name}
          </span>
        )}
      </div>
      {target.squawk && SQUAWK[target.squawk] && (
        <p className="ov-alert">
          Squawk {target.squawk}: {SQUAWK[target.squawk]}.
        </p>
      )}
      {aircraft?.url_photo_thumbnail && (
        <img
          className="ov-photo"
          src={aircraft.url_photo_thumbnail}
          alt={`${aircraft.manufacturer ?? ''} ${aircraft.type ?? ''} with registration ${aircraft.registration ?? ''}`}
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      )}
    </section>
  )
}
