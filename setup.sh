#!/bin/bash

# PharmaChain Setup Script
# Complete project setup and initialization

set -e

echo "🚀 Setting up PharmaChain..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Navigate to project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

print_status "📍 Working in: $(pwd)"

# 1. Clean up any existing node_modules and lock files
print_status "🧹 Cleaning up old dependencies..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "package-lock.json" -not -path "*/node_modules/*" -delete 2>/dev/null || true
find . -name ".next" -type d -exec rm -rf {} + 2>/dev/null || true

# 2. Install dependencies for each service
print_status "📦 Installing dependencies..."

services=("blockchain" "backend" "ipfs" "ai-service" "frontend")

for service in "${services[@]}"; do
    if [ -d "$service" ]; then
        print_status "Installing $service dependencies..."
        cd "$service" && npm install --silent && cd ..
        print_success "✅ $service dependencies installed"
    else
        print_warning "⚠️ $service directory not found, skipping..."
    fi
done

# 3. Set up environment files
print_status "🔧 Setting up environment files..."

setup_env() {
    local service=$1
    if [ -d "$service" ] && [ -f "$service/.env.example" ]; then
        if [ ! -f "$service/.env" ]; then
            cp "$service/.env.example" "$service/.env"
            print_success "Created $service/.env"
        else
            print_warning "$service/.env already exists"
        fi
    fi
}

setup_env "backend"
setup_env "blockchain" 
setup_env "ai-service"
setup_env "ipfs"

# Frontend uses .env.local
if [ -d "frontend" ] && [ -f "frontend/.env.example" ]; then
    if [ ! -f "frontend/.env.local" ]; then
        cp "frontend/.env.example" "frontend/.env.local"
        print_success "Created frontend/.env.local"
    else
        print_warning "frontend/.env.local already exists"
    fi
fi

# 4. Create logs directories
print_status "📁 Creating log directories..."
mkdir -p ai-service/logs backend/logs ipfs/logs blockchain/logs

print_success "🎉 PharmaChain setup completed!"

echo ""
echo "📋 Next steps:"
echo "  1. Configure your environment files:"
echo "     • backend/.env - Add your Infura Project ID and private key"
echo "     • blockchain/.env - Add your private key for deployment"
echo "     • ai-service/.env - Configure database URLs"
echo "     • ipfs/.env - Add IPFS configuration"
echo "     • frontend/.env.local - Add public configuration"
echo ""
echo "  2. Start the services (in separate terminals):"
echo "     cd backend && npm run dev"
echo "     cd ipfs && npm run dev"
echo "     cd ai-service && npm run dev"
echo "     cd frontend && npm run dev"
echo ""
echo "  3. Access the application:"
echo "     • Frontend: http://localhost:3000"
echo "     • Backend API: http://localhost:3002"
echo "     • IPFS Service: http://localhost:3001"
echo "     • AI Service: http://localhost:3004"
echo ""
echo "🔧 For development, see the README.md for detailed instructions."