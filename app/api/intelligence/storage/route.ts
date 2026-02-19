import { getWatchlistStorageStatus } from "@/lib/intelligence/watchlist-store";
import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "intelligence:storage",
    max: 60,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  return NextResponse.json(
    {
      ok: true,
      storage: await getWatchlistStorageStatus(),
    },
    { headers: rateLimit.headers },
  );
}
