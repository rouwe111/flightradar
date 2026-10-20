// adsb.lol rate-limits per IP (nginx: roughly one request every two seconds,
// a bare 429 without Retry-After) and sends no CORS headers, so the screens
// reach it through here. Requests go out one at a time, ADSB_MIN_GAP apart.
// Every tab and device shares one upstream request per path per ADSB_CACHE.
// After a 429 nothing goes upstream for a short pause, and the last answer
// (up to ADSB_STALE old) is served instead, so the screen never blanks.
//
// The defaults below can all be changed in .env (see .env.example); times are
// in seconds there. Lowering ADSB_MIN_GAP below the default risks a 429.
export const DEFAULTS = {
  /** How long an area answer is fresh. */
  adsbCacheS: 10,
  // A faraway followed flight moves slowly on screen; asking half as often
  // keeps the budget for the area around the house.
  flightCacheS: 20,
  /** How long the last answer is kept for when upstream pauses or fails. */
  adsbStaleS: 5 * 60,
  adsbMinGapS: 2.5,
  /** Pause after a 429 or 420 that names no Retry-After. */
  adsbPauseS: 10,
  /** ICAO callsign for a typed flight number; it practically never changes. */
  callsignCacheS: 6 * 60 * 60,
  // Routes come from adsb.im's route API (the one tar1090 uses): it checks
  // each callsign's route against the plane's position, so the many reused
  // airline callsigns (Ryanair, easyJet) don't show last season's route the
  // way adsbdb's table does. A route doesn't change during a flight.
  routeCacheS: 30 * 60,
  /** Without a tap, mouse move or key for this long, the screen is idle. */
  idleS: 3,
  // The sweeps are the only motion; 15 frames per second is smooth enough on
  // an LED grid and leaves a weak frame computer mostly idle.
  ledFps: 15,
}

// The sky API is public: a flood of radius variants must not queue for
// minutes. Past this wait, answer from the last data instead of asking
// upstream.
export const MAX_QUEUE_MS = 10_000
// adsb.im answers at most this many callsigns per request.
export const ROUTE_BATCH = 100
