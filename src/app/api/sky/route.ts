import { NextResponse } from 'next/server'
import { RADIUS_MAX_NM, RADIUS_MIN_NM } from '@/lib/constants'
import { getConfig } from '@/server/config'
import { loadSky } from '@/server/sky'

// Read-only and public: no writes, and the house is only ever used here, never
// sent to the browser.
export const dynamic = 'force-dynamic'

const HEADERS = {
  'Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
}

export async function GET(request: Request) {
  // The URL may ask for a different radius than the one in .env.
  const requested = new URL(request.url).searchParams.get('radius')
  const radius = requested === null ? getConfig().radiusNm : Number(requested)
  if (
    !Number.isInteger(radius) ||
    radius < RADIUS_MIN_NM ||
    radius > RADIUS_MAX_NM
  ) {
    return NextResponse.json(
      {
        error: `radius must be a whole number from ${RADIUS_MIN_NM} to ${RADIUS_MAX_NM}.`,
      },
      { status: 400, headers: HEADERS },
    )
  }
  try {
    return NextResponse.json(await loadSky(radius), { headers: HEADERS })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Flight feed unreachable.' },
      { status: 502, headers: HEADERS },
    )
  }
}
