# AGENTS.md

Standalone Next.js (App Router, React 19, TypeScript) flight radar. No database,
no tests, no linter. See `README.md` for what it does and how the code is laid
out; this file is about how to work in it.

## Commands

- `pnpm install`, `pnpm dev` (http://localhost:3000), `pnpm build`, `pnpm start`
- `pnpm typecheck`: the only automated check. Run it after every change.
- Needs Node ^22.18 and pnpm. Use pnpm, not npm or yarn.

## Rules

- Configuration comes only from environment variables, read in
  `src/server/config.ts`. A new variable needs: parsing with a range check
  there, its default in `src/server/constants.ts` (if it has one), a commented
  entry in `.env.example`, and a mention in `README.md` if user-facing.
  Never read `process.env` elsewhere.
- Never send the exact home coordinates to the browser; the client only gets
  the house rounded to about 1 km (`ClientConfig` in `src/lib/types.ts`).
- Upstream (adsb.lol, adsb.im, adsbdb) is only called from `src/server/`,
  through the throttle and cache. Don't call it from the browser, don't add
  requests that bypass `upstream.ts`, and don't lower `ADSB_MIN_GAP_SECONDS`
  defaults: adsb.lol blocks above about one request per 2 seconds per IP.
- Caching is in-memory only (`lru-cache`). Don't write to disk.
- Keep server code (`src/server/`) and browser code (`src/components/`,
  `src/hooks/`) apart; `src/lib/` is shared and must stay free of Node-only
  and DOM-only APIs.

## Conventions

- Imports use the `@/` alias for `src/`.
- Constants live in `constants.ts` and types in `types.ts`, one pair per folder.
- One component per file, kebab-case file names; hooks are `use-*.ts`.
- The LED drawing code in `src/components/led/draw/` is plain canvas code with
  no React; keep it that way.
- Comments explain why (rate limits, upstream quirks), not what. Match the
  density of the surrounding code.
- Look and feel follows the Kaartje2go house style: font "Source Sans 3",
  text #403c3e, accent #E11486 only, soft panels from #FAF1F7, #F9EFE3,
  #E0F5FF, #F7F0FF.
- Don't commit `.env`; keep `.env.example` in sync with the config code.
