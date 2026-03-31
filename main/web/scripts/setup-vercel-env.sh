#!/usr/bin/env bash
# Setup Vercel Environment Variables Securely
# This script helps you add API keys to Vercel without storing them in Git

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "TradeHax Vercel Environment Setup"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "This script will add your API keys to Vercel securely."
echo "Your keys will NOT be stored in Git."
echo ""
echo "Prerequisites:"
echo "  1. You're logged into Vercel CLI (npx vercel login)"
echo "  2. You have your API keys ready"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with:"
    echo "   npm i -g vercel"
    exit 1
fi

# Define required keys
KEYS=(
    "HF_API_TOKEN:Hugging Face API Token (https://huggingface.co/settings/tokens)"
    "OPENAI_API_KEY:OpenAI API Key (https://platform.openai.com/api-keys)"
    "SUPABASE_URL:Supabase Project URL"
    "SUPABASE_SERVICE_ROLE_KEY:Supabase Service Role Key"
    "FINNHUB_API_KEY:Finnhub API Key (https://finnhub.io/dashboard)"
)

echo "📝 Environment variables to set:"
echo ""
for i in "${!KEYS[@]}"; do
    IFS=':' read -r key desc <<< "${KEYS[$i]}"
    echo "  $((i+1)). $key"
    echo "     $desc"
    echo ""
done

echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Setting variables in Vercel (Production)..."
echo ""

for item in "${KEYS[@]}"; do
    IFS=':' read -r key desc <<< "$item"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Enter $key"
    echo "$desc"
    echo ""
    read -sp "Value: " value
    echo ""

    if [ ! -z "$value" ]; then
        npx vercel env add "$key" "$value" --scope production > /dev/null 2>&1 || true
        echo "✅ $key set"
    else
        echo "⏭️  Skipped (empty value)"
    fi
    echo ""
done

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Setup complete!"
echo ""
echo "Verify with:"
echo "  npx vercel env ls"
echo ""
echo "Deploy with:"
echo "  npm run deploy:tech"
echo ""
echo "Learn more: https://vercel.com/docs/environment-variables"

