import { Screen } from '@/components/screen'
import { RADIUS_MAX_NM, RADIUS_MIN_NM } from '@/lib/constants'
import { getClientConfig } from '@/server/config'

// The setup is read from the environment on every request, not at build time.
export const dynamic = 'force-dynamic'

type Params = Record<string, string | string[] | undefined>

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

function numberParam(value: string | undefined, min: number, max: number) {
  if (value === undefined || value.trim() === '') return undefined
  const number = Number(value)
  return Number.isFinite(number) && number >= min && number <= max
    ? number
    : undefined
}

/**
 * The setup comes from .env. The URL can still override the look for one
 * screen: ?view=dashboard, ?radius=25, ?brightness=0.4, ?bloom=0.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Params>
}) {
  const params = await searchParams
  const config = getClientConfig()
  const view = first(params.view)
  return (
    <Screen
      config={config}
      view={view === 'led' || view === 'dashboard' ? view : config.view}
      radius={Math.round(
        numberParam(first(params.radius), RADIUS_MIN_NM, RADIUS_MAX_NM) ??
          config.radius,
      )}
      brightness={
        numberParam(first(params.brightness), 0.2, 1) ?? config.brightness
      }
      bloom={first(params.bloom) === '0' ? false : config.bloom}
    />
  )
}
