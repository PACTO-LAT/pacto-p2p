# Pacto

A decentralized OTC (Over-The-Counter) platform for Stellar stablecoins, enabling peer-to-peer trading of CRCX, MXNX, and USDC using regional payment rails like SINPE and SPEI.

## 🌟 Features

### Core Functionality
- **Local P2P On/Off-Ramps**: Trade stablecoins using regional payment methods
- **Smart Contract Escrows**: Every trade secured by Trustless Work on Stellar
- **Fair OTC Market**: Non-custodial environment with transparent pricing
- **Borderless Trading**: Move value across borders with local fiat conversion

### Supported Assets
- **CRCX**: Costa Rican Colón Token
- **MXNX**: Mexican Peso Token
- **USDC**: USD Coin (Global, various payment methods)

### User Features
- **Dashboard**: Manage listings, escrows, and trade history
- **Wallet Integration**: Connect with Stellar wallets
- **Real-time Updates**: Live status tracking for trades and escrows
- **Dispute Resolution**: Built-in dispute system for trade conflicts

## 🎯 Usage

### Connecting Your Wallet
1. Click "Sign In" on the homepage
2. Choose your preferred Stellar wallet
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
1. Browse available listings
2. Click on a listing to view details
3. Click "Trade" to initiate an escrow
4. Follow the escrow process:
   - Deposit funds
   - Send fiat payment
   - Upload receipt
   - Wait for confirmation

## 🏗️ Monorepo Structure

```
pacto-p2p/
├── apps/
│   └── web/                 # Next.js web application
├── packages/
│   ├── shared/             # Shared utilities and services
│   ├── ui/                 # Reusable UI components
│   ├── types/              # TypeScript type definitions
│   └── config/             # Configuration and scripts
├── package.json            # Root workspace configuration
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Start development server
npm run dev
```

## 📦 Workspaces

### Apps

- **`apps/web`** - Main Next.js web application
  - Dashboard, authentication, escrow management
  - Stellar wallet integration
  - Supabase backend integration

### Packages

- **`packages/shared`** - Common utilities and services
  - Database services (Supabase)
  - Stellar wallet utilities
  - State management (Zustand)
  - Validation schemas (Zod)

- **`packages/ui`** - Reusable UI components
  - Radix UI components
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

# Maintenance
npm run clean            # Clean all build artifacts
```

### Adding New Packages

1. Create a new directory in `packages/`
2. Add `package.json` with workspace dependencies
3. Add TypeScript configuration
4. Update root `package.json` workspaces if needed

### Adding New Apps

1. Create a new directory in `apps/`
2. Add `package.json` with workspace dependencies
3. Add necessary configuration files
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

### Packages

```bash
# Build all packages
npm run build

# Publish packages (if needed)
npm publish --workspace=@pacto-p2p/shared
```

## 🤝 Contributing

1. Create a feature branch
2. Make changes in the appropriate workspace
3. Run tests and linting
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
