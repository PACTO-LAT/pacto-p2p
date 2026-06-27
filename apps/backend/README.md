# @pacto-p2p/backend

NestJS backend (bounded-context layout). Phase 1 = scaffold: config, Supabase
service-role connectivity, `/health`, and web→backend auth.

## Run

```bash
cp apps/backend/.env.example apps/backend/.env   # fill in real values
npm run dev:backend                              # from repo root
curl localhost:3001/health
```

## Layout

- `core/` — infrastructure providers (Supabase, health)
- `common/` — cross-cutting (guard, filter, middleware)
- `config/` — Joi env validation (fail-fast at boot)
- `domains/` — business bounded contexts (empty until phase 2)
- `shared/` — cross-context domain helpers

## web → backend auth

The web app authenticates server-to-server with a shared secret. Send it as the
`x-internal-key` header on every request:

```
x-internal-key: <INTERNAL_API_KEY>
```

`InternalApiKeyGuard` (global) validates it with a constant-time comparison
(`crypto.timingSafeEqual`). Routes opt out with the `@SkipAuth()` decorator
(only `/health` does). `SUPABASE_SERVICE_ROLE_KEY` and `INTERNAL_API_KEY` are
server-side only and never returned by any endpoint.

## Versioning

URI versioning, default `v1` (e.g. `/v1/...`). `/health` is version-neutral.
Swagger UI at `/docs`.
