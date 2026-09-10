# Landmaka — pnpm + Turbo monorepo

TypeScript monorepo with Next.js web app and NestJS API.

## Stack (verified latest, Sep 2026)

- pnpm `10.29.1` (workspaces)
- Turbo `2.10.12` (`tasks` schema)
- Next.js `16.3.4` / React `19.2.8` — `apps/web` (App Router, Tailwind v4, ESLint, `src/`, `@/*`)
- NestJS `12.0.1` / CLI `12.0.0` — `apps/api` (ESM, Vitest, oxlint, strict TS)
- Node `>=20.9.0` (dev on `24`)

## Structure

```
apps/web   — @landmaka/web  (Next, :3000)
apps/api   — @landmaka/api  (Nest, :3001, CORS → http://localhost:3000)
packages/typescript-config — shared base/nextjs/nestjs tsconfigs
turbo.json — build/lint/check-types/test/dev pipelines
pnpm-workspace.yaml — apps/* + packages/*
```

## Commands

```sh
pnpm install
pnpm dev          # turbo dev — both apps
pnpm build        # turbo build — both apps
pnpm lint
pnpm check-types
pnpm test         # api vitest (web has no tests by default)

# scoped
pnpm --filter @landmaka/web dev
pnpm --filter @landmaka/api dev
pnpm exec turbo run build --filter=@landmaka/api
```

## Ports / env

- Web: `http://localhost:3000`
- API: `http://localhost:3001` (override with `PORT`, web URL with `WEB_URL`)
