# Charadle

Charadle is a web game where you guess an anime character from their picture.

The previous version lives under the `v1-legacy` tag.

## Development

Requires Node 24 and pnpm (via Corepack).

```bash
corepack pnpm install
corepack pnpm dev
```

| Command | Purpose |
| --- | --- |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm db:generate` | Drizzle migration from `src/db/schema.ts` |
| `pnpm db:migrate` | Apply the migrations to `DATABASE_URL` |

On Vercel, `vercel-build` applies the pending migrations to `DATABASE_URL` before `next build`, so a deployment never runs against an outdated schema. It skips them when `DATABASE_URL` is not set.

`DATABASE_URL` is the Neon connection string, or `memory:` for an in-process PGlite database. `CRON_SECRET` protects `/api/cron/daily`, which Vercel calls at 12:00 UTC to draw the Daily.
