# Pacto P2P

<div align="center">

**A decentralized OTC (Over-The-Counter) platform for Stellar stablecoins**

Enabling peer-to-peer trading of XLM and USDC using regional payment rails like SINPE and SPEI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2+-black.svg)](https://nextjs.org/)

</div>

---

## Overview

Pacto P2P is a non-custodial trading platform that connects buyers and sellers of Stellar stablecoins through secure, blockchain-backed escrows. Every trade is secured by Trustless Work smart contracts on the Stellar blockchain, ensuring transparency and security without requiring a trusted intermediary.

### Key Features

- **Non-Custodial Trading**: Your funds are secured by smart contracts, not held by us
- **Borderless Payments**: Trade using regional payment methods (SINPE, SPEI, etc.)
- **Fast Settlements**: Stellar blockchain enables near-instant transactions
- **Dispute Resolution**: Built-in dispute system for trade conflicts
- **Merchant Profiles**: Verified merchant accounts with public profiles
- **Real-time Tracking**: Live status updates for trades and escrows

### Supported Assets

- **XLM** - Stellar Lumens (Global, native asset)
- **USDC** - USD Coin (Global, various payment methods)

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — required to run Supabase locally. Docker Desktop must be installed and running before you start the local database.
- **Supabase CLI** — required to manage the local Supabase stack. Install globally with `npm i -g supabase` or use it directly with `npx supabase` (no global install needed).
- **Trustless Work API credentials** — required for escrows and trades. You need:
  - An API key (`NEXT_PUBLIC_TLW_API_KEY`)
  - A Stellar role address (`NEXT_PUBLIC_ROLE_ADDRESS`)

  Obtain both from [Trustless Work](https://trustlesswork.com/) or their documentation.

### Installation and Local Setup

Follow these steps in order:

**1. Clone and install dependencies**

```bash
git clone https://github.com/your-username/pacto-p2p.git
cd pacto-p2p
npm install
```

**2. Start local Supabase with Docker**

Make sure Docker Desktop is running, then:

```bash
npm run db:start
```

This pulls the required Docker images (first run only), applies all migrations, seeds sample data, and prints the local Supabase keys. Copy the `anon key` and `service_role key` from the output — you will need them in the next step.

**3. Set up environment variables**

Copy the example env file to create your local config:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Open `apps/web/.env.local` and fill in the values:

- **Supabase keys**: use the `API URL`, `anon key`, `service_role key`, and `JWT secret` printed by `npm run db:start` in the previous step.
- **Trustless Work credentials**: paste your `NEXT_PUBLIC_TLW_API_KEY` and `NEXT_PUBLIC_ROLE_ADDRESS` obtained from Trustless Work.

**4. Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Local Database Setup

The project uses Supabase for its PostgreSQL database. A full local setup is included so you can develop without depending on a remote instance.

**Start the local Supabase stack**

Make sure Docker Desktop is running, then:

```bash
npm run db:start
```

This pulls the required Docker images (first run only), applies all migrations in `supabase/migrations/` in order, runs `supabase/seed.sql` to populate sample data, and starts the local services:

| Service       | URL                                                     |
| ------------- | ------------------------------------------------------- |
| Studio (UI)   | http://127.0.0.1:54323                                  |
| API (REST)    | http://127.0.0.1:54321/rest/v1                          |
| Database      | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| Mailpit       | http://127.0.0.1:54324                                  |

**Reset the database (re-apply migrations + seed)**

If you want a clean slate at any point:

```bash
npm run db:reset
```

This drops all data, re-runs every migration from scratch, and re-seeds.

**Stop the local stack**

```bash
npm run db:stop
```

Data is persisted in Docker volumes, so `npm run db:start` will restore where you left off. Use `supabase stop --no-backup` to discard volumes entirely.

### Creating a New Migration

When you need to modify the database schema (add tables, columns, indexes, etc.):

```bash
npm run db:migration your_migration_name
```

This creates `supabase/migrations/<timestamp>_your_migration_name.sql`. Write your SQL there, then apply it:

```bash
# Option A: Reset everything (migrations + seed)
npm run db:reset

# Option B: Apply only pending migrations to a running instance
npx supabase migration up
```

**Guidelines for writing migrations:**

- Make migrations idempotent when possible (`CREATE OR REPLACE`, `IF NOT EXISTS`, etc.) so repeated runs do not fail.
- Each migration should be a self-contained change. Do not modify a previous migration file — always create a new one.
- If your migration adds columns that the seed data depends on, update `supabase/seed.sql` as well.
- Test locally with `npm run db:reset` before pushing.

### Diffing Schema Changes

If you made changes directly through Studio or psql and want to capture them as a migration:

```bash
npx supabase db diff -f describe_your_change
```

This compares the live local database against the migration history and generates a new migration file with the differences.

### Environment Setup

Copy `apps/web/.env.example` to `apps/web/.env.local`:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Open `apps/web/.env.local` and fill in the following:

**Supabase (local development)**

Run `npm run db:start` first. The CLI prints all keys you need:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from db:start output>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from db:start output>
SUPABASE_JWT_SECRET=<jwt secret from db:start output>
```

**Trustless Work (required for escrows and trades)**

Obtain your API key and Stellar role address from [Trustless Work](https://trustlesswork.com/):

```env
NEXT_PUBLIC_TLW_API_KEY=<your-trustless-work-api-key>
NEXT_PUBLIC_ROLE_ADDRESS=<your-stellar-role-address>
```

See `apps/web/.env.example` for the full list of variables including optional ones.

## Architecture

### Monorepo Structure

```
pacto-p2p/
├── apps/
│   └── web/                 # Next.js web application
│       ├── app/             # Next.js App Router pages
│       ├── components/      # React components
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # Utilities and services
│       └── providers/       # React context providers
│
├── packages/
│   ├── shared/              # Shared utilities and services
│   ├── ui/                  # Reusable UI components (Radix UI)
│   ├── types/               # TypeScript type definitions
│   └── config/              # Configuration and scripts
│
├── supabase/
│   ├── config.toml          # Local Supabase configuration
│   ├── migrations/          # SQL migrations (applied in order)
│   └── seed.sql             # Sample data for local development
│
├── docs/                    # Documentation
│   ├── DEVELOPMENT.md       # Development guide
│   └── DATABASE_SCHEMA.md   # Database schema
│
├── scripts/                 # Utility scripts
├── CONTRIBUTING.md          # Contribution guidelines
└── README.md                # This file
```

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, Shadcn UI, Radix UI
- **State Management**: Zustand, TanStack Query
- **Blockchain**: Stellar, Trustless Work
- **Database**: Supabase (PostgreSQL)
- **Code Quality**: Biome, TypeScript
- **Build System**: Turborepo, npm workspaces

## Workspaces

### Apps

- **`apps/web`** - Main Next.js web application
  - Dashboard for managing listings, escrows, and trades
  - Stellar wallet integration via Trustless Work
  - Supabase backend integration
  - Merchant profiles and public pages

### Packages

- **`packages/shared`** - Common utilities and services
  - Database services (Supabase client)
  - Stellar wallet utilities
  - State management (Zustand stores)
  - Validation schemas (Zod)

- **`packages/ui`** - Reusable UI components
  - Radix UI primitives
  - Custom themed components
  - Form components
  - Layout components

- **`packages/types`** - TypeScript type definitions
  - Escrow types
  - API response types
  - Database schema types

- **`packages/config`** - Configuration and scripts
  - Database initialization scripts
  - Environment configurations
  - Build configurations

## Usage

### Connecting Your Wallet

1. Click "Sign In" on the homepage
2. Choose your preferred Stellar wallet (Freighter, WalletConnect, etc.)
3. Approve the connection in your wallet
4. You will be redirected to the dashboard

### Creating a Listing

1. Navigate to "Listings" in the dashboard
2. Click "New Listing"
3. Fill in the trade details:
   - Token type (XLM, USDC)
   - Amount and rate
   - Payment method
   - Description
4. Submit the listing

### Making a Trade

1. Browse available listings on the marketplace
2. Click on a listing to view details
3. Click "Trade" to initiate an escrow
4. Follow the escrow process:
   - Deposit funds to the escrow contract
   - Send fiat payment to the seller
   - Upload payment receipt
   - Wait for seller confirmation
   - Funds are automatically released

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start web app in development mode
npm run build            # Build all packages and apps
npm run start            # Start web app in production mode

# Code Quality
npm run lint             # Lint all packages
npm run biome:check      # Check code with Biome
npm run biome:format     # Format code with Biome
npm run biome:fix        # Fix code issues with Biome
npm run type-check       # Type check all packages

# Database
npm run db:start         # Start local Supabase (Docker Desktop required)
npm run db:stop          # Stop local Supabase
npm run db:reset         # Drop, re-migrate, and re-seed
npm run db:migration     # Create a new migration file

# Maintenance
npm run clean            # Clean all build artifacts
```

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our [coding standards](./CONTRIBUTING.md#coding-standards)

3. **Test your changes**:
   ```bash
   npm run type-check
   npm run biome:check
   npm run build
   ```

4. **Commit using Conventional Commits**:
   ```bash
   git commit -m "feat: add new feature"
   ```

5. **Push and create a Pull Request**

For detailed development instructions, see [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md).

### Adding New Packages

1. Create a new directory in `packages/`
2. Add `package.json` with workspace dependencies
3. Add TypeScript configuration
4. Update root `package.json` workspaces if needed

### Adding New Apps

1. Create a new directory in `apps/`
2. Add `package.json` with workspace dependencies
3. Add necessary configuration files (next.config.ts, tsconfig.json, etc.)
4. Update root `package.json` workspaces if needed

## Configuration

### TypeScript

- Root `tsconfig.json` provides base configuration
- Each package extends the root config
- Path mapping for workspace dependencies

### Biome

- Consistent code formatting and linting
- Shared configuration across all packages
- Automatic fixes and formatting

### Workspace Dependencies

Use `workspace:*` for internal dependencies:

```json
{
  "dependencies": {
    "@pacto-p2p/shared": "workspace:*",
    "@pacto-p2p/ui": "workspace:*"
  }
}
```

## Deployment

### Web App

```bash
npm run build
npm run start
```

### Environment Variables

Ensure all required environment variables are set in your deployment environment. See `apps/web/.env.example` for the full list of variables and their descriptions.

## Contributing

We welcome contributions. Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- Code of Conduct
- Development workflow
- Coding standards
- Pull request process
- Reporting issues

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run type-check && npm run biome:check`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Documentation

- **[Development Guide](./docs/DEVELOPMENT.md)** - Detailed development instructions and architecture
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Database structure and relationships
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project

## Security

If you discover a security vulnerability, please email security concerns privately to the maintainers. Do not open public issues for security vulnerabilities.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Stellar Development Foundation](https://www.stellar.org/)
- [Trustless Work](https://trustlesswork.com/) for escrow infrastructure
- [Next.js](https://nextjs.org/) for the amazing framework
- All our contributors and supporters

---

<div align="center">

Made with care by the Pacto P2P team

[Documentation](./docs/) • [Contributing](./CONTRIBUTING.md) • [Issues](https://github.com/PACTO-LAT/pacto-p2p/issues)

</div>