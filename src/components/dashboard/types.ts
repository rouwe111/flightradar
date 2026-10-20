import type { Sky } from '@/hooks/types'

export type TileProps = {
  label: string
  value: string
  unit?: string
  sub?: string
}

export type DashboardFlight = Sky['flight']
