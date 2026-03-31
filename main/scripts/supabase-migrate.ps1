# Automated Supabase SQL migration script for CI/CD and Windows PowerShell
# Usage: ./scripts/supabase-migrate.ps1

if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI not found. Please install: https://supabase.com/docs/guides/cli"
    exit 1
}

if (-not (Test-Path "./supabase_schema.sql")) {
    Write-Host "❌ supabase_schema.sql not found in project root."
    exit 1
}

Write-Host "🚀 Running Supabase SQL migration..."
supabase db push --file ./supabase_schema.sql

Write-Host "✅ Supabase migration complete."

