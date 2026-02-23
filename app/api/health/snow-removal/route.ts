import { enforceRateLimit, enforceTrustedOrigin } from '@/lib/security';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type EnvCheck = {
  key: string;
  required: boolean;
};

const checks: EnvCheck[] = [
  { key: 'NEXT_PUBLIC_EMAILJS_SERVICE_ID', required: true },
  { key: 'NEXT_PUBLIC_EMAILJS_TEMPLATE_ID', required: true },
  { key: 'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY', required: true },
  { key: 'RESEND_API_KEY', required: false },
  { key: 'SNOW_REMOVAL_FROM_EMAIL', required: false },
  { key: 'SNOW_REMOVAL_TO_EMAIL', required: false },
];

function isPlaceholder(value: string) {
  const normalized = value.toLowerCase();
  return (
    !normalized ||
    normalized.includes('your_') ||
    normalized.includes('replace_') ||
    normalized.endsWith('_id') ||
    normalized.endsWith('_key')
  );
}

function isConfigured(key: string) {
  const value = String(process.env[key] || '').trim();
  return value.length > 0 && !isPlaceholder(value);
}

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: 'snow-removal:health',
    max: 120,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const requiredKeys = checks.filter((item) => item.required).map((item) => item.key);
  const optionalKeys = checks.filter((item) => !item.required).map((item) => item.key);

  const missingRequired = requiredKeys.filter((key) => !isConfigured(key));
  const missingOptional = optionalKeys.filter((key) => !isConfigured(key));

  return NextResponse.json(
    {
      ok: true,
      ready: missingRequired.length === 0,
      timestamp: new Date().toISOString(),
      checks: {
        required: {
          total: requiredKeys.length,
          configured: requiredKeys.length - missingRequired.length,
          missing: missingRequired,
        },
        optional: {
          total: optionalKeys.length,
          configured: optionalKeys.length - missingOptional.length,
          missing: missingOptional,
        },
      },
      note: 'Values are intentionally not returned. Only readiness metadata is exposed.',
    },
    { headers: rateLimit.headers },
  );
}
