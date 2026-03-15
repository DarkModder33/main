# =====================================================================
# TradeHax Endpoint Health Check Script (PowerShell)
#
# This script automates health checks for all major API endpoints and services:
#   - Hugging Face LLM (scripts/api-connection-manager.js)
#   - OpenAI (scripts/api-connection-manager.js)
#   - Supabase (web/scripts/supabase-health.mjs)
#   - Stripe (scripts/endpoint-health-check.js)
#   - TradeHax AI Chat (scripts/endpoint-health-check.js)
#   - Crypto Data (scripts/endpoint-health-check.js)
#   - Unusual Signals (scripts/endpoint-health-check.js)
#   - Any additional endpoints referenced in the above scripts
#
# Usage:
#   - Local:   powershell -ExecutionPolicy Bypass -File scripts/full-health-check.ps1
#   - Cloud:   Integrate as a CI/CD step or post-deploy hook
#
# Review output for errors and endpoint status.
# =====================================================================

# PowerShell master health check script for TradeHax
$ErrorActionPreference = 'Stop'

Write-Host "Running API Connection Manager..."
if (Test-Path "scripts/api-connection-manager.js") {
    node scripts/api-connection-manager.js
} else {
    Write-Host "scripts/api-connection-manager.js not found. Skipping."
}

Write-Host "Running Endpoint Health Check..."
if (Test-Path "scripts/endpoint-health-check.js") {
    node scripts/endpoint-health-check.js
} else {
    Write-Host "scripts/endpoint-health-check.js not found. Skipping."
}

Write-Host "Running Supabase Health Check..."
if (Test-Path "web/scripts/supabase-health.mjs") {
    node web/scripts/supabase-health.mjs
} else {
    Write-Host "web/scripts/supabase-health.mjs not found. Skipping."
}

Write-Host "Running nmap check..."
if (Test-Path "scripts/nmap-check.sh") {
    bash scripts/nmap-check.sh
} else {
    Write-Host "scripts/nmap-check.sh not found. Skipping."
}

Write-Host "All health checks complete. Review output above for errors."
