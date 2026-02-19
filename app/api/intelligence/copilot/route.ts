import { getLLMClient } from "@/lib/ai/hf-server";
import { buildTradeHaxPrompt } from "@/lib/ai/custom-llm/system-prompt";
import { getIntelligenceSnapshot } from "@/lib/intelligence/provider";
import {
  enforceRateLimit,
  enforceTrustedOrigin,
  isJsonContentType,
  sanitizePlainText,
} from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

type CopilotRequest = {
  question?: string;
  context?: string;
  lane?: string;
  openMode?: boolean;
};

async function buildFallbackAnalysis(question: string, context: string) {
  const snapshot = await getIntelligenceSnapshot();
  const overview = snapshot.overview;
  return [
    "TradeHax Copilot fallback analysis (HF not configured):",
    `Question: ${question}`,
    context ? `Context: ${context}` : "Context: none provided",
    `Options premium tracked: $${overview.optionsPremium24hUsd.toLocaleString()}`,
    `Dark pool notional tracked: $${overview.darkPoolNotional24hUsd.toLocaleString()}`,
    `Crypto notional tracked: $${overview.cryptoNotional24hUsd.toLocaleString()}`,
    `Data source: ${snapshot.status.vendor} (${snapshot.status.source})`,
    "Action: prioritize highest unusual score entries and cross-check with high-impact news before execution.",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  if (!isJsonContentType(request)) {
    return NextResponse.json({ ok: false, error: "Expected JSON body." }, { status: 415 });
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "intelligence:copilot",
    max: 40,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  try {
    const body = (await request.json()) as CopilotRequest;
    const question = sanitizePlainText(String(body.question ?? ""), 1_500);
    const context = sanitizePlainText(String(body.context ?? ""), 2_000);
    const lane = sanitizePlainText(String(body.lane ?? "intelligence"), 64);
    const openMode = typeof body.openMode === "boolean" ? body.openMode : undefined;

    if (!question) {
      return NextResponse.json(
        { ok: false, error: "question is required" },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const prompt = buildTradeHaxPrompt({
      message: question,
      context,
      lane,
      openMode,
    });

    try {
      const client = getLLMClient();
      const generated = await client.generate(prompt);
      if (generated.text.trim().length > 0) {
        return NextResponse.json(
          {
            ok: true,
            response: generated.text.trim(),
            model: generated.model,
            lane,
          },
          { headers: rateLimit.headers },
        );
      }
    } catch (error) {
      console.warn("Copilot HF generation failed, returning fallback response.", error);
    }

    return NextResponse.json(
      {
        ok: true,
        response: await buildFallbackAnalysis(question, context),
        model: "fallback",
        lane,
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Intelligence copilot error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Copilot processing failed.",
      },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
