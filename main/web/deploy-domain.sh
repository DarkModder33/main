#!/bin/bash
# Usage: ./deploy-domain.sh tradehaxai.me
set -e
DOMAIN=$1
if [ -z "$DOMAIN" ]; then
  echo "Usage: $0 <domain>"
  exit 1
fi
EXT="${DOMAIN##*.}"
ENV_FILE=".env.local.$EXT"
if [ ! -f "$ENV_FILE" ]; then
  echo "Environment file $ENV_FILE not found."
  exit 1
fi
cp "$ENV_FILE" .env.local
echo "Copied $ENV_FILE to .env.local"
# npm install # Uncomment if needed
npm run build
echo "Build complete. Deploying..."
npx vercel --prod

