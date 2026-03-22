import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import getRawBody from 'raw-body';

// Stripe secret from env
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

function normalizeOrigin(originHeader: string | string[] | undefined): string {
  if (Array.isArray(originHeader)) return originHeader[0] || '';
  return originHeader || '';
}

function resolveApiKeyHeader(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] || '' : value || '';
  if (!raw) return '';
  if (raw.toLowerCase().startsWith('bearer ')) return raw.slice(7).trim();
  return raw.trim();
}

function createStripeClient(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY || '';
  if (!secret) {
    throw new Error('STRIPE_SECRET_KEY missing');
  }

  return new Stripe(secret, {
    // Keep in sync with installed Stripe SDK compatibility.
    apiVersion: '2026-02-25.clover',
  });
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to get raw body
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Restrict CORS in production; allow known app domains and active Vercel aliases.
  const allowedOrigins = [
    'https://tradehax.net',
    'https://www.tradehax.net',
    'https://tradehaxai.tech',
    'https://www.tradehaxai.tech',
    'https://vallcallya-p4dktjyoj-digitaldynasty.vercel.app',
  ];
  const origin = normalizeOrigin(req.headers.origin);
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-API-Key,Stripe-Signature');

  // OPTIONS must always be fail-safe for webhook preflight checks.
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true, method: 'OPTIONS' });
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const stripeSignature = Array.isArray(req.headers['stripe-signature'])
    ? req.headers['stripe-signature'][0]
    : req.headers['stripe-signature'];

  // In production:
  // - Real Stripe events authenticate by Stripe signature.
  // - Internal/manual events can use admin key instead.
  if (isProd && !stripeSignature) {
    const providedAdminKey = resolveApiKeyHeader(req.headers['x-api-key'] || req.headers.authorization);
    const expectedAdminKey = String(process.env.TRADEHAX_ADMIN_KEY || '').trim();
    if (!providedAdminKey || !expectedAdminKey || providedAdminKey !== expectedAdminKey) {
      return res.status(401).send('Unauthorized');
    }
  }

  let event;
  try {
    const stripe = createStripeClient();

    // Webhook secret is required for signature verification
    if (!STRIPE_WEBHOOK_SECRET) {
      console.warn('[STRIPE] STRIPE_WEBHOOK_SECRET missing; skipping signature verification in development');
      if (isProd) {
        throw new Error('STRIPE_WEBHOOK_SECRET missing in production');
      }
      // Allow unverified events in non-production for easier local testing
      const rawBody = await getRawBody(req);
      event = JSON.parse(rawBody.toString());
    } else {
      if (!stripeSignature) {
        throw new Error('Missing stripe-signature header');
      }
      const rawBody = await getRawBody(req);
      event = stripe.webhooks.constructEvent(rawBody, stripeSignature, STRIPE_WEBHOOK_SECRET);
    }
  } catch (err: any) {
    console.error('Stripe webhook verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Log event for auditing
  const channel = Array.isArray(req.query.channel)
    ? req.query.channel[0]
    : req.query.channel;
  console.log('[Stripe Webhook]', event.type, event.id, {
    channel: channel || null,
    headers: req.headers,
    body: req.body,
    event: event,
  });

  // Handle event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`[STRIPE] Checkout completed for session ${session.id}`);
      // TODO: Implement credit top-up or subscription activation
      break;
    case 'payment_intent.succeeded':
      // Handle successful payment
      break;
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
    // ...add more cases as needed
    default:
      break;
  }

  // Respond quickly
  res.status(200).json({ received: true });
}
