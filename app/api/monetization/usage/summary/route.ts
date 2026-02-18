import { getUserSnapshot } from "@/lib/monetization/engine";
import { resolveRequestUserId } from "@/lib/monetization/identity";
import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "monetization:usage:summary",
    max: 80,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const requestedUserId = request.nextUrl.searchParams.get("userId");
  const userId = await resolveRequestUserId(request, requestedUserId);

  return NextResponse.json(
    {
      ok: true,
      snapshot: getUserSnapshot(userId),
    },
    { headers: rateLimit.headers },
  );
}
