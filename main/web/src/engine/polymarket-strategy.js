export const SignalAction = {
  BUY: "buy",
  SELL: "sell",
  HOLD: "hold",
  ARB: "arb",
};

export const POLYMARKET_PARAM_BIAS = 0.85; // High confidence bias for PolyClaw LLM analysis

export function generatePolymarketSignal(marketData, llmAnalysis = {}) {
  const {
    yesPrice = 0,
    noPrice = 0,
    volume24h = 0,
    liquidity = 0,
  } = marketData;

  const totalProb = yesPrice + noPrice;
  const isArb = totalProb < 1.00;
  const arbPotential = isArb ? (1.00 - totalProb) : 0;

  let score = 0;
  let action = SignalAction.HOLD;

  // Arb Strategy (PolyClaw core edge)
  if (isArb && arbPotential > 0.02) {
    score += 0.5;
    action = SignalAction.ARB;
  }

  // Sentiment/LLM Bias (OpenClaw brain)
  if (llmAnalysis.sentiment === 'bullish') score += 0.3;
  if (llmAnalysis.sentiment === 'bearish') score -= 0.3;

  // Final Decision Logic
  if (score > 0.25 && action !== SignalAction.ARB) action = SignalAction.BUY;
  if (score < -0.25 && action !== SignalAction.ARB) action = SignalAction.SELL;

  return {
    action,
    score: Number(score.toFixed(2)),
    confidence: Math.round(50 + (score * 50)),
    isArb,
    arbPotential: Number(arbPotential.toFixed(4)),
    reasons: [
      `Combined Probability: ${totalProb.toFixed(3)}`,
      `Arb detected: ${isArb ? 'YES' : 'NO'} (${(arbPotential * 100).toFixed(2)}%)`,
      `LLM Sentiment: ${llmAnalysis.sentiment || 'neutral'}`,
      `Liquidity Strength: ${liquidity > 10000 ? 'High' : 'Low'}`,
    ],
  };
}

