# Flight radar (standalone)

The flight radar from rouwendal.dev as a separate Next.js app (App Router), with
no database. Everything is configured in `.env`.

It shows airline and military flights near a point (LED pixel display or a light
dashboard), or follows one flight number anywhere. Data comes from adsb.lol
(positions), adsb.im (routes) and adsbdb (aircraft details, airlines).

## Run

```sh
cp .env.example .env   # set HOME_LATITUDE and HOME_LONGITUDE
pnpm install
pnpm dev               # http://localhost:3000
```

Production: `pnpm build`, then `pnpm start` (`PORT=8080 pnpm start` for another
port). Needs Node ^22.18. Because the setup is read from the environment on
every request, one build works for any `.env`.

## Configuration

All variables are listed with comments in `.env.example`. Only
`HOME_LATITUDE` and `HOME_LONGITUDE` are required; a wrong value stops the
server at start with a message saying which one. Next.js loads `.env`, and real
environment variables override it, so this also works on a host without a file.
Changes need a restart.
The cache lifetimes and the request spacing towards adsb.lol are configurable
too (`ADSB_CACHE_SECONDS`, `ADSB_MIN_GAP_SECONDS` and friends); the defaults
are in `src/server/constants.ts`. `AIRCRAFT_FILTER=all` also shows private and light aircraft,
`IDLE_SECONDS` sets when the cursor hides and `LED_FPS` the LED frame rate.

The URL can override the look for one screen: `?view=dashboard`, `?radius=25`,
`?brightness=0.4`, `?bloom=0`. Press `F` or double-click for fullscreen, `R` to
reload.

## How it works

adsb.lol sends no CORS headers and rate-limits per IP, so the browser asks this
app's own route (`/api/sky`), which asks upstream one request at a time, caches
answers and serves stale data when upstream pauses. Data is cached in memory
with [`lru-cache`](https://github.com/isaacs/node-lru-cache) (per-entry TTLs,
at most 2,000 entries); nothing is written to disk, and a restart starts with
an empty cache. The browser only receives the house rounded to about 1 km.

Imports use the `@/` alias for `src/`. Constants and types sit in their own
`constants.ts` and `types.ts` per folder.

- `src/app/`: the page (reads the setup on the server) and `api/sky/route.ts`
- `src/components/screen.tsx`: client entry, picks the LED or dashboard view
- `src/components/led/`: the LED view. `led-display.tsx` composes
  `led-panel.tsx` (canvases) with `use-led-view.ts` (what to show) and
  `use-led-renderer.ts` (draw loop); `draw/` is plain canvas code (font,
  primitives, flight page, mini radar, empty page)
- `src/components/dashboard/`: the light view, one file per card (`hero-card`,
  `route-card`, `radar-card`, `tiles-grid`, `empty-card`, `dashboard-header`)
- `src/components/shared/`: refresh dot and reload button
- `src/hooks/`: polling (`use-sky`), adsbdb lookups, kiosk, viewport, clock
- `src/lib/`: types, constants, geo and format helpers, shared by both sides
- `src/server/`: `config.ts` (reads `.env`), `upstream.ts` (adsb.lol,
  throttled), `routes.ts` (adsb.im), `callsign.ts` (adsbdb), `sky.ts` (puts it
  together), `cache.ts` (`lru-cache`)
