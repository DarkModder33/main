import type { VercelRequest, VercelResponse } from '@vercel/node';

const REQUIRED_KEYS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'HUGGINGFACE_API_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'NEXTAUTH_SECRET',
  'JWT_SECRET',
  'TRADEHAX_ADMIN_KEY',
  'TRADEHAX_SUPERUSER_CODE',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const results: Record<string, string> = {};
  for (const key of REQUIRED_KEYS) {
    results[key] = process.env[key] ? 'OK' : 'MISSING';
  }

  // Optionally, add external service checks here (e.g., ping Stripe, Supabase)

  res.status(200).json({
    status: 'ok',
    env: results,
    timestamp: new Date().toISOString(),
  });
}

