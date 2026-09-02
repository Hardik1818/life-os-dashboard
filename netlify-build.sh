#!/bin/bash
set -e

echo "=== Life OS: Netlify Build Script ==="
echo "Node: $(node --version)"
echo "NPM:  $(npm --version)"

# Install deps
npm ci

# Build using the standard vite build
# @lovable.dev/vite-tanstack-config uses cloudflare-module preset by default
# which outputs to .output/public/
npm run build

echo "=== Build complete. Output directory: .output/public ==="
ls -la .output/public/ || echo "WARNING: .output/public not found!"
