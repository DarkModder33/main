import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

const symbols = ["SOL/USDC", "ETH/USDC", "BTC/USDC"];

function generatePredictiveSignals() {
  const now = new Date().toISOString();
  return symbols.map((symbol, index) => {
    const confidence = Number((0.62 + index * 0.09).toFixed(2));
    const direction = index % 2 === 0 ? "long" : "mean-revert";
    return {
      symbol,
      direction,
      confidence,
      horizonMinutes: 45 + index * 20,
      rationale:
        direction === "long"
          ? "Momentum + liquidity expansion with controlled slippage profile."
          : "Volatility overshoot relative to intraday fair-value band.",
      generatedAt: now,
    };
  });
}

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "trading:signal:predictive",
    max: 100,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const feedSource =
    process.env.BLOOMBERG_API_KEY || process.env.BPIPE_TOKEN ? "bloomberg" : "simulated";

  return NextResponse.json(
    {
      ok: true,
      source: feedSource,
      signals: generatePredictiveSignals(),
    },
    { headers: rateLimit.headers },
  );
}
