#!/bin/bash
# CI/CD Supabase SQL migration script (idempotent)
# Used by GitHub Actions and other CI runners
set -e

if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI not found. Installing..."
  npm install -g supabase
fi

if [ ! -f "./supabase_schema.sql" ]; then
  echo "❌ supabase_schema.sql not found in project root."
  exit 1
fi

echo "🚀 Running Supabase SQL migration (CI/CD)..."
supabase db push --file ./supabase_schema.sql

echo "✅ Supabase migration complete (CI/CD)."

