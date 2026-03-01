import { requireAdminAccess } from "@/lib/admin-access";
import { getHivemindReadiness, getHivemindSourceSnapshot } from "@/lib/ai/hivemind-core";
import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

function parseBoolean(value: string | null, fallback = false) {
  if (value === null) return fallback;
  return value === "1" || value === "true" || value === "yes";
}

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "ai:admin:hivemind",
    max: 30,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const adminGate = requireAdminAccess(request, rateLimit.headers);
  if (adminGate.response) {
    return adminGate.response;
  }

  const includeSources = parseBoolean(request.nextUrl.searchParams.get("includeSources"), true);

  const readiness = await getHivemindReadiness();
  const sourceSnapshot = includeSources ? await getHivemindSourceSnapshot() : null;

  return NextResponse.json(
    {
      ok: true,
      adminMode: adminGate.access.mode,
      readiness,
      sourceSnapshot,
    },
    {
      headers: {
        ...rateLimit.headers,
        "X-TradeHax-Admin-Mode": adminGate.access.mode || "unknown",
      },
    },
  );
}
