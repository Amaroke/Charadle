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
