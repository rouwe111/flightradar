export const W = 192
export const H = 108

export const COL = {
  txt: '#E0F5FF',
  dim: '#6B8794',
  warm: '#F9EFE3',
  pink: '#E11486',
  grid: '#243640',
  ring: '#3E5A68',
  white: '#FFFFFF',
  black: '#000000',
}

export const SQUAWK: Record<string, string> = {
  7500: 'HIJACK',
  7600: 'RADIO FAILURE',
  7700: 'EMERGENCY',
}

export const SWEEP_MS = 4000
// Centre x, centre y and radius, in LEDs.
export const MINI_RADAR = [176, 95, 12] as const
// The mini radar zooms to the smallest of these (km) that holds the tracked
// plane, capped at the search radius: fewer dots, and a close plane isn't a
// pixel from the centre.
export const MINI_RANGES_KM = [10, 20, 40]
// Dots fade within this share of a turn after the sweep passes them.
export const AFTERGLOW = 1 / 3

/* Shown only while there is no aircraft to follow. */
export const EMPTY_RADAR = { cx: 52, cy: 56, R: 46 }
