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
    keyPrefix: "intelligence:flow",
    max: 120,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const search = request.nextUrl.searchParams;
  const symbol = sanitizeQueryText(search.get("symbol"), 12).toUpperCase();
  const side = sanitizeQueryText(search.get("side"), 8);
  const minPremium = parsePositiveNumber(search.get("minPremium"));
  const minScore = parsePositiveNumber(search.get("minScore"));
  const sort = sanitizeQueryText(search.get("sort"), 16) || "recent";
  const snapshot = await getIntelligenceSnapshot();

  let items = snapshot.flowTape.filter((trade) => {
    if (symbol && trade.symbol !== symbol) return false;
    if (side && trade.side !== side) return false;
    if (minPremium !== null && trade.premiumUsd < minPremium) return false;
    if (minScore !== null && trade.unusualScore < minScore) return false;
    return true;
  });

  if (sort === "premium") {
    items = [...items].sort((a, b) => b.premiumUsd - a.premiumUsd);
  } else if (sort === "score") {
    items = [...items].sort((a, b) => b.unusualScore - a.unusualScore);
  } else {
    items = [...items].sort(
      (a, b) => Date.parse(b.openedAt) - Date.parse(a.openedAt),
    );
  }

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
