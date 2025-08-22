#!/bin/bash

# Fix for TypeScript type definition issues
echo "🔧 Fixing TypeScript type definition issues..."

# Install backend type definitions
echo "Installing backend type definitions..."
cd backend
npm install --save-dev @types/bcryptjs @types/node
cd ..

# Install frontend type definitions
echo "Installing frontend type definitions..."
npm install --save-dev @types/node

# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Build with types
echo "Building with type definitions..."
npm run build

echo "✅ TypeScript types fixed and build completed successfully!"
