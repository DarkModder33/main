import { sanitizeQueryText } from "@/lib/intelligence/filters";
import { getIntelligenceNews } from "@/lib/intelligence/mock-data";
import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "intelligence:news",
    max: 120,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const search = request.nextUrl.searchParams;
  const symbol = sanitizeQueryText(search.get("symbol"), 12).toUpperCase();
  const impact = sanitizeQueryText(search.get("impact"), 8);
  const category = sanitizeQueryText(search.get("category"), 12);
  const q = sanitizeQueryText(search.get("q"), 64);

  const items = getIntelligenceNews()
    .filter((item) => {
      if (symbol && item.symbol !== symbol) return false;
      if (impact && item.impact !== impact) return false;
      if (category && item.category !== category) return false;
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.summary.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

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
