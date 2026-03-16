#!/bin/bash
# Automated Supabase SQL migration script for CI/CD and local use
# Usage: ./scripts/supabase-migrate.sh

set -e

if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Please install: https://supabase.com/docs/guides/cli"
  exit 1
fi

if [ ! -f "./supabase_schema.sql" ]; then
  echo "❌ supabase_schema.sql not found in project root."
  exit 1
fi

echo "🚀 Running Supabase SQL migration..."
supabase db push --file ./supabase_schema.sql

echo "✅ Supabase migration complete."

