import { sanitizeQueryText } from "@/lib/intelligence/filters";
import { getIntelligenceSnapshot } from "@/lib/intelligence/provider";
import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "intelligence:politics",
    max: 120,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const search = request.nextUrl.searchParams;
  const symbol = sanitizeQueryText(search.get("symbol"), 12).toUpperCase();
  const chamber = sanitizeQueryText(search.get("chamber"), 8);
  const action = sanitizeQueryText(search.get("action"), 8);
  const theme = sanitizeQueryText(search.get("theme"), 24);
  const snapshot = await getIntelligenceSnapshot();

  const items = snapshot.politicsTape
    .filter((trade) => {
      if (symbol && trade.symbol !== symbol) return false;
      if (chamber && trade.chamber !== chamber) return false;
      if (action && trade.action !== action) return false;
      if (theme && !trade.theme.toLowerCase().includes(theme)) return false;
      return true;
    })
    .sort((a, b) => Date.parse(b.disclosedAt) - Date.parse(a.disclosedAt));

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
