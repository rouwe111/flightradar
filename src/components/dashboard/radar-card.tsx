import { SOFT } from '@/components/dashboard/constants'
import { OtherFlights } from '@/components/dashboard/other-flights'
import { Radar } from '@/components/dashboard/radar'
import type { SkyPlane } from '@/lib/types'

type Props = {
  planes: Array<SkyPlane>
  rangeKm: number
  targetHex: string
  onSelect: (hex: string) => void
}

/** The radar with the other flights listed under it. */
export function RadarCard({ planes, rangeKm, targetHex, onSelect }: Props) {
  return (
    <section className="ov-card ov-radar-card" style={{ background: SOFT[3] }}>
      <div className="ov-radar-wrap">
        <Radar
          planes={planes}
          rangeKm={rangeKm}
          selectedHex={targetHex}
          onSelect={onSelect}
        />
      </div>
      <OtherFlights planes={planes} targetHex={targetHex} />
    </section>
  )
}
