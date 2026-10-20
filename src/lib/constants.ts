// About 28 km: roughly as far as a plane is still visible from the ground.
export const RADIUS_DEFAULT_NM = 15
export const RADIUS_MIN_NM = 5
export const RADIUS_MAX_NM = 250
export const NM_KM = 1.852

// ICAO airline callsign: three letters, then a number that may end in
// letters (KLM1001, RYR65YK). Private flights usually send the registration.
export const AIRLINE_CALLSIGN = /^[A-Z]{3}\d[A-Z0-9]{0,3}$/
// Light aircraft, helicopters, gliders, balloons, drones and the like.
// Category C is ground vehicles and obstacles, which aren't flights at all.
export const LIGHT_CATEGORIES = new Set([
  'A1',
  'A7',
  'B1',
  'B2',
  'B3',
  'B4',
  'B6',
  'B7',
])

export const COMPASS_POINTS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
]
