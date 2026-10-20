/** An airport as the screens use it (field names follow adsbdb). */
export type Airport = {
  country_iso_name?: string
  iata_code?: string
  icao_code?: string
  latitude: number
  longitude: number
  municipality?: string
  name?: string
}

/** Where a flight comes from and goes to, checked against its position. */
export type PlaneRoute = { origin: Airport; destination: Airport }

/** One aircraft from adsb.lol, trimmed to what the screens show. */
export type Plane = {
  hex: string
  callsign: string
  lat: number
  lon: number
  altFt: number | null
  /** Ground speed in knots. */
  gs: number | null
  track: number | null
  /** Vertical rate in ft/min. */
  baroRate: number | null
  squawk: string | null
  registration: string | null
  typeCode: string | null
  mach: number | null
  windSpeed: number | null
  windDirection: number | null
  outsideTemp: number | null
  navAltitude: number | null
  category: string | null
  seen: number | null
  /** From adsb.im; null when unknown or implausible for this position. */
  route: PlaneRoute | null
  /** adsb.lol's database marks the airframe as military. */
  military: boolean
}

export type SkyPayload = {
  /** The followed flight (FLIGHT_NUMBER in .env). `plane` is null when it
   * isn't flying, or when adsb.lol couldn't be asked yet (`checked` false). */
  flight: {
    number: string
    callsign: string
    plane: Plane | null
    checked: boolean
  } | null
  planes: Plane[]
  /** When adsb.lol last answered for the area around the house. */
  updatedAt: number
}

/** What the browser learns about the setup, from the server. */
export type ClientConfig = {
  /** Rounded to about 1 km. */
  home: { latitude: number; longitude: number; timezone: string }
  radius: number
  view: 'led' | 'dashboard'
  brightness: number
  bloom: boolean
  pollMs: number
  /** Whether only airline and military flights are shown. */
  airlineOnly: boolean
  /** The cursor and reload button hide after this long without input. */
  idleMs: number
  ledFps: number
  /** Where the browser looks up aircraft details and airlines. */
  adsbdbUrl: string
}

/** A plane seen from the house: distance, bearing and height in the sky. */
export type SkyPlane = Plane & { dKm: number; brg: number; elev: number | null }

export type Airline = {
  name?: string
  iata?: string
  icao?: string
  country_iso?: string
}

/** Airline from adsbdb, origin and destination from the server (adsb.im). */
export type FlightRoute = {
  airline: Airline | null
  origin?: Airport
  destination?: Airport
}

export type Aircraft = {
  type?: string
  manufacturer?: string
  registration?: string
  registered_owner?: string
  registered_owner_country_name?: string
  registered_owner_country_iso_name?: string
  url_photo_thumbnail?: string | null
}
