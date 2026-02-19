import { parsePositiveNumber, sanitizeQueryText } from "@/lib/intelligence/filters";
import { getCryptoTape } from "@/lib/intelligence/mock-data";
import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "intelligence:crypto",
    max: 120,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const search = request.nextUrl.searchParams;
  const pair = sanitizeQueryText(search.get("pair"), 18).toUpperCase();
  const chain = sanitizeQueryText(search.get("chain"), 12);
  const side = sanitizeQueryText(search.get("side"), 12);
  const minNotional = parsePositiveNumber(search.get("minNotional"));
  const minConfidence = parsePositiveNumber(search.get("minConfidence"));

  const items = getCryptoTape()
    .filter((trade) => {
      if (pair && trade.pair !== pair) return false;
      if (chain && trade.chain !== chain) return false;
      if (side && trade.side !== side) return false;
      if (minNotional !== null && trade.notionalUsd < minNotional) return false;
      if (minConfidence !== null && trade.confidence < minConfidence) return false;
      return true;
    })
    .sort((a, b) => Date.parse(b.triggeredAt) - Date.parse(a.triggeredAt));

  return NextResponse.json(
    {
      ok: true,
      items,
      count: items.length,
      generatedAt: new Date().toISOString(),
    },
    { headers: rateLimit.headers },
  );
}
