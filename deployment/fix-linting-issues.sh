#!/bin/bash

# Fix for all linting issues
echo "🔧 Fixing all linting issues..."

# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Install missing type definitions
echo "Installing missing type definitions..."
cd backend
npm install --save-dev @types/bcryptjs @types/node @types/express @types/cors @types/multer
cd ..

cd frontend
npm install --save-dev @types/node
cd ..

# Run ESLint with auto-fix
echo "Running ESLint auto-fix..."
npm run lint:fix

# Run TypeScript check
echo "Running TypeScript check..."
npm run type-check

# Build the application
echo "Building application..."
npm run build

echo "✅ Linting issues fixed and build completed successfully!"
