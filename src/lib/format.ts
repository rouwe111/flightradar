export const num = (n: number | null | undefined, digits = 0) =>
  n == null || Number.isNaN(n)
    ? '-'
    : Number(n).toLocaleString('en-GB', {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      })
