import { Clock } from '@/components/dashboard/clock'
import type { DashboardFlight } from '@/components/dashboard/types'
import { UpdatedAgo } from '@/components/dashboard/updated-ago'
import type { Sky } from '@/hooks/types'
import { num } from '@/lib/format'

type Props = {
  flight: DashboardFlight
  status: Sky['status']
  planeCount: number
  rangeKm: number
  updatedAt: number | null
  timezone: string
}

/** The title, a one-line summary of the sky, and the clock. */
export function DashboardHeader({
  flight,
  status,
  planeCount,
  rangeKm,
  updatedAt,
  timezone,
}: Props) {
  return (
    <header className="ov-header">
      <div>
        <h1>{flight ? `Following ${flight.number}` : 'Above you right now'}</h1>
        <p className="ov-muted">
          {status === 'loading' && 'Looking up at the sky'}
          {status === 'ok' && (
            <>
              {planeCount} {planeCount === 1 ? 'flight' : 'flights'} within{' '}
              {num(rangeKm)} km
              <UpdatedAgo at={updatedAt} />.
            </>
          )}
          {status === 'error' && 'Flight feed unreachable. Retrying shortly.'}
        </p>
      </div>
      <Clock timezone={timezone} />
    </header>
  )
}
