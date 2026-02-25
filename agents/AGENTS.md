# Repository Guidelines

## Project Structure & Module Organization

- `apps/web`: Next.js app (App Router) with pages in `apps/web/app` and UI in `apps/web/components`.
- `packages/shared`, `packages/ui`, `packages/types`, `packages/config`: shared business logic, UI components, types, and config utilities.
- `scripts/`: repo utilities (if any).
- Root config: `turbo.json`, `tsconfig.json`, `biome.json`, `eslint.config.mjs`.

Use workspace imports for internal packages, e.g. `@pacto-p2p/ui` or `@pacto-p2p/shared`.

## Build, Test, and Development Commands

Run from the repo root:

- `npm run dev`: start the web app via Turbo (filtered to `@pacto-p2p/web`).
- `npm run build`: build all apps and packages.
- `npm run start`: start the production build for the web app.
- `npm run lint`: run package lint tasks.
- `npm run biome:check|format|fix`: format/lint with Biome.
- `npm run type-check`: TypeScript strict type checking.
- `npm run clean`: clear build artifacts and Turbo cache.

Mock mode for local UI work: set `NEXT_PUBLIC_USE_MOCK=1` in `apps/web` to use `/api/mock/*`.

## Coding Style & Naming Conventions

- TypeScript strict mode is enabled (`tsconfig.json`). Avoid `any`.
- Biome is the primary formatter/linter: 2-space indent, single quotes, semicolons, trailing commas (ES5).
- Prefer functional React components and `handle*` naming for event handlers.

## Testing Guidelines

No dedicated test runner is configured in this repo yet. If you add tests, colocate with the feature (e.g., `*.test.ts` or `*.spec.tsx`) and wire the test script in the relevant package before relying on it in CI.

## Commit & Pull Request Guidelines

- Commit messages follow a conventional prefix pattern seen in history: `fix:`, `refactor:`, `chore:` (use `feat:` for new functionality).
- PRs should include a short summary, testing notes (commands run), and screenshots for UI changes.
- Link related issues when applicable.

## Architecture Notes

- Monorepo uses Turborepo + npm workspaces; keep cross-package changes scoped and update dependencies with `workspace:*`.
