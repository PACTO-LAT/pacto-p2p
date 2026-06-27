# Backend Scaffold — Phase 1 (NestJS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a NestJS app at `apps/backend` (bounded-context layout) wired into the npm/Turborepo monorepo, with Supabase service-role connectivity, a `/health` endpoint, web→backend internal-API-key auth, and the full cross-cutting hardening skeleton — no business logic.

**Architecture:** Bounded-context DDD: `core/` (infra: supabase, health), `common/` (guard, filter, middleware), `config/` (Joi env validation), `domains/`+`shared/` (empty conventions for later phases). `app.module.ts` imports one `CoreModule` aggregator + global guards. Path aliases (`@core/*`, etc.) resolved at runtime via `tsc-alias`.

**Tech Stack:** NestJS 11 (Express), `@supabase/supabase-js` (service role), `@nestjs/terminus`, `@nestjs/config` + Joi, `@nestjs/throttler`, `nestjs-pino`, helmet, compression, Swagger. Biome for lint/format. Build = `nest build && tsc-alias`.

**Testing note:** Per the approved spec, phase 1 ships no automated tests (the repo has no test runner). Each task is verified with `npm run type-check`, `npm run build`, and runtime `curl`. Tests arrive in later phases.

**Spec:** `docs/superpowers/specs/2026-06-26-backend-scaffold-phase1-design.md`

**Branch:** `feat/135-scaffold-nestjs-backend` (already created from `develop`).

---

## File map

| File | Responsibility |
|---|---|
| `apps/backend/package.json` | Workspace manifest, scripts mirroring other workspaces |
| `apps/backend/tsconfig.json` / `tsconfig.build.json` | Standalone Nest TS config (commonjs, decorators, aliases) |
| `apps/backend/nest-cli.json` | Nest CLI config |
| `apps/backend/.gitignore` / `.env.example` / `README.md` | Ignore build/secrets; document env + auth |
| `apps/backend/src/main.ts` | Bootstrap + HTTP hardening |
| `apps/backend/src/app.module.ts` | Root composition: config, logger, throttler, CoreModule, global guards |
| `apps/backend/src/config/env.validation.ts` | Joi env schema (fail-fast) |
| `apps/backend/src/common/middleware/request-id.middleware.ts` | Functional request-id middleware |
| `apps/backend/src/common/filters/all-exceptions.filter.ts` | Uniform error body |
| `apps/backend/src/common/decorators/skip-auth.decorator.ts` | `@SkipAuth()` |
| `apps/backend/src/common/guards/internal-api-key.guard.ts` | `x-internal-key` constant-time guard |
| `apps/backend/src/core/core.module.ts` | Infra aggregator |
| `apps/backend/src/core/supabase/{supabase.module,supabase.service}.ts` | Service-role client |
| `apps/backend/src/core/health/{health.module,health.controller,supabase.health}.ts` | `/health` + Terminus indicator |
| `apps/backend/src/domains/README.md`, `src/shared/README.md` | Convention placeholders |
| `package.json` (root) | Add `dev:backend` script |
| `turbo.json` (root) | Add backend env keys to `build.env` |

---

## Task 1: Workspace skeleton + minimal boot

**Files:**
- Create: `apps/backend/package.json`, `apps/backend/tsconfig.json`, `apps/backend/tsconfig.build.json`, `apps/backend/nest-cli.json`, `apps/backend/.gitignore`, `apps/backend/src/app.module.ts`, `apps/backend/src/main.ts`

- [ ] **Step 1: Create `apps/backend/package.json`**

