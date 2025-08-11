#!/bin/bash

# Fix Material-UI Grid components for MUI v7 compatibility
echo "Fixing Grid components for MUI v7..."

# Function to fix Grid imports and usage in a file
fix_grid_in_file() {
    local file="$1"
    echo "Fixing Grid in: $file"
    
    # Replace Grid import
    sed -i 's/import { Grid } from '\''@mui\/material'\''/import Grid from '\''@mui\/material\/Unstable_Grid2'\''/g' "$file"
    
    # Replace Grid item usage
    sed -i 's/<Grid item /<Grid /g' "$file"
    
    # Remove Grid from main import if it exists
    sed -i '/Grid,/d' "$file"
}

# Find all TypeScript/TSX files and fix Grid components
find src -name "*.tsx" -type f | while read -r file; do
    if grep -q "Grid item" "$file"; then
        fix_grid_in_file "$file"
    fi
done

echo "Grid components fixed!"
