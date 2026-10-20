/** Airline logo sources, tried in order. */
export const logoUrls = (iata: string | undefined) =>
  iata
    ? [
        `https://pics.avs.io/128/128/${iata}.png`,
        `https://images.kiwi.com/airlines/64/${iata}.png`,
      ]
    : []
