import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "staking:pool-v2",
    max: 100,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  return NextResponse.json(
    {
      ok: true,
      pool: {
        id: "hax_pool_v2",
        status: "beta_live",
        totalValueLockedUsd: 184250,
        activeStakers: 312,
        baseAprPct: 14.2,
        boostedAprPct: 19.4,
        rewardsToken: "$HAX",
        note:
          "Dynamic allocation and governance-routed reward weights are staged for production activation.",
      },
      generatedAt: new Date().toISOString(),
    },
    { headers: rateLimit.headers },
  );
}
