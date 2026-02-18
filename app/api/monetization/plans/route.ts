import { getAllPlans } from "@/lib/monetization/plans";
import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "monetization:plans",
    max: 120,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  return NextResponse.json(
    {
      ok: true,
      plans: getAllPlans(),
      generatedAt: new Date().toISOString(),
    },
    { headers: rateLimit.headers },
  );
}
