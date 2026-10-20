export async function fetchJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url)
  return response.ok ? ((await response.json()) as T) : null
}
