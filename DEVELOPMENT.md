# Development Guide

This guide covers development practices and workflows for the Pacto P2P monorepo.

## 🏗️ Architecture Overview

### Monorepo Benefits

- **Shared Code**: Common utilities, types, and components
- **Consistent Tooling**: Unified linting, formatting, and testing
- **Faster Development**: Parallel builds and intelligent caching
- **Safer Integrations**: Isolated packages for new features
- **Team Collaboration**: Centralized codebase with clear boundaries

### Package Structure

```
packages/
├── shared/          # Business logic and services
├── ui/              # Reusable UI components
├── types/           # TypeScript type definitions
└── config/          # Configuration and scripts

apps/
└── web/             # Next.js web application
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd pacto-p2p

# Install dependencies
npm install

# Build all packages
npm run build

# Start development
npm run dev
```

## 📦 Package Development

### Adding New Packages

1. **Create package structure**:
   ```bash
   mkdir -p packages/new-package/src
   ```

2. **Add package.json**:
   ```json
   {
     "name": "@pacto-p2p/new-package",
     "version": "0.1.0",
     "private": true,
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch",
       "clean": "rm -rf dist",
       "type-check": "tsc --noEmit"
     },
     "dependencies": {
       "@pacto-p2p/types": "workspace:*"
     },
     "devDependencies": {
       "@biomejs/biome": "^2.1.1",
       "@types/node": "^20",
       "typescript": "^5"
     }
   }
   ```

3. **Add TypeScript config**:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src",
       "declaration": true
     },
     "include": ["src/**/*"],
     "exclude": ["dist", "node_modules"]
   }
   ```

4. **Create index file**:
   ```typescript
   // packages/new-package/src/index.ts
   export * from './components';
   export * from './utils';
   ```

### Package Dependencies

Use workspace dependencies for internal packages:

```json
{
  "dependencies": {
    "@pacto-p2p/shared": "workspace:*",
    "@pacto-p2p/ui": "workspace:*"
  }
}
```

### Building Packages

```bash
# Build specific package
npm run build --workspace=@pacto-p2p/shared

# Build all packages
npm run build

# Watch mode for development
npm run dev --workspace=@pacto-p2p/shared
```

## 🎯 App Development

### Adding New Apps

1. **Create app structure**:
   ```bash
   mkdir -p apps/new-app
   ```

2. **Add package.json**:
   ```json
   {
     "name": "@pacto-p2p/new-app",
     "version": "0.1.0",
     "private": true,
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start"
     },
     "dependencies": {
       "@pacto-p2p/shared": "workspace:*",
       "@pacto-p2p/ui": "workspace:*",
       "next": "15.2.4",
       "react": "^19.0.0"
     }
   }
   ```

3. **Add necessary config files** (next.config.ts, tsconfig.json, etc.)

### Using Shared Packages

Import from workspace packages:

```typescript
// In apps/web/app/page.tsx
import { Button } from '@pacto-p2p/ui';
import { supabaseClient } from '@pacto-p2p/shared';
import { EscrowType } from '@pacto-p2p/types';
```

## 🛠️ Development Workflow

### Code Quality

```bash
# Lint all packages
npm run lint

# Format code
npm run biome:format

# Fix issues
npm run biome:fix

# Type check
npm run type-check
```

### Testing Strategy

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test package interactions
3. **E2E Tests**: Test complete user workflows

### Git Workflow

1. **Feature Branches**: Create from main
2. **Package Changes**: Commit to specific package
3. **Cross-Package Changes**: Use conventional commits
4. **Pull Requests**: Require reviews for main branch

## 🔧 Configuration

### TypeScript

- Root `tsconfig.json` provides base configuration
- Packages extend root config with specific overrides
- Path mapping for workspace dependencies

### Biome

- Shared configuration across all packages
- Consistent formatting and linting rules
- Automatic fixes and formatting

### Turbo

- Fast incremental builds
- Intelligent caching
- Parallel task execution
- Dependency graph optimization

## 📝 Best Practices

### Package Design

1. **Single Responsibility**: Each package has one clear purpose
2. **Minimal Dependencies**: Only include necessary dependencies
3. **Clear APIs**: Well-defined exports and interfaces
4. **Type Safety**: Full TypeScript coverage

### Code Organization

1. **Consistent Structure**: Follow established patterns
2. **Clear Naming**: Descriptive file and function names
3. **Documentation**: Comment complex logic
4. **Testing**: Write tests for critical functionality

### Performance

1. **Tree Shaking**: Use ES modules for better bundling
2. **Lazy Loading**: Load packages on demand
3. **Caching**: Leverage Turbo's caching capabilities
4. **Bundle Analysis**: Monitor bundle sizes

## 🚀 Deployment

### Web App

```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Packages

```bash
# Build all packages
npm run build

# Publish to registry (if needed)
npm publish --workspace=@pacto-p2p/shared
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**: Check package dependencies
2. **Type Errors**: Ensure all packages are built
3. **Import Issues**: Verify workspace dependencies
4. **Cache Issues**: Clear Turbo cache with `npm run clean`

### Debug Commands

```bash
# Check workspace status
npm run build --dry-run

# View dependency graph
npx turbo graph

# Clear all caches
npm run clean && rm -rf node_modules && npm install
```

## 📚 Resources

- [Turbo Documentation](https://turbo.build/repo/docs)
- [npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Biome Documentation](https://biomejs.dev/) 