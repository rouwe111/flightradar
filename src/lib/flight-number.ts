/** Normalises a flight number ("kl 1001") to "KL1001"; null when it is not one. */
export function parseFlightNumber(value: string) {
  const cleaned = value.replace(/\s+/g, '').toUpperCase()
  return /^[A-Z0-9]{3,8}$/.test(cleaned) ? cleaned : null
}
