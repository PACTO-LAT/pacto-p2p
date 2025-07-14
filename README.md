# Pacto DApp

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

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom glass morphism design
- **State Management**: Zustand for global state, React Query for server state
- **Blockchain**: Stellar network with Trustless Work escrow contracts
- **Backend**: Supabase for user management and data storage
- **Authentication**: Stellar wallet-based authentication

### Project Structure
```
pacto-dapp/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard and sub-pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── trade-*.tsx       # Modular trade components
│   └── dashboard-*.tsx   # Dashboard-specific components
├── hooks/                # Custom React hooks
│   ├── use-dialog.ts     # Dialog state management
│   ├── use-form-state.ts # Form state with validation
│   └── use-*.ts          # Feature-specific hooks
├── lib/                  # Utilities and configurations
│   ├── services/         # API service layer
│   ├── contexts/         # React contexts
│   ├── utils.ts          # Common utility functions
│   ├── mock-data.ts      # Centralized mock data
│   └── types.ts          # TypeScript type definitions
├── providers/            # React providers
├── store/                # Zustand stores
└── utils/                # Additional utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Stellar wallet (Freighter, Albedo, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pacto-dapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Stellar Network (testnet/mainnet)
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   
   # Trustless Work
   NEXT_PUBLIC_ROLE_ADDRESS=your_platform_address
   NEXT_PUBLIC_PLATFORM_FEE=0.01
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

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

## 🛠️ Development

### Code Quality Features

#### DRY (Don't Repeat Yourself)
- **Centralized utilities**: Common functions in `lib/utils.ts`
- **Custom hooks**: Reusable state management patterns
- **Mock data**: Single source of truth in `lib/mock-data.ts`

#### Modular Components
- **Single responsibility**: Each component has one clear purpose
- **Reusability**: Components can be used independently
- **Composition**: Complex UIs built from simple components

#### Type Safety
- **TypeScript**: Full type coverage across the application
- **Interface definitions**: Clear contracts for data structures
- **Generic hooks**: Type-safe custom hooks with generics

### Key Custom Hooks

#### `useDialog<T>()`
Manages dialog/modal state with type safety:
```typescript
const { dialogState, openDialog, closeDialog } = useDialog<Escrow>();
```

#### `useFormState<T>(initialState)`
Comprehensive form management with validation:
```typescript
const { formState, updateField, validateField } = useFormState({
  amount: '',
  rate: '',
  description: ''
});
```

### Utility Functions

#### Validation
```typescript
import { validateRequired, validateEmail, validateAmount } from '@/lib/utils';

// Validate required fields
const error = validateRequired(value, 'Field Name');

// Validate email format
const emailError = validateEmail(email);

// Validate numeric amounts
const amountError = validateAmount(amount);
```

#### Async Operations
```typescript
import { withLoading, handleAsyncError } from '@/lib/utils';

// Handle loading states
const result = await withLoading(
  () => apiCall(),
  setLoading
);

// Handle errors gracefully
const errorMessage = handleAsyncError(error, 'Operation failed');
```

## 🧪 Testing

### Running Tests
```bash
npm run test
# or
yarn test
```

### Test Structure
- **Unit tests**: Utility functions and hooks
- **Component tests**: UI component behavior
- **Integration tests**: End-to-end workflows

## 📦 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the established patterns:
   - Use custom hooks for state management
   - Leverage utility functions for common operations
   - Maintain type safety with proper interfaces
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Standards
- **TypeScript**: All new code must be typed
- **ESLint**: Follow the project's linting rules
- **Prettier**: Maintain consistent code formatting
- **Component patterns**: Follow established component structure

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Stellar Documentation](https://developers.stellar.org/)
- [Trustless Work Documentation](https://docs.trustless.work/)

### Community
- **Discord**: Join our community for discussions
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas

## 🔗 Links

- **Live Demo**: [pacto-dapp.vercel.app](https://pacto-dapp.vercel.app)
- **Documentation**: [docs.pacto-dapp.com](https://docs.pacto-dapp.com)
- **API Reference**: [api.pacto-dapp.com](https://api.pacto-dapp.com)

---

Built with ❤️ for the Stellar ecosystem
