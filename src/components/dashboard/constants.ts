/* House style: Source Sans 3, ink text, one pink accent, soft surfaces. */
export const INK = '#403c3e'
export const PINK = '#E11486'
export const SOFT = ['#FAF1F7', '#E0F5FF', '#F9EFE3', '#F7F0FF']

export const CATEGORY: Record<string, string> = {
  A1: 'Light aircraft',
  A2: 'Small aircraft',
  A3: 'Large aircraft',
  A4: 'Large, high vortex',
  A5: 'Heavy aircraft',
  A6: 'High performance',
  A7: 'Helicopter',
  B1: 'Glider',
  B2: 'Balloon',
  B6: 'Drone',
}

export const SQUAWK: Record<string, string> = {
  7500: 'Hijack code',
  7600: 'Radio failure',
  7700: 'General emergency',
}

/** Most tiles the grid has room for. */
export const MAX_TILES = 10
/** Other flights listed under the radar. */
export const MAX_OTHER_FLIGHTS = 4
/** Longer callsigns get a smaller font so they fit the card. */
export const LONG_CALLSIGN_LENGTH = 6
