# TradeHax Web Production Checklist

## Scope
Production checklist for the `web/` module deployed to `tradehax.net` with `/tradehax` as canonical interface route.

## Pre-Deploy
- [ ] `npm ci`
- [ ] `npm run release:check`
- [ ] Verify route behavior locally:
  - [ ] `/`
  - [ ] `/tradehax`
  - [ ] refresh on `/tradehax`
- [ ] Verify health endpoint returns JSON:
  - [ ] `/__health`

## Deploy Config
- [ ] `vercel.json` present
- [ ] SPA fallback route to `/index.html` present
- [ ] Security headers configured
- [ ] Static assets cache policy configured
- [ ] Health endpoint no-store cache policy configured

## Post-Deploy Validation
- [ ] `https://tradehax.net/` loads launcher page
- [ ] `https://tradehax.net/tradehax` loads terminal UI
- [ ] hard refresh on `/tradehax` works
- [ ] `https://tradehax.net/__health` returns `{"ok":true,...}`
- [ ] no blocking console errors in browser

## Domain Strategy
- [ ] Keep `tradehax.net` canonical
- [ ] Keep `tradehaxai.tech` as forward/secondary until split is justified by KPIs

## Rollback
- [ ] Keep previous deployment alias
- [ ] If critical regression: rollback to previous stable deployment immediately

