import { getMonetizationMetrics } from "@/lib/monetization/store";
import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

function hasAdminAccess(request: NextRequest) {
  const configuredKey = process.env.TRADEHAX_ADMIN_KEY?.trim();
  if (!configuredKey) {
    return process.env.NODE_ENV !== "production";
  }
  const provided = request.headers.get("x-tradehax-admin-key")?.trim();
  return Boolean(provided && provided === configuredKey);
}

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "monetization:admin:metrics",
    max: 30,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  if (!hasAdminAccess(request)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 403, headers: rateLimit.headers },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      metrics: getMonetizationMetrics(),
    },
    { headers: rateLimit.headers },
  );
}
