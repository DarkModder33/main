import { parsePositiveNumber, sanitizeQueryText } from "@/lib/intelligence/filters";
import { getIntelligenceSnapshot } from "@/lib/intelligence/provider";
import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "intelligence:darkpool",
    max: 120,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const search = request.nextUrl.searchParams;
  const symbol = sanitizeQueryText(search.get("symbol"), 12).toUpperCase();
  const side = sanitizeQueryText(search.get("side"), 8);
  const minNotional = parsePositiveNumber(search.get("minNotional"));
  const minScore = parsePositiveNumber(search.get("minScore"));
  const snapshot = await getIntelligenceSnapshot();

  const items = snapshot.darkPoolTape
    .filter((trade) => {
      if (symbol && trade.symbol !== symbol) return false;
      if (side && trade.sideEstimate !== side) return false;
      if (minNotional !== null && trade.notionalUsd < minNotional) return false;
      if (minScore !== null && trade.unusualScore < minScore) return false;
      return true;
    })
    .sort((a, b) => Date.parse(b.executedAt) - Date.parse(a.executedAt));

  return NextResponse.json(
    {
      ok: true,
      items,
      count: items.length,
      generatedAt: new Date().toISOString(),
      provider: snapshot.status,
    },
    { headers: rateLimit.headers },
  );
}
