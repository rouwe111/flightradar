// Runs once when the server starts: a bad .env fails here with a readable
// message instead of on the first request.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getConfig } = await import('@/server/config')
    getConfig()
  }
}