```json
{
  "name": "@pacto-p2p/backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build && tsc-alias -p tsconfig.build.json",
    "start": "node dist/main",
    "dev": "npm run build && concurrently -k \"tsc -p tsconfig.build.json -w --preserveWatchOutput\" \"tsc-alias -p tsconfig.build.json -w\" \"node --watch dist/main\"",
    "type-check": "tsc --noEmit",
    "lint": "biome lint .",
    "biome:check": "biome check .",
    "biome:format": "biome format . --write",
    "biome:lint": "biome lint .",
    "biome:fix": "biome check --write .",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/swagger": "^11.0.0",
    "@nestjs/terminus": "^11.0.0",
    "@nestjs/throttler": "^6.0.0",
    "@pacto-p2p/types": "*",
    "@supabase/supabase-js": "^2.50.5",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "compression": "^1.7.4",
    "helmet": "^8.0.0",
    "joi": "^17.13.0",
    "nestjs-pino": "^4.1.0",
    "pino-http": "^10.0.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.1.1",
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@types/compression": "^1.7.5",
    "@types/express": "^5.0.0",
    "@types/node": "^20",
    "concurrently": "^9.0.0",
    "pino-pretty": "^13.0.0",
    "tsc-alias": "^1.8.10",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create `apps/backend/tsconfig.json`**

```jsonc
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "moduleResolution": "node",
    "declaration": false,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "paths": {
      "@core/*": ["src/core/*"],
      "@domains/*": ["src/domains/*"],
      "@common/*": ["src/common/*"],
      "@shared/*": ["src/shared/*"],
      "@config/*": ["src/config/*"],
      "@pacto-p2p/types": ["../../packages/types/src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `apps/backend/tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "test", "**/*.spec.ts"]
}
```

- [ ] **Step 4: Create `apps/backend/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 5: Create `apps/backend/.gitignore`**

```gitignore
dist
node_modules
.env
.env.local
*.log
```

- [ ] **Step 6: Create minimal `apps/backend/src/app.module.ts`**

```ts
import { Module } from '@nestjs/common';

@Module({})
export class AppModule {}
```

- [ ] **Step 7: Create minimal `apps/backend/src/main.ts`**

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
```

- [ ] **Step 8: Install dependencies from the repo root**

Run: `npm install`
Expected: installs Nest deps, links `@pacto-p2p/backend` and `@pacto-p2p/types` into the workspace. If npm reports peer-dependency conflicts, align the conflicting package's major to the installed `@nestjs/core` major and re-run.

- [ ] **Step 9: Verify type-check and build**

Run: `npm run type-check && npm run build`
Expected: PASS; `apps/backend/dist/main.js` exists.

- [ ] **Step 10: Verify it boots**

Run: `node apps/backend/dist/main.js & sleep 2 ; curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/ ; kill %1`
Expected: process logs "Nest application successfully started"; curl returns `404` (no routes yet — proves the server is up).

- [ ] **Step 11: Commit**

```bash
git add apps/backend package.json package-lock.json
git commit -m "feat(backend): scaffold @pacto-p2p/backend workspace + minimal boot (#135)"
```

---

## Task 2: Config module + Joi env validation

**Files:**
- Create: `apps/backend/src/config/env.validation.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create `apps/backend/src/config/env.validation.ts`**

```ts
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
  INTERNAL_API_KEY: Joi.string().min(16).required(),
  CORS_ORIGINS: Joi.string().allow('').default(''),
  TRUST_PROXY_HOPS: Joi.number().default(1),
});
```

- [ ] **Step 2: Wire `ConfigModule` into `apps/backend/src/app.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from '@config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
  ],
})
export class AppModule {}
```

- [ ] **Step 3: Verify fail-fast on missing env**

Run: `cd apps/backend && rm -f .env && node dist/main.js ; cd ../..`
First run `npm run build` if needed. Expected: the build needs to run after editing; then booting **without** env vars exits with a Joi validation error naming `SUPABASE_URL` / `INTERNAL_API_KEY`. (This proves fail-fast.)

- [ ] **Step 4: Create `apps/backend/.env` for local boot (NOT committed)**

```bash
cat > apps/backend/.env <<'EOF'
NODE_ENV=development
PORT=3001
SUPABASE_URL=https://kzlsbhpyszkalyflbqjg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-real-service-role-key
INTERNAL_API_KEY=local-dev-internal-key-change-me
CORS_ORIGINS=
TRUST_PROXY_HOPS=1
EOF
```
(Use the real service-role key from the team's Supabase project for the connectivity check in Task 4. `apps/backend/.env` is gitignored.)

- [ ] **Step 5: Verify boot passes with env**

Run: `npm run build && (node apps/backend/dist/main.js & sleep 2 ; curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/ ; kill %1)`
Expected: starts cleanly; curl returns `404`.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src
git commit -m "feat(backend): add @nestjs/config + Joi env validation (#135)"
```

---

## Task 3: Supabase core module (service role)

**Files:**
- Create: `apps/backend/src/core/supabase/supabase.service.ts`, `apps/backend/src/core/supabase/supabase.module.ts`, `apps/backend/src/core/core.module.ts`
- Modify: `apps/backend/src/app.module.ts`

- [ ] **Step 1: Create `apps/backend/src/core/supabase/supabase.service.ts`**

```ts
import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private _client!: SupabaseClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const url = this.config.getOrThrow<string>('SUPABASE_URL');
    const key = this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
    this._client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  get client(): SupabaseClient {
    return this._client;
  }
}
```

- [ ] **Step 2: Create `apps/backend/src/core/supabase/supabase.module.ts`**

```ts
import { Global, Module } from '@nestjs/common';
import { SupabaseService } from '@core/supabase/supabase.service';

@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
```

- [ ] **Step 3: Create `apps/backend/src/core/core.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { SupabaseModule } from '@core/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
})
export class CoreModule {}
```

- [ ] **Step 4: Import `CoreModule` in `apps/backend/src/app.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '@core/core.module';
import { envValidationSchema } from '@config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    CoreModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 5: Verify type-check + build (proves aliases resolve at runtime via tsc-alias)**

Run: `npm run type-check && npm run build && node -e "require('./apps/backend/dist/core/core.module.js'); console.log('alias-ok')"`
Expected: prints `alias-ok` (compiled `@core/*` import was rewritten to a relative path by tsc-alias and loads under plain Node).

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src
git commit -m "feat(backend): add Supabase service-role core module (#135)"
```

---

## Task 4: Health module (Terminus + Supabase indicator)

**Files:**
- Create: `apps/backend/src/core/health/supabase.health.ts`, `apps/backend/src/core/health/health.controller.ts`, `apps/backend/src/core/health/health.module.ts`
- Modify: `apps/backend/src/core/core.module.ts`

- [ ] **Step 1: Create `apps/backend/src/core/health/supabase.health.ts`**

```ts
import { Injectable } from '@nestjs/common';
import type { HealthIndicatorResult } from '@nestjs/terminus';
import { SupabaseService } from '@core/supabase/supabase.service';

@Injectable()
export class SupabaseHealthIndicator {
  constructor(private readonly supabase: SupabaseService) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const { error } = await this.supabase.client
        .from('merchants')
        .select('id', { head: true, count: 'estimated' })
        .limit(1);
      if (error) {
        return { [key]: { status: 'down', message: error.message } };
      }
      return { [key]: { status: 'up' } };
    } catch (e) {
      return { [key]: { status: 'down', message: (e as Error).message } };
    }
  }
}
```

- [ ] **Step 2: Create `apps/backend/src/core/health/health.controller.ts`**

```ts
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { SkipAuth } from '@common/decorators/skip-auth.decorator';
import { SupabaseHealthIndicator } from '@core/health/supabase.health';

@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly supabaseIndicator: SupabaseHealthIndicator
  ) {}

  @Get()
  @SkipAuth()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.supabaseIndicator.isHealthy('supabase'),
    ]);
  }
}
```

Note: `@SkipAuth()` and `SupabaseHealthIndicator` are wired here; `@SkipAuth` is created in Task 6 — if implementing strictly in order, temporarily omit the `@SkipAuth()` line and the import, then add them in Task 6 Step 4. (The guard does not exist until Task 6, so `/health` is reachable regardless until then.)

- [ ] **Step 3: Create `apps/backend/src/core/health/health.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@core/health/health.controller';
import { SupabaseHealthIndicator } from '@core/health/supabase.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [SupabaseHealthIndicator],
})
export class HealthModule {}
```

- [ ] **Step 4: Add `HealthModule` to `apps/backend/src/core/core.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { HealthModule } from '@core/health/health.module';
import { SupabaseModule } from '@core/supabase/supabase.module';

@Module({
  imports: [SupabaseModule, HealthModule],
})
export class CoreModule {}
```

- [ ] **Step 5: Verify `/health` end-to-end (requires a real `SUPABASE_SERVICE_ROLE_KEY` in `apps/backend/.env`)**

Run: `npm run build && (node apps/backend/dist/main.js & sleep 2 ; curl -s localhost:3001/health ; echo ; kill %1)`
Expected: `{"status":"ok","info":{"supabase":{"status":"up"}},"error":{},"details":{"supabase":{"status":"up"}}}` and HTTP 200. If Supabase is unreachable/key invalid → `status:"error"`, HTTP 503 (also a valid proof the indicator works).

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src
git commit -m "feat(backend): add /health with Terminus Supabase indicator (#135)"
```

---

## Task 5: Cross-cutting — request-id middleware + uniform error filter

**Files:**
- Create: `apps/backend/src/common/middleware/request-id.middleware.ts`, `apps/backend/src/common/filters/all-exceptions.filter.ts`
- Modify: `apps/backend/src/main.ts`

- [ ] **Step 1: Create `apps/backend/src/common/middleware/request-id.middleware.ts`**

```ts
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

declare module 'express' {
  interface Request {
    traceId?: string;
  }
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const incoming = req.header('x-request-id');
  const traceId = incoming && incoming.length > 0 ? incoming : randomUUID();
  req.traceId = traceId;
  res.setHeader('X-Request-Id', traceId);
  next();
}
```

- [ ] **Step 2: Create `apps/backend/src/common/filters/all-exceptions.filter.ts`**

```ts
import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly config: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const isProd = this.config.get<string>('NODE_ENV') === 'production';

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
        code = exception.name;
      } else if (body && typeof body === 'object') {
        const b = body as Record<string, unknown>;
        code = (b.code as string) ?? exception.name;
        message = (b.message as string) ?? message;
        details = b.details;
      }
    }

    res.status(status).json({
      code,
      message: isProd && status >= 500 ? 'Internal server error' : message,
      traceId: req.traceId,
      details: isProd ? undefined : details,
    });
  }
}
```

- [ ] **Step 3: Wire middleware + filter into `apps/backend/src/main.ts`**

```ts
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { requestIdMiddleware } from '@common/middleware/request-id.middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.use(requestIdMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter(config));

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
}

void bootstrap();
```

- [ ] **Step 4: Verify error shape + trace header**

Run: `npm run build && (node apps/backend/dist/main.js & sleep 2 ; curl -s -D - localhost:3001/does-not-exist -o /tmp/body.json ; echo "--- body:" ; cat /tmp/body.json ; echo ; kill %1)`
Expected: response headers include `X-Request-Id: <uuid>`; body is `{"code":"NotFoundException","message":"...","traceId":"<uuid>"}` (uniform shape from the filter).

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src
git commit -m "feat(backend): add request-id middleware + uniform exception filter (#135)"
```

---

## Task 6: Web→backend auth — internal API key guard

**Files:**
- Create: `apps/backend/src/common/decorators/skip-auth.decorator.ts`, `apps/backend/src/common/guards/internal-api-key.guard.ts`
- Modify: `apps/backend/src/app.module.ts`, `apps/backend/src/core/health/health.controller.ts` (ensure `@SkipAuth()` present)

- [ ] **Step 1: Create `apps/backend/src/common/decorators/skip-auth.decorator.ts`**

```ts
import { SetMetadata } from '@nestjs/common';

export const SKIP_AUTH_KEY = 'skipAuth';
export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);
```

- [ ] **Step 2: Create `apps/backend/src/common/guards/internal-api-key.guard.ts`**

```ts
import { timingSafeEqual } from 'node:crypto';
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { SKIP_AUTH_KEY } from '@common/decorators/skip-auth.decorator';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const presented = req.header('x-internal-key');
    const expected = this.config.get<string>('INTERNAL_API_KEY');
    if (!expected || !presented || !safeEqual(presented, expected)) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED' });
    }
    return true;
  }
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ab, bb);
}
```

- [ ] **Step 3: Register the guard globally in `apps/backend/src/app.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { InternalApiKeyGuard } from '@common/guards/internal-api-key.guard';
import { CoreModule } from '@core/core.module';
import { envValidationSchema } from '@config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    CoreModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: InternalApiKeyGuard }],
})
export class AppModule {}
```

- [ ] **Step 4: Ensure `@SkipAuth()` is on the health route**

Confirm `apps/backend/src/core/health/health.controller.ts` has `@SkipAuth()` on `check()` and imports it (added in Task 4 Step 2). If it was omitted, add:
```ts
import { SkipAuth } from '@common/decorators/skip-auth.decorator';
```
and the `@SkipAuth()` decorator above `check()`.

- [ ] **Step 5: Add a throwaway protected probe route to prove the guard, then remove it**

Temporarily add to `apps/backend/src/app.module.ts` a controller is overkill; instead verify with the versioned 404 path which still passes through the guard. Run:

`npm run build && (node apps/backend/dist/main.js & sleep 2 ; echo -n "no key -> " ; curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/v1/anything ; echo -n "health (skipauth) -> " ; curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/health ; kill %1)`

Expected: `no key -> 401` (guard rejects unauthenticated requests, even to unknown routes, because the guard runs before routing resolves to 404), and `health (skipauth) -> 200`. 

> If `no key -> 404` instead of 401 (guard runs after route match in your Nest version), add a tiny `@SkipAuth`-free GET controller to confirm, then remove it. Document the observed behavior in the PR.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src
git commit -m "feat(backend): add internal API key guard + @SkipAuth (#135)"
```

---

## Task 7: Bootstrap hardening — helmet, compression, cors, versioning, pino, throttler, swagger, shutdown

**Files:**
- Modify: `apps/backend/src/main.ts`, `apps/backend/src/app.module.ts`

- [ ] **Step 1: Replace `apps/backend/src/main.ts` with the hardened bootstrap**

```ts
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { requestIdMiddleware } from '@common/middleware/request-id.middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  app.set('trust proxy', config.get<number>('TRUST_PROXY_HOPS', 1));

  app.use(requestIdMiddleware);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(compression());

  const origins = config.get<string>('CORS_ORIGINS', '');
  app.enableCors({
    origin: origins ? origins.split(',').map((o) => o.trim()) : true,
    methods: ['GET', 'POST'],
    credentials: false,
    maxAge: 600,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter(config));
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pacto Backend')
    .setDescription('Internal backend API for Pacto P2P')
    .setVersion('0.1.0')
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig)
  );

  app.enableShutdownHooks();
  await app.listen(config.get<number>('PORT', 3001));
}

process.on('unhandledRejection', (reason) => {
  console.error(
    JSON.stringify({
      level: 'error',
      type: 'unhandledRejection',
      reason: String(reason),
    })
  );
});
process.on('uncaughtException', (err) => {
  console.error(
    JSON.stringify({
      level: 'fatal',
      type: 'uncaughtException',
      message: err.message,
    })
  );
  process.exit(1);
});

void bootstrap();
```

- [ ] **Step 2: Add LoggerModule (pino) + ThrottlerModule + ThrottlerGuard to `apps/backend/src/app.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { InternalApiKeyGuard } from '@common/guards/internal-api-key.guard';
import { CoreModule } from '@core/core.module';
import { envValidationSchema } from '@config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req) => ({ traceId: (req as Request & { traceId?: string }).traceId }),
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20 },
      { name: 'default', ttl: 60000, limit: 60 },
    ]),
    CoreModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: InternalApiKeyGuard },
  ],
})
export class AppModule {}
```

Note: `customProps`'s `req` is the Node `IncomingMessage`; the inline cast reads the `traceId` set by `requestIdMiddleware`. If Biome flags the cast, import `type { Request } from 'express'` at the top and reuse it.

- [ ] **Step 3: Verify hardening behaviors**

Run: `npm run build && (node apps/backend/dist/main.js & sleep 2 ; echo -n "health -> " ; curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/health ; echo -n "docs -> " ; curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/docs ; echo -n "helmet header -> " ; curl -s -D - -o /dev/null localhost:3001/health | grep -i "x-dns-prefetch-control" ; kill %1)`
Expected: `health -> 200`, `docs -> 200` (Swagger UI), and a helmet header line present. Logs are now structured (pino-pretty in dev).

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src
git commit -m "feat(backend): harden bootstrap (helmet, cors, versioning, pino, throttler, swagger) (#135)"
```

---

## Task 8: Convention placeholders, docs, root wiring, final verification

**Files:**
- Create: `apps/backend/src/domains/README.md`, `apps/backend/src/shared/README.md`, `apps/backend/.env.example`, `apps/backend/README.md`
- Modify: `package.json` (root), `turbo.json` (root)

- [ ] **Step 1: Create `apps/backend/src/domains/README.md`**

```markdown
# domains/ — bounded contexts

Each subfolder is a business context (DDD bounded context) that groups related
feature-modules and exposes them through a single aggregator module
(`<context>/<context>.module.ts`). `app.module.ts` imports only the aggregator.

Empty in phase 1 (#135). Populated by:
- platform (merchant/user stats + reputation) → phase 2 (#136)
- escrow indexing → phase 4 (#138)
- notifications → phase 5 (#139)

Add a feature: create it under the right context and register it in that
context's aggregator — `app.module.ts` does not change.
```

- [ ] **Step 2: Create `apps/backend/src/shared/README.md`**

```markdown
# shared/ — cross-context domain helpers

Reusable domain helpers shared between bounded contexts (e.g. decoders,
formatters). Infrastructure lives in `core/`, not here. Empty in phase 1 (#135).
```

- [ ] **Step 3: Create `apps/backend/.env.example`**

```dotenv
# Pacto Backend — environment (copy to apps/backend/.env; .env is gitignored)

NODE_ENV=development
PORT=3001

# Supabase — server-side service role. NEVER expose to the browser / commit.
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<service_role key>

# web→backend internal auth: shared secret (min 16 chars). NEVER commit a real value.
INTERNAL_API_KEY=<generate a long random string>

# Comma-separated allowed CORS origins (empty = allow all, dev only)
CORS_ORIGINS=

# Reverse-proxy hops for Express 'trust proxy'
TRUST_PROXY_HOPS=1
```

- [ ] **Step 4: Create `apps/backend/README.md`**

````markdown
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
````

- [ ] **Step 5: Add `dev:backend` script to root `package.json`**

In the root `package.json` `scripts` block, add after the `"dev"` line:
```json
    "dev:backend": "turbo run dev --filter=@pacto-p2p/backend",
```

- [ ] **Step 6: Add backend env keys to root `turbo.json` `build.env`**

Extend the `build.env` array (currently `POSTGRES_*`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`) with:
```json
        "SUPABASE_URL",
        "INTERNAL_API_KEY",
        "CORS_ORIGINS",
        "TRUST_PROXY_HOPS",
        "PORT",
        "NODE_ENV"
```

- [ ] **Step 7: Biome auto-fix the backend, then full root verification**

Run:
```bash
cd apps/backend && npm run biome:fix ; cd ../..
npm run type-check
npm run build
cd apps/backend && npm run biome:check ; cd ../..
```
Expected: `type-check` PASS (includes `@pacto-p2p/backend`); `build` PASS (backend → `dist`); backend `biome:check` clean (0 errors). The root `npm run biome:check` remains red only due to pre-existing debt in `packages/*` — confirm the backend adds no new findings.

- [ ] **Step 8: Final runtime smoke**

Run: `npm run build && (node apps/backend/dist/main.js & sleep 2 ; echo -n "health -> " ; curl -s localhost:3001/health ; echo ; echo -n "protected no key -> " ; curl -s -o /dev/null -w "%{http_code}\n" localhost:3001/v1/x ; kill %1)`
Expected: health `200` with `supabase: up`; protected `401`.

- [ ] **Step 9: Commit**

```bash
git add apps/backend package.json turbo.json
git commit -m "feat(backend): conventions, env docs, root dev:backend + turbo env (#135)"
```

- [ ] **Step 10: Push and open PR**

```bash
git push -u origin feat/135-scaffold-nestjs-backend
gh pr create --repo PACTO-LAT/pacto-p2p --base develop \
  --head feat/135-scaffold-nestjs-backend \
  --title "feat(backend): scaffold NestJS app in apps/backend (phase 1 — #135)" \
  --body "<summary of acceptance criteria, verification output, deferred phases>"
```

---

## Self-review checklist (completed during planning)

- **Spec coverage:** scaffold+turbo/workspaces (T1, T8), supabase service-role (T3), reuse `@pacto-p2p/types` via alias (T1 tsconfig), config/env (T2), `/health` + connectivity (T4), web→backend auth (T6), root scripts green (T7/T8), no secrets committed (`.gitignore` T1, `.env.example` T8). All covered.
- **Known external-API risk:** `@nestjs/terminus` custom-indicator shape — the plan uses the version-stable literal `HealthIndicatorResult` return (no deprecated base class), avoiding API drift. If Terminus types reject the literal, wrap via the injected `HealthIndicatorService.check(key).up()/.down()` (Terminus 11 API).
- **Version pins:** caret ranges; if `npm install` reports peer conflicts, align the offending package's major to the installed `@nestjs/core` major (11). `@nestjs/throttler` ^6 and `@nestjs/swagger` ^11 are the Nest-11-compatible majors.
- **Express 5 wildcard:** request-id is a plain `app.use()` functional middleware (not `MiddlewareConsumer.forRoutes('*')`), avoiding the path-to-regexp v8 wildcard pitfall.
- **Runtime aliases:** `tsc-alias` rewrites `@core/*` etc. to relative paths in `dist` (verified in T3 Step 5); dev runs build + `tsc-alias -w` + `node --watch` via `concurrently`.
