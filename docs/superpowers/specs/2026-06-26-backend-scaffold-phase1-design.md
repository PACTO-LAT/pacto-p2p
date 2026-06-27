# Backend Scaffold — Phase 1 (Issue #135)

**Status:** Design approved (pending spec review)
**Date:** 2026-06-26
**Issue:** [#135 — feat(backend): scaffold NestJS app in apps/backend (phase 1 — setup)](https://github.com/PACTO-LAT/pacto-p2p/issues/135)

## Context

We are adding a dedicated **NestJS backend** as a new app in this monorepo (`apps/backend`)
to own stats/reputation, scheduled jobs, escrow indexing, and notification logic currently
spread across the Next.js serverless layer. This issue is the **foundation only** — no
aggregation, cron, on-chain, or email logic (those are phases 2–5: #136–#139).

The structure follows a **bounded-context (DDD)** layout (reference: the "Neko" backend):
infrastructure in `core/`, business contexts in `domains/`, cross-cutting concerns in
`common/`, env validation in `config/`, domain helpers in `shared/`, wired with path aliases.
`app.module.ts` imports a small number of aggregator modules instead of dozens of flat ones.

### Why the full hardening skeleton now (not incrementally)

The next phase, #136, already exposes a **REST read API consumed by `apps/web`**. That needs
DTO validation, the web→backend auth guard, a uniform error filter, request tracing, and
structured logging from its very first endpoint. Building the cross-cutting skeleton now means
phases 2–5 only drop modules into `domains/` without re-touching `main.ts`/`app.module.ts`.

**Deferred to later phases** (genuinely not needed yet):

| Infra | Phase | Issue |
|---|---|---|
| `ScheduleModule` (cron jobs) | 3 | #137 |
| `core/stellar` + escrow indexing | 4 | #138 |
| `core/email` (Resend) + notification service | 5 | #139 |
| `domains/*` feature modules | 2–5 | per phase |
| Extracting heavy domain to `packages/@pacto/*` (ports & adapters) | when a piece grows | — |

## Decisions

- **DB access:** `@supabase/supabase-js` with the **service-role** key (mirrors
  `apps/web/lib/supabase.ts`; bypasses RLS server-side). No new ORM.
- **web→backend auth:** internal API key. Header `x-internal-key` compared with
  `crypto.timingSafeEqual` (constant-time). Global guard via `APP_GUARD`; opt-out with a
  `@SkipAuth()` decorator (used by `/health`).
- **Health:** `@nestjs/terminus` with a custom `SupabaseHealthIndicator` that pings Supabase.
- **Config/env validation:** `@nestjs/config` (global) with a **Joi** schema (fail-fast at boot).
- **Linter/formatter:** **Biome** (monorepo standard) — not ESLint/Prettier.
- **No automated tests in phase 1:** the repo has no test runner or turbo test task today;
  adding Jest infra is out of scope for a scaffold. `/health` and auth are verified manually
  (curl). Later phases may introduce testing.

## Target structure

```
apps/backend/
├── nest-cli.json
├── package.json                 # @pacto-p2p/backend
├── tsconfig.json                # standalone: commonjs, decorators, emit → dist, path aliases
├── tsconfig.build.json
├── .env.example                 # documents required env (no secrets)
├── .gitignore                   # dist, node_modules, .env*
├── README.md                    # documents the web→backend auth mechanism
└── src/
    ├── main.ts                  # bootstrap + HTTP hardening (see below)
    ├── app.module.ts            # ConfigModule + LoggerModule(pino) + ThrottlerModule + CoreModule
    │                            #   + APP_GUARD: ThrottlerGuard, InternalApiKeyGuard
    │                            #   + RequestIdMiddleware on '*'
    ├── common/
    │   ├── decorators/skip-auth.decorator.ts
    │   ├── filters/all-exceptions.filter.ts
    │   ├── guards/internal-api-key.guard.ts
    │   └── middleware/request-id.middleware.ts
    ├── config/
    │   └── env.validation.ts    # Joi schema for ALL env vars
    ├── core/
    │   ├── core.module.ts       # imports SupabaseModule, HealthModule
    │   ├── supabase/
    │   │   ├── supabase.module.ts
    │   │   └── supabase.service.ts
    │   └── health/
    │       ├── health.module.ts
    │       ├── health.controller.ts   # GET /health (version-neutral, @SkipAuth)
    │       └── supabase.health.ts      # Terminus HealthIndicator
    ├── domains/                 # bounded contexts — empty in phase 1 (README documents convention)
    │   └── README.md
    └── shared/                  # cross-context domain helpers — empty in phase 1
        └── README.md
```

### Path aliases (`tsconfig.json`)

```jsonc
"paths": {
  "@core/*":      ["src/core/*"],
  "@domains/*":   ["src/domains/*"],
  "@common/*":    ["src/common/*"],
  "@shared/*":    ["src/shared/*"],
  "@config/*":    ["src/config/*"],
  "@pacto-p2p/types": ["../../packages/types/src"]
}
```

`@pacto-p2p/types` maps to source and is consumed only via `import type`, so type-check does
not depend on build order or `dist`, and nothing is imported at runtime.

## Components

### `main.ts` (bootstrap order matters)
`NestExpressApplication` with `bufferLogs: true` → `useLogger(pino)` → `set('trust proxy', n)`
→ `helmet` → `compression` → `enableCors(originsFromEnv, methods GET/POST)` →
`useGlobalPipes(ValidationPipe { whitelist, transform, forbidNonWhitelisted })` →
`useGlobalFilters(AllExceptionsFilter)` → `enableVersioning(URI, default '1')` →
Swagger at `/docs` → `enableShutdownHooks()` → `listen(PORT ?? 3001)`. Plus global
`unhandledRejection` / `uncaughtException` handlers that log structured JSON.

### `app.module.ts`
Imports `ConfigModule.forRoot({ isGlobal: true, validationSchema })`, `LoggerModule.forRoot`
(nestjs-pino), `ThrottlerModule.forRoot([{short:1s/20},{default:60s/60}])`, `CoreModule`.
Providers: `{provide: APP_GUARD, useClass: ThrottlerGuard}`,
`{provide: APP_GUARD, useClass: InternalApiKeyGuard}`. `configure()` applies
`RequestIdMiddleware` to `'*'`.

### `common/`
- **`internal-api-key.guard.ts`** — reads `x-internal-key`, compares to `INTERNAL_API_KEY`
  with `crypto.timingSafeEqual`; throws `UnauthorizedException({code:'UNAUTHORIZED'})`. Honors
  `@SkipAuth()` via `reflector.getAllAndOverride([handler, class])`.
- **`skip-auth.decorator.ts`** — `SetMetadata(SKIP_AUTH_KEY, true)`.
- **`all-exceptions.filter.ts`** — `@Catch()`; uniform body
  `{ code, message, traceId, details }`; hides `message`/`details` outside non-prod.
- **`request-id.middleware.ts`** — uses incoming `x-request-id` or `randomUUID()`, sets
  `req.traceId`, echoes `X-Request-Id`; picked up by pino `customProps` and the filter.

### `config/env.validation.ts` (Joi)
Required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `INTERNAL_API_KEY`. With defaults:
`PORT=3001`, `NODE_ENV=development`, `CORS_ORIGINS`, `TRUST_PROXY_HOPS=1`. Missing required →
boot fails.

### `core/supabase/`
`SupabaseService implements OnModuleInit` creates one service-role client
(`auth: { autoRefreshToken: false, persistSession: false }`) and exposes `get client()`.
`SupabaseModule` provides + exports it (global). Service-role key stays server-side only.

### `core/health/`
`GET /health` (`@SkipAuth()`, `VERSION_NEUTRAL` so it stays at `/health`, not `/v1/health`).
Uses Terminus `HealthCheckService` + `SupabaseHealthIndicator`, which runs a lightweight query
(`from('merchants').select('id', { head: true }).limit(1)`) → healthy / 503.

## Monorepo / tooling integration

- **`package.json` scripts** (mirror other workspaces so root turbo tasks include the backend):
  `build: nest build` (→ `dist/`, already in turbo `build.outputs`), `dev: nest start --watch`,
  `start: node dist/main`, `type-check: tsc --noEmit`, `biome:check/format/lint/fix`,
  `clean: rm -rf dist`, `lint: biome lint .`.
- **`tsconfig.json`** is standalone (does NOT extend root, which is `noEmit/esnext/bundler`):
  `module: commonjs`, `target: ES2021`, `moduleResolution: node`, `experimentalDecorators`,
  `emitDecoratorMetadata`, `strict`, `outDir: dist`, `rootDir: src`, plus the path aliases.
- **Root convenience:** add `dev:backend` script (`turbo run dev --filter=@pacto-p2p/backend`)
  since the root `dev` is filtered to web. Optionally extend `turbo.json` `build.env` with the
  new backend env keys (cache correctness).

## Environment & secrets

`apps/backend/.env` is gitignored; `apps/backend/.env.example` is committed with placeholders.
`SUPABASE_SERVICE_ROLE_KEY` and `INTERNAL_API_KEY` are server-side only and never exposed by
any endpoint. `apps/web` will call the backend with the shared `INTERNAL_API_KEY` (wiring of
the web side is incremental and lands with the first consumer in phase 2).

## Dependencies to add (`apps/backend`)

`@nestjs/{common,core,platform-express,config,swagger,throttler,terminus}`,
`@supabase/supabase-js`, `class-validator`, `class-transformer`, `joi`, `nestjs-pino`,
`pino-http`, `pino-pretty`, `helmet`, `compression`, `reflect-metadata`, `rxjs`.
Dev: `@nestjs/cli`, `typescript`, `@types/node`, `@types/compression`, `@biomejs/biome`.

## Verification (end-to-end)

1. `npm install` (links workspace + installs deps).
2. `npm run type-check` — passes, includes `@pacto-p2p/backend`.
3. `npm run build` — backend compiles to `apps/backend/dist`.
4. `npm run biome:check` — backend code is Biome-clean (root remains red only due to
   pre-existing debt in `packages/*`, tracked separately).
5. Run the backend (`npm run dev:backend` or `node apps/backend/dist/main`):
   - `curl localhost:3001/health` → `200` with `{ status:'ok', info:{ supabase:'up' } }`.
   - `curl localhost:3001/v1/<any-protected>` without `x-internal-key` → `401 {code:'UNAUTHORIZED'}`.
   - Boot fails fast if a required env var is missing (config validation).

## Out of scope (phase 1)

Aggregation/stats (#136), cron (#137), escrow indexing/on-chain (#138), notifications/email
(#139), Google Sign-In (#140), admin cleanup (#141). No secrets committed.
