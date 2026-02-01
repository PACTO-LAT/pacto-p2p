# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pacto is a decentralized OTC (Over-The-Counter) platform for Stellar stablecoins, enabling peer-to-peer trading of CRCX, MXNX, and USDC using regional payment rails like SINPE and SPEI. It uses Trustless Work smart contract escrows on Stellar.

## Commands

```bash
# Development
npm run dev              # Start web app (uses Turbopack)
npm run build            # Build all packages and apps
npm run start            # Start production server

# Code Quality
npm run biome:check      # Check code with Biome
npm run biome:format     # Format code with Biome
npm run biome:fix        # Fix code issues with Biome
npm run type-check       # Type check all packages
npm run lint             # Lint all packages

# Maintenance
npm run clean            # Clean all build artifacts
```

## Architecture

### Monorepo Structure (Turborepo + npm workspaces)

- **`apps/web`**: Next.js 16 web application (App Router with Turbopack)
- **`packages/shared`**: Business logic, services, constants, utilities
- **`packages/ui`**: Reusable UI components (Radix UI based, shadcn/ui patterns)
- **`packages/types`**: TypeScript type definitions (especially escrow types)
- **`packages/config`**: Configuration and scripts

### Key Patterns

**Workspace imports**: Always use `@pacto-p2p/<package-name>` for internal dependencies:
```typescript
import { Button } from '@pacto-p2p/ui'
import { EscrowType } from '@pacto-p2p/types'
```

**Mock mode**: Set `NEXT_PUBLIC_USE_MOCK=1` to use local mock API (`/api/mock/*`) instead of real backends. Swap adapters in `apps/web/lib/adapters/`.

**State management**: Zustand stores in `apps/web/store/` (e.g., `wallet.store.ts`)

**Data fetching**: TanStack Query with hooks in `apps/web/hooks/` (e.g., `use-escrows.ts`, `use-listings.ts`)

**Authentication**: Stellar wallet-based auth via `@creit-tech/stellar-wallets-kit`

### Stellar/Escrow Integration

- Uses `@trustless-work/escrow` package for escrow functionality
- Escrow lifecycle: created → funded → milestone updates → released/resolved
- Supported tokens: CRCX, MXNX, USDC
- Wallet state managed in `apps/web/store/wallet.store.ts`
- Stellar hooks: `use-stellar.ts`, `use-wallet.ts`

### Web App Routes

- `/` - Landing page
- `/auth` - Authentication
- `/dashboard` - Main dashboard
- `/dashboard/listings` - Manage listings
- `/dashboard/escrows` - Manage escrows
- `/dashboard/wallet` - Wallet management
- `/m/[slug]` - Public merchant profile

## Code Conventions

- **Biome** for formatting/linting (not ESLint for formatting)
- **TypeScript strict mode** - avoid `any` types
- **Tailwind CSS** for styling with dark mode support via next-themes
- **Radix UI + shadcn/ui** patterns for components
- **Functional components** with arrow functions and explicit types
- Event handlers prefixed with `handle` (e.g., `handleClick`)
- Use `clsx` for conditional classes
