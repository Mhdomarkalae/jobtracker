#!/bin/bash
set -e

echo "🚀 JobTracker Local Setup"
echo "======================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Missing .env.local"
    echo "Creating from template..."
    cp .env.local.example .env.local
    echo "❌ Please edit .env.local with your Supabase credentials"
    echo "   Then run this script again"
    exit 1
fi

echo "✅ .env.local found"
echo ""

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="
echo ""
echo "To run the app:"
echo ""
echo "Terminal 1 (Backend):"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
