#!/bin/bash

# Bash master health check script for TradeHax
set -e

# Run API connection manager
if [ -f scripts/api-connection-manager.js ]; then
  echo "Running API Connection Manager..."
  node scripts/api-connection-manager.js
else
  echo "scripts/api-connection-manager.js not found. Skipping."
fi

# Run endpoint health check
if [ -f scripts/endpoint-health-check.js ]; then
  echo "Running Endpoint Health Check..."
  node scripts/endpoint-health-check.js
else
  echo "scripts/endpoint-health-check.js not found. Skipping."
fi

# Run Supabase health check
if [ -f web/scripts/supabase-health.mjs ]; then
  echo "Running Supabase Health Check..."
  node web/scripts/supabase-health.mjs
else
  echo "web/scripts/supabase-health.mjs not found. Skipping."
fi

# Run nmap check
if [ -f scripts/nmap-check.sh ]; then
  echo "Running nmap check..."
  bash scripts/nmap-check.sh
else
  echo "scripts/nmap-check.sh not found. Skipping."
fi

echo "All health checks complete. Review output above for errors."

