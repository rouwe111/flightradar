import { MAX_OTHER_FLIGHTS } from '@/components/dashboard/constants'
import { num } from '@/lib/format'
import type { SkyPlane } from '@/lib/types'

/** The next few flights after the one on show. */
export function OtherFlights({
  planes,
  targetHex,
}: {
  planes: Array<SkyPlane>
  targetHex: string
}) {
  return (
    <ul className="ov-list">
      {planes
        .filter((p) => p.hex !== targetHex)
        .slice(0, MAX_OTHER_FLIGHTS)
        .map((p) => (
          <li key={p.hex} className="ov-row">
            <span className="ov-row-call">
              {p.callsign || p.hex.toUpperCase()}
            </span>
            <span>{p.typeCode || '-'}</span>
            <span>{p.altFt != null ? `${num(p.altFt)} ft` : '-'}</span>
            <span>{num(p.dKm, 1)} km</span>
          </li>
        ))}
    </ul>
  )
}
