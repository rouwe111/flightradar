import { SOFT } from '@/components/dashboard/constants'
import type { DashboardFlight } from '@/components/dashboard/types'
import type { Sky } from '@/hooks/types'
import { num } from '@/lib/format'

type Props = {
  flight: DashboardFlight
  status: Sky['status']
  rangeKm: number
  pollMs: number
  /** Whether only airline and military flights are shown. */
  airlineOnly: boolean
}

/** Shown while there is no aircraft to show. */
export function EmptyCard({
  flight,
  status,
  rangeKm,
  pollMs,
  airlineOnly,
}: Props) {
  const looking = status === 'loading' || (flight && !flight.checked)
  return (
    <section className="ov-card ov-empty" style={{ background: SOFT[0] }}>
      <h2>
        {looking
          ? flight
            ? `Looking up ${flight.number}`
            : 'Looking up at the sky'
          : flight
            ? `${flight.number} is not in the air`
            : 'The sky is empty'}
      </h2>
      <p className="ov-muted">
        {status === 'loading'
          ? 'Waiting for the first flight data.'
          : flight
            ? `This screen checks every ${pollMs / 1000} seconds and shows the flight as soon as it is flying. Remove FLIGHT_NUMBER from .env to see the sky above the house.`
            : `No ${airlineOnly ? 'airline or military ' : ''}flights within ${num(rangeKm)} km. This screen refreshes every ${pollMs / 1000} seconds.`}
      </p>
    </section>
  )
}
