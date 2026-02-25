#!/bin/bash

# Test Merchant Applications Feature - Quick Start Script
# This script helps you quickly set up and test the merchant applications feature

set -e

echo "🚀 Pacto P2P - Merchant Applications Testing Setup"
echo "=================================================="
echo ""

# Check if .env.local exists
if [ ! -f "apps/web/.env.local" ]; then
    echo "⚠️  .env.local not found!"
    echo ""
    echo "Creating apps/web/.env.local from template..."
    cp apps/web/.env.example apps/web/.env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: You need to update the Supabase keys in apps/web/.env.local"
    echo ""
    echo "Steps:"
    echo "1. Run: npm run db:start"
    echo "2. Copy the keys printed by Supabase"
    echo "3. Update apps/web/.env.local with those keys"
    echo "4. Run this script again"
    echo ""
    exit 1
fi

echo "✅ Found .env.local"
echo ""

# Check if Supabase is running
echo "🔍 Checking if Supabase is running..."
if ! curl -s http://127.0.0.1:54321/health > /dev/null 2>&1; then
    echo "⚠️  Supabase is not running"
    echo ""
    echo "Starting Supabase..."
    npm run db:start
    echo ""
    echo "⚠️  Please update apps/web/.env.local with the keys printed above"
    echo "Then run this script again"
    exit 1
fi

echo "✅ Supabase is running"
echo ""

# Reset database with seed data
echo "🗄️  Resetting database with seed data..."
npm run db:reset
echo "✅ Database reset complete"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "📋 Test Data Created:"
echo "  - 3 Verified merchants (Alice, Bob, Diana)"
echo "  - 2 Pending merchants (Charlie, Eve)"
echo ""
echo "🎯 Next Steps:"
echo "  1. Start the dev server: npm run dev"
echo "  2. Open http://localhost:3000/dashboard/admin"
echo "  3. Click on 'Merchant Applications' tab"
echo "  4. Follow the test scenarios in TESTING_MERCHANT_APPLICATIONS.md"
echo ""
echo "📖 Full testing guide: TESTING_MERCHANT_APPLICATIONS.md"
echo ""
echo "Happy testing! 🎉"
