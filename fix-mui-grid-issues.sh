#!/bin/bash

# Temporary fix for MUI v7 Grid component issues
echo "Temporarily replacing Grid components with Box components..."

# Function to fix Grid components in a file
fix_grid_in_file() {
    local file="$1"
    echo "Fixing Grid in: $file"
    
    # Replace Grid container with Box
    sed -i 's/<Grid container /<Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }} /g' "$file"
    
    # Replace Grid item with Box
    sed -i 's/<Grid item /<Box sx={{ flex: "1 1 auto", minWidth: 0 }} /g' "$file"
    
    # Replace Grid with Box (for items without 'item' prop)
    sed -i 's/<Grid /<Box sx={{ flex: "1 1 auto", minWidth: 0 }} /g' "$file"
    
    # Close Grid tags
    sed -i 's/<\/Grid>/<\/Box>/g' "$file"
    
    # Remove Grid imports
    sed -i '/import.*Grid.*from/d' "$file"
    sed -i 's/, Grid//g' "$file"
    sed -i 's/Grid, //g' "$file"
}

# Find all TypeScript/TSX files and fix Grid components
find src -name "*.tsx" -type f | while read -r file; do
    if grep -q "Grid" "$file"; then
        fix_grid_in_file "$file"
    fi
done

echo "Grid components temporarily replaced with Box components!"
echo "This is a temporary fix. Consider downgrading to MUI v5 for production use."
