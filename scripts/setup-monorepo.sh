#!/bin/bash

# Pacto P2P Monorepo Setup Script
# This script helps set up the monorepo structure and installs dependencies

set -e

echo "🚀 Setting up Pacto P2P Monorepo..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the root directory."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build all packages
echo "🔨 Building all packages..."
npm run build

# Create necessary directories if they don't exist
echo "📁 Creating package directories..."
mkdir -p packages/shared/src
mkdir -p packages/ui/src
mkdir -p packages/types/src
mkdir -p packages/config/src

# Create basic package structure
echo "📝 Creating package structure..."

# Shared package
if [ ! -f "packages/shared/src/index.ts" ]; then
    cat > packages/shared/src/index.ts << 'EOF'
// Export all shared utilities and services
export * from './services';
export * from './utils';
export * from './constants';
export * from './types';
EOF
fi

# UI package
if [ ! -f "packages/ui/src/index.ts" ]; then
    cat > packages/ui/src/index.ts << 'EOF'
// Export all UI components
export * from './components';
export * from './hooks';
export * from './utils';
EOF
fi

# Types package
if [ ! -f "packages/types/src/index.ts" ]; then
    cat > packages/types/src/index.ts << 'EOF'
// Export all type definitions
export * from './Escrow';
EOF
fi

# Config package
if [ ! -f "packages/config/src/index.ts" ]; then
    cat > packages/config/src/index.ts << 'EOF'
// Export all configuration files
export * from './database';
export * from './constants';
EOF
fi

# Run type check
echo "🔍 Running type check..."
npm run type-check

# Run linting
echo "🧹 Running linting..."
npm run biome:check

echo "✅ Monorepo setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start development: npm run dev"
echo "2. Build all packages: npm run build"
echo "3. Check code quality: npm run lint"
echo ""
echo "📚 Documentation:"
echo "- README.md - Overview and quick start"
echo "- docs/DEVELOPMENT.md - Detailed development guide"
echo "- docs/DATABASE_SCHEMA.md - Database schema documentation"
echo "- CONTRIBUTING.md - Contribution guidelines"
echo ""
echo "🚀 Happy coding!" 