import { SOFT } from '@/components/dashboard/constants'
import type { TileProps } from '@/components/dashboard/types'

export function Tile({
  label,
  value,
  unit,
  sub,
  tone,
}: TileProps & { tone: number }) {
  return (
    <div className="ov-tile" style={{ background: SOFT[tone % 4] }}>
      <div className="ov-tile-label">{label}</div>
      <div className="ov-tile-value">
        {value}
        {unit && <span className="ov-tile-unit"> {unit}</span>}
      </div>
      {sub && <div className="ov-tile-sub">{sub}</div>}
    </div>
  )
}
