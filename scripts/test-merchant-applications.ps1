# Test Merchant Applications Feature - Quick Start Script (PowerShell)
# This script helps you quickly set up and test the merchant applications feature

$ErrorActionPreference = "Stop"

Write-Host "🚀 Pacto P2P - Merchant Applications Testing Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path "apps/web/.env.local")) {
    Write-Host "⚠️  .env.local not found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creating apps/web/.env.local from template..." -ForegroundColor Yellow
    Copy-Item "apps/web/.env.example" "apps/web/.env.local"
    Write-Host "✅ Created .env.local" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: You need to update the Supabase keys in apps/web/.env.local" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Yellow
    Write-Host "1. Run: npm run db:start"
    Write-Host "2. Copy the keys printed by Supabase"
    Write-Host "3. Update apps/web/.env.local with those keys"
    Write-Host "4. Set NEXT_PUBLIC_USE_MOCK=0 in .env.local"
    Write-Host "5. Run this script again"
    Write-Host ""
    exit 1
}

Write-Host "✅ Found .env.local" -ForegroundColor Green
Write-Host ""

# Check if Supabase is running
Write-Host "🔍 Checking if Supabase is running..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:54321/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "✅ Supabase is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Supabase is not running" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Starting Supabase..." -ForegroundColor Yellow
    npm run db:start
    Write-Host ""
    Write-Host "⚠️  Please update apps/web/.env.local with the keys printed above" -ForegroundColor Yellow
    Write-Host "Then run this script again"
    exit 1
}

Write-Host ""

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Reset database with seed data
Write-Host "🗄️  Resetting database with seed data..." -ForegroundColor Cyan
npm run db:reset
Write-Host "✅ Database reset complete" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Test Data Created:" -ForegroundColor Cyan
Write-Host "  - 3 Verified merchants (Alice, Bob, Diana)"
Write-Host "  - 2 Pending merchants (Charlie, Eve)"
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start the dev server: npm run dev"
Write-Host "  2. Open http://localhost:3000/dashboard/admin"
Write-Host "  3. Click on 'Merchant Applications' tab"
Write-Host "  4. Follow the test scenarios in TESTING_MERCHANT_APPLICATIONS.md"
Write-Host ""
Write-Host "📖 Full testing guide: TESTING_MERCHANT_APPLICATIONS.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy testing! 🎉" -ForegroundColor Green
