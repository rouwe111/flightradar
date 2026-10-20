import { Tile } from '@/components/dashboard/tile'
import type { TileProps } from '@/components/dashboard/types'

/** The telemetry tiles, each in the next soft colour. */
export function TilesGrid({ tiles }: { tiles: Array<TileProps> }) {
  return (
    <div className="ov-tiles">
      {tiles.map((tile, i) => (
        <Tile key={tile.label} {...tile} tone={i} />
      ))}
    </div>
  )
}
