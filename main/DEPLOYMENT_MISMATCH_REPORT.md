# ⚠️ DEPLOYMENT MISMATCH DETECTED

**Issue:** Local Docker serving old Vite build vs Live Vercel serving new Next.js app

---

## Current State

### Local (localhost:3000)
- Framework: **Vite (React)**
- Content: Old TradeHax neural hub concept
- Build: `web/dist/` (Vite output)
- Last built: ~2 hours ago

### Live (tradehax.net)
- Framework: **Next.js**
- Content: New integrated platform with:
  - AI Hub
  - Music Intelligence + Guitar Lessons
  - Games (Spades)
  - Tokenomics
  - Billing
  - Intelligence
  - About/Tutorials
- Pages: `/music`, `/games`, `/spades`, `/about`, `/tokenomics`, etc.
- Build: Next.js compilation (`/_next/static/`)

---

## What Changed

The codebase has been **completely refactored from Vite to Next.js** with new features:

### New Next.js Pages
✅ `/` - Home (Neural Link Active)
✅ `/ai-hub` - AI Hub
✅ `/music` - Music Intelligence / Guitar Lessons  
✅ `/games` - Games portal
✅ `/spades` - Spades card game
✅ `/tokenomics` - Token economics
✅ `/billing` - Billing/Payments
✅ `/intelligence` - Intelligence services
✅ `/about` - About page
✅ `/tutorials` - Tutorials
✅ `/schedule` - Booking (guitar lessons)
✅ `/game` - Main games page

### Tech Stack Changes
- Before: **Vite + React** (SPA)
- After: **Next.js 16** (SSR/SSG + API routes)
- Styling: Tailwind (same)
- Deployment: Vercel (same)

---

## How to Fix Local Environment

### Option 1: Get Latest Next.js Build (RECOMMENDED)
```bash
# Pull latest code with Next.js version
git pull origin main

# Install dependencies (Next.js requirements)
npm install

# Run Next.js dev server
npm run dev
# Now available at http://localhost:3000
```

### Option 2: Rebuild Docker Container
```bash
# Stop current Docker
docker-compose down

# Clean old images
docker image rm main-app -f

# Update Dockerfile to use Next.js start script
# (See changes below)

# Rebuild
docker-compose up --build
```

### Option 3: Run Vercel CLI Locally
```bash
# Install Vercel CLI
npm install -g vercel

# Pull Vercel project config
vercel link

# Run locally with Vercel environment
vercel dev
# Available at http://localhost:3000
```

---

## Key Files That Changed

```
OLD (Vite):
- web/vite.config.js
- web/dist/ (Vite output)
- npm run preview

NEW (Next.js):
- web/next.config.mjs ← Primary config
- web/.next/ (Next.js cache)
- web/app/ ← Next.js App Router (new structure)
- npm run dev
- npm run build (Next.js build)
```

---

## Updated Dockerfile for Next.js

```dockerfile
# Build stage
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy built app from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

---

## Next.js Deployment Info

**Vercel Deployment Status:**
```
✅ tradehax.net — Next.js 16 production
✅ tradehaxai.tech — Next.js 16 production
```

**Build Command:** `npm run build` (Next.js)  
**Start Command:** `npm start` (Next.js production server)  
**Dev Command:** `npm run dev` (Next.js dev server with hot reload)

---

## Immediate Action Items

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Update local environment:**
   ```bash
   npm install
   npm run dev
   ```

3. **Verify it works:**
   - Visit http://localhost:3000
   - Check `/music`, `/games`, `/about`
   - Verify API routes work

4. **Update Docker (optional):**
   - Apply Dockerfile changes above
   - Rebuild: `docker-compose up --build`

---

## Status

- ✅ Vercel (Production): **Next.js - Fully working**
- ⚠️ Local Docker: **Vite (Outdated) - Needs rebuild**
- ⚠️ Local npm dev: **Unknown - Likely needs `npm run dev`**

---

**Action:** Run `git pull origin main` and `npm run dev` to see the new Next.js app locally
