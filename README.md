# Pacto P2P

<div align="center">

**A decentralized OTC (Over-The-Counter) platform for Stellar stablecoins**

Enabling peer-to-peer trading of CRCX, MXNX, and USDC using regional payment rails like SINPE and SPEI.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2+-black.svg)](https://nextjs.org/)

</div>

---

## 🌟 Overview

Pacto P2P is a non-custodial trading platform that connects buyers and sellers of Stellar stablecoins through secure, blockchain-backed escrows. Every trade is secured by Trustless Work smart contracts on the Stellar blockchain, ensuring transparency and security without requiring a trusted intermediary.

### Key Features

- **🔒 Non-Custodial Trading**: Your funds are secured by smart contracts, not held by us
- **🌍 Borderless Payments**: Trade using regional payment methods (SINPE, SPEI, etc.)
- **⚡ Fast Settlements**: Stellar blockchain enables near-instant transactions
- **🛡️ Dispute Resolution**: Built-in dispute system for trade conflicts
- **💼 Merchant Profiles**: Verified merchant accounts with public profiles
- **📊 Real-time Tracking**: Live status updates for trades and escrows

### Supported Assets

- **CRCX** - Costa Rican Colón Token
- **MXNX** - Mexican Peso Token
- **USDC** - USD Coin (Global, various payment methods)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required for local Supabase)
- Supabase CLI (`npx supabase` works out of the box, or install globally with `npm i -g supabase`)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pacto-p2p.git
cd pacto-p2p

# Install all dependencies
npm install

# Build all packages
npm run build

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Local Database Setup

The project uses Supabase for its PostgreSQL database. A full local setup is included so you can develop without depending on a remote instance.

**1. Start the local Supabase stack**

Make sure Docker Desktop is running, then:

```bash
npm run db:start
```

This pulls the required Docker images (first run only), applies all migrations in `supabase/migrations/` in order, runs `supabase/seed.sql` to populate sample data, and starts the local services:

| Service       | URL                              |
| ------------- | -------------------------------- |
| Studio (UI)   | http://127.0.0.1:54323           |
| API (REST)    | http://127.0.0.1:54321/rest/v1   |
| Database      | postgresql://postgres:postgres@127.0.0.1:54322/postgres |
| Mailpit       | http://127.0.0.1:54324           |

**2. Reset the database (re-apply migrations + seed)**

If you want a clean slate at any point:

```bash
npm run db:reset
```

This drops all data, re-runs every migration from scratch, and re-seeds.

**3. Stop the local stack**

```bash
npm run db:stop
```

Data is persisted in Docker volumes, so `npm run db:start` will restore where you left off. Use `supabase stop --no-backup` to discard volumes entirely.

### Creating a New Migration

When you need to modify the database schema (add tables, columns, indexes, etc.):

```bash
# Generate a new timestamped migration file
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

- Make migrations **idempotent** when possible (`CREATE OR REPLACE`, `IF NOT EXISTS`, etc.) so repeated runs don't fail.
- Each migration should be a self-contained change. Don't modify a previous migration file — always create a new one.
- If your migration adds columns that the seed data depends on, update `supabase/seed.sql` as well.
- Test locally with `npm run db:reset` before pushing.

### Diffing Schema Changes

If you made changes directly through Studio or psql and want to capture them as a migration:

```bash
npx supabase db diff -f describe_your_change
```

This compares the live local database against the migration history and generates a new migration file with the differences.

### Environment Setup

Create a `.env.local` file in `apps/web` with the following variables:

```env
# Stellar & Trustless Work
NEXT_PUBLIC_TLW_API_KEY=your_trustless_work_api_key
NEXT_PUBLIC_ROLE_ADDRESS=your_stellar_role_address
NEXT_PUBLIC_PLATFORM_FEE=0.01

# Supabase (use these defaults for local development)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key from supabase start output>

# Optional: Mock Mode
NEXT_PUBLIC_USE_MOCK=0

# Optional: Landing supported assets. JSON object keyed by asset symbol; each value must have name, region, paymentMethods, color. If unset or invalid, default assets (CRCX, MXNX, USDC) are used. See apps/web/.env.example for format.
# NEXT_PUBLIC_SUPPORTED_ASSETS={"CRCX":{"name":"Costa Rican Colón Token","region":"Costa Rica","paymentMethods":"SINPE","color":"bg-green-500"},...}
```

## 🏗️ Architecture

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

## 📦 Workspaces

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

## 🎯 Usage

### Connecting Your Wallet

1. Click "Sign In" on the homepage
2. Choose your preferred Stellar wallet (Freighter, WalletConnect, etc.)
3. Approve the connection in your wallet
4. You'll be redirected to the dashboard

### Creating a Listing

1. Navigate to "Listings" in the dashboard
2. Click "New Listing"
3. Fill in the trade details:
   - Token type (CRCX, MXNX, USDC)
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

## 🛠️ Development

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
npm run db:start         # Start local Supabase (Docker required)
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

## 🔧 Configuration

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

## 🚀 Deployment

### Web App

```bash
# Build the web app
npm run build

# Start production server
npm run start
```

### Environment Variables

Ensure all required environment variables are set in your deployment environment. See [Quick Start](#quick-start) for the list of required variables.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

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

## 📚 Documentation

- **[Development Guide](./docs/DEVELOPMENT.md)** - Detailed development instructions and architecture
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Database structure and relationships
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project

## 🔐 Security

If you discover a security vulnerability, please email security concerns privately to the maintainers. Do not open public issues for security vulnerabilities.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://www.stellar.org/)
- [Trustless Work](https://trustlesswork.com/) for escrow infrastructure
- [Next.js](https://nextjs.org/) for the amazing framework
- All our contributors and supporters

---

<div align="center">

Made with ❤️ by the Pacto P2P team

[Documentation](./docs/) • [Contributing](./CONTRIBUTING.md) • [Issues](https://github.com/your-username/pacto-p2p/issues)

</div>
