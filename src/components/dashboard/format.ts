export const flag = (iso?: string) =>
  iso && iso.length === 2
    ? String.fromCodePoint(
        ...[...iso.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)),
      )
    : ''
