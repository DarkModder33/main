# TradeHax Hard Launch Runbook

This runbook covers the production launch path for monetization and deployment.

## 1) Pre-Launch Environment Setup

Set these variables in Vercel (Production environment):

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET` (32+ chars)
- `TRADEHAX_STRIPE_CHECKOUT_URL` and/or tier-specific variants
- `TRADEHAX_COINBASE_CHECKOUT_URL` and/or tier-specific variants
- `TRADEHAX_WEBHOOK_SECRET`
- `TRADEHAX_ADMIN_KEY`
- `TRADEHAX_ALLOW_PAYMENT_SIMULATION=false`

Optional provider-specific overrides:

- `TRADEHAX_STRIPE_CHECKOUT_URL_BASIC`
- `TRADEHAX_STRIPE_CHECKOUT_URL_PRO`
- `TRADEHAX_STRIPE_CHECKOUT_URL_ELITE`
- `TRADEHAX_COINBASE_CHECKOUT_URL_BASIC`
- `TRADEHAX_COINBASE_CHECKOUT_URL_PRO`
- `TRADEHAX_COINBASE_CHECKOUT_URL_ELITE`

## 2) Billing and Entitlement Surfaces

- Customer billing page: `/billing`
- Pricing page (launch tiers): `/pricing`
- Monetization admin metrics page: `/admin/monetization`
- Stripe webhook endpoint: `/api/monetization/webhooks/stripe`

## 3) Launch Validation Checklist

1. Open `/billing`, verify plans render and subscription snapshot loads.
2. Verify checkout POST `/api/monetization/checkout` returns configured URL in production.
3. Trigger webhook test payload against `/api/monetization/webhooks/stripe`.
4. Verify AI endpoint usage gating:
   - `/api/ai/chat` returns usage metadata.
   - Daily limits block with `USAGE_LIMIT_REACHED`.
5. Verify admin metrics endpoint:
   - `/api/monetization/admin/metrics` responds with valid `x-tradehax-admin-key`.

## 4) Deployment Contract

- CI pipeline command: `npm run pipeline:ci`
- Production branch: `main`
- Host: `tradehax.net` (primary domain)

## 5) Rollback

1. Re-deploy previous successful Vercel production build.
2. If needed, revert commit on `main` and push.
3. Re-run webhook tests and `/billing` checks after rollback.
