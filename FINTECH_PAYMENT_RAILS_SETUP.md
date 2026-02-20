# TradeHax Fintech Payment Rails Setup

This project supports a multi-rail checkout API through `POST /api/monetization/checkout`.

## Supported providers

- `stripe`
- `coinbase`
- `paypal`
- `square`
- `venmo`
- `cashapp`
- `ebay`
- `crypto`

## Environment variable pattern

The checkout API resolves URLs in this order:

1. `TRADEHAX_<PROVIDER>_CHECKOUT_URL_<TIER>_<CYCLE>`
2. `TRADEHAX_<PROVIDER>_CHECKOUT_URL_<TIER>`
3. `TRADEHAX_<PROVIDER>_CHECKOUT_URL`

Where:

- `<PROVIDER>` = `STRIPE`, `COINBASE`, `PAYPAL`, `SQUARE`, `VENMO`, `CASHAPP`, `EBAY`, `CRYPTO`
- `<TIER>` = `BASIC`, `PRO`, `ELITE`
- `<CYCLE>` = `MONTHLY`, `YEARLY`

## Copy/paste template

```env
# Stripe
TRADEHAX_STRIPE_CHECKOUT_URL_BASIC_MONTHLY=https://example.com/stripe/basic-monthly
TRADEHAX_STRIPE_CHECKOUT_URL_PRO_MONTHLY=https://example.com/stripe/pro-monthly
TRADEHAX_STRIPE_CHECKOUT_URL_ELITE_MONTHLY=https://example.com/stripe/elite-monthly
TRADEHAX_STRIPE_CHECKOUT_URL_BASIC_YEARLY=https://example.com/stripe/basic-yearly
TRADEHAX_STRIPE_CHECKOUT_URL_PRO_YEARLY=https://example.com/stripe/pro-yearly
TRADEHAX_STRIPE_CHECKOUT_URL_ELITE_YEARLY=https://example.com/stripe/elite-yearly

# Coinbase
TRADEHAX_COINBASE_CHECKOUT_URL_BASIC_MONTHLY=https://example.com/coinbase/basic-monthly
TRADEHAX_COINBASE_CHECKOUT_URL_PRO_MONTHLY=https://example.com/coinbase/pro-monthly
TRADEHAX_COINBASE_CHECKOUT_URL_ELITE_MONTHLY=https://example.com/coinbase/elite-monthly
TRADEHAX_COINBASE_CHECKOUT_URL_BASIC_YEARLY=https://example.com/coinbase/basic-yearly
TRADEHAX_COINBASE_CHECKOUT_URL_PRO_YEARLY=https://example.com/coinbase/pro-yearly
TRADEHAX_COINBASE_CHECKOUT_URL_ELITE_YEARLY=https://example.com/coinbase/elite-yearly

# PayPal
TRADEHAX_PAYPAL_CHECKOUT_URL_BASIC_MONTHLY=https://example.com/paypal/basic-monthly
TRADEHAX_PAYPAL_CHECKOUT_URL_PRO_MONTHLY=https://example.com/paypal/pro-monthly
TRADEHAX_PAYPAL_CHECKOUT_URL_ELITE_MONTHLY=https://example.com/paypal/elite-monthly
TRADEHAX_PAYPAL_CHECKOUT_URL_BASIC_YEARLY=https://example.com/paypal/basic-yearly
TRADEHAX_PAYPAL_CHECKOUT_URL_PRO_YEARLY=https://example.com/paypal/pro-yearly
TRADEHAX_PAYPAL_CHECKOUT_URL_ELITE_YEARLY=https://example.com/paypal/elite-yearly

# Square
TRADEHAX_SQUARE_CHECKOUT_URL_BASIC_MONTHLY=https://example.com/square/basic-monthly
TRADEHAX_SQUARE_CHECKOUT_URL_PRO_MONTHLY=https://example.com/square/pro-monthly
TRADEHAX_SQUARE_CHECKOUT_URL_ELITE_MONTHLY=https://example.com/square/elite-monthly
TRADEHAX_SQUARE_CHECKOUT_URL_BASIC_YEARLY=https://example.com/square/basic-yearly
TRADEHAX_SQUARE_CHECKOUT_URL_PRO_YEARLY=https://example.com/square/pro-yearly
TRADEHAX_SQUARE_CHECKOUT_URL_ELITE_YEARLY=https://example.com/square/elite-yearly

# Venmo
TRADEHAX_VENMO_CHECKOUT_URL_BASIC_MONTHLY=https://example.com/venmo/basic-monthly
TRADEHAX_VENMO_CHECKOUT_URL_PRO_MONTHLY=https://example.com/venmo/pro-monthly
TRADEHAX_VENMO_CHECKOUT_URL_ELITE_MONTHLY=https://example.com/venmo/elite-monthly
TRADEHAX_VENMO_CHECKOUT_URL_BASIC_YEARLY=https://example.com/venmo/basic-yearly
TRADEHAX_VENMO_CHECKOUT_URL_PRO_YEARLY=https://example.com/venmo/pro-yearly
TRADEHAX_VENMO_CHECKOUT_URL_ELITE_YEARLY=https://example.com/venmo/elite-yearly

# Cash App
TRADEHAX_CASHAPP_CHECKOUT_URL_BASIC_MONTHLY=https://example.com/cashapp/basic-monthly
TRADEHAX_CASHAPP_CHECKOUT_URL_PRO_MONTHLY=https://example.com/cashapp/pro-monthly
TRADEHAX_CASHAPP_CHECKOUT_URL_ELITE_MONTHLY=https://example.com/cashapp/elite-monthly
TRADEHAX_CASHAPP_CHECKOUT_URL_BASIC_YEARLY=https://example.com/cashapp/basic-yearly
TRADEHAX_CASHAPP_CHECKOUT_URL_PRO_YEARLY=https://example.com/cashapp/pro-yearly
TRADEHAX_CASHAPP_CHECKOUT_URL_ELITE_YEARLY=https://example.com/cashapp/elite-yearly

# eBay
TRADEHAX_EBAY_CHECKOUT_URL_BASIC_MONTHLY=https://example.com/ebay/basic-monthly
TRADEHAX_EBAY_CHECKOUT_URL_PRO_MONTHLY=https://example.com/ebay/pro-monthly
TRADEHAX_EBAY_CHECKOUT_URL_ELITE_MONTHLY=https://example.com/ebay/elite-monthly
TRADEHAX_EBAY_CHECKOUT_URL_BASIC_YEARLY=https://example.com/ebay/basic-yearly
TRADEHAX_EBAY_CHECKOUT_URL_PRO_YEARLY=https://example.com/ebay/pro-yearly
TRADEHAX_EBAY_CHECKOUT_URL_ELITE_YEARLY=https://example.com/ebay/elite-yearly

# Generic crypto checkout links
TRADEHAX_CRYPTO_CHECKOUT_URL_BASIC_MONTHLY=https://example.com/crypto/basic-monthly
TRADEHAX_CRYPTO_CHECKOUT_URL_PRO_MONTHLY=https://example.com/crypto/pro-monthly
TRADEHAX_CRYPTO_CHECKOUT_URL_ELITE_MONTHLY=https://example.com/crypto/elite-monthly
TRADEHAX_CRYPTO_CHECKOUT_URL_BASIC_YEARLY=https://example.com/crypto/basic-yearly
TRADEHAX_CRYPTO_CHECKOUT_URL_PRO_YEARLY=https://example.com/crypto/pro-yearly
TRADEHAX_CRYPTO_CHECKOUT_URL_ELITE_YEARLY=https://example.com/crypto/elite-yearly

# Production recommendation
TRADEHAX_ALLOW_PAYMENT_SIMULATION=false
```

## Operational recommendation

- Use provider-hosted checkout links first (faster go-live).
- Move to direct API-driven sessions (Stripe/Square/PayPal APIs) as phase 2.
- Keep free tier as `provider=none` (no checkout required).
