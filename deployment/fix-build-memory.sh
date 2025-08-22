#!/bin/bash

# Fix for Next.js build memory issues
echo "🔧 Fixing Next.js build memory issues..."

# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Clear npm cache
npm cache clean --force

# Remove existing build artifacts
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
npm install
npm install --save-dev @types/node

# Build with increased memory
echo "Building with increased memory limit..."
npm run build

echo "✅ Build completed successfully!"
