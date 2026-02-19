import { getIntelligenceOverview } from "@/lib/intelligence/mock-data";
import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "intelligence:overview",
    max: 120,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  return NextResponse.json(
    {
      ok: true,
      overview: getIntelligenceOverview(),
    },
    { headers: rateLimit.headers },
  );
}
