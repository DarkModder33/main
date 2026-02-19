import { getLLMClient } from "@/lib/ai/hf-server";
import { sanitizeQueryText } from "@/lib/intelligence/filters";
import { getIntelligenceSnapshot } from "@/lib/intelligence/provider";
import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

function buildFallbackBrief(focus: string) {
  const snapshot = getIntelligenceSnapshot();
  const overview = snapshot.overview;
  const topFlow = snapshot.flowTape
    .slice()
    .sort((a, b) => b.unusualScore - a.unusualScore)[0];
  const topCrypto = snapshot.cryptoTape
    .slice()
    .sort((a, b) => b.notionalUsd - a.notionalUsd)[0];
  const topNews = snapshot.news[0];

  return {
    focus,
    generatedAt: new Date().toISOString(),
    youtube: {
      title: `TradeHax Intelligence Brief: ${topFlow.symbol} flow and ${topCrypto.pair} momentum`,
      hook: `Institutional flow is concentrated in ${topFlow.symbol} with unusual score ${topFlow.unusualScore}.`,
      script: [
        `Opening: Today's options premium tracked is $${overview.optionsPremium24hUsd.toLocaleString()}.`,
        `Core setup: ${topFlow.symbol} ${topFlow.side.toUpperCase()} activity leads the board.`,
        `Crypto crossover: ${topCrypto.pair} on ${topCrypto.chain} shows ${Math.round(
          topCrypto.confidence * 100,
        )}% confidence.`,
        `News catalyst: ${topNews.title}`,
        "CTA: Join Discord for live tape reactions and watchlist updates.",
      ],
      cta: "Subscribe for daily flow briefings and join the TradeHax Discord.",
    },
    discord: {
      headline: `Flow Alert: ${topFlow.symbol} + ${topCrypto.pair}`,
      summary:
        `Options premium: $${overview.optionsPremium24hUsd.toLocaleString()} | Dark pool: $${overview.darkPoolNotional24hUsd.toLocaleString()} | Crypto: $${overview.cryptoNotional24hUsd.toLocaleString()}`,
      blocks: [
        `${topFlow.symbol} ${topFlow.side.toUpperCase()} sweep ${topFlow.unusualScore} score`,
        `${topCrypto.pair} ${topCrypto.side} confidence ${Math.round(topCrypto.confidence * 100)}%`,
        `News catalyst: ${topNews.title}`,
      ],
      action: "Pin this brief and open discussion thread for risk-managed trade plans.",
    },
  };
}

function buildPrompt(focus: string) {
  const snapshot = getIntelligenceSnapshot();
  const overview = snapshot.overview;
  const flow = snapshot.flowTape.slice(0, 3);
  const crypto = snapshot.cryptoTape.slice(0, 3);
  const news = snapshot.news.slice(0, 3);

  return [
    "You are a concise financial content strategist for TradeHax Intelligence.",
    "Return strict JSON with fields: youtube{title,hook,script(array),cta}, discord{headline,summary,blocks(array),action}.",
    "Keep language direct and operator-grade. Avoid hype and guaranteed outcomes.",
    `Focus: ${focus}`,
    `Overview: ${JSON.stringify(overview)}`,
    `Top flow: ${JSON.stringify(flow)}`,
    `Top crypto: ${JSON.stringify(crypto)}`,
    `Top news: ${JSON.stringify(news)}`,
    `Provider: ${JSON.stringify(snapshot.status)}`,
  ].join("\n\n");
}

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "intelligence:daily-brief",
    max: 30,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const focus = sanitizeQueryText(request.nextUrl.searchParams.get("focus"), 32) || "cross-asset";

  const fallback = buildFallbackBrief(focus);

  try {
    const client = getLLMClient();
    const generated = await client.generate(buildPrompt(focus));
    const content = generated.text.trim();
    if (!content) {
      return NextResponse.json(
        {
          ok: true,
          brief: fallback,
          model: "fallback",
        },
        { headers: rateLimit.headers },
      );
    }

    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      return NextResponse.json(
        {
          ok: true,
          brief: {
            focus,
            generatedAt: new Date().toISOString(),
            ...parsed,
          },
          model: generated.model,
        },
        { headers: rateLimit.headers },
      );
    } catch {
      return NextResponse.json(
        {
          ok: true,
          brief: fallback,
          model: "fallback",
        },
        { headers: rateLimit.headers },
      );
    }
  } catch (error) {
    console.warn("Daily brief HF generation failed, returning fallback brief.", error);
    return NextResponse.json(
      {
        ok: true,
        brief: fallback,
        model: "fallback",
      },
      { headers: rateLimit.headers },
    );
  }
}
