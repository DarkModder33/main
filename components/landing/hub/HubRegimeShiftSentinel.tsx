"use client";

import { Gauge, Siren, TrendingDown } from "lucide-react";
import { useMemo, useState } from "react";

type RiskStance = "guarded" | "balanced" | "aggressive";
type MarketRegime = "BULLISH" | "BEARISH" | "MIXED";

type HubRegimeShiftSentinelProps = {
  focusSymbol: string;
  riskStance: RiskStance;
  marketRegime: MarketRegime;
  onInjectBrief: (brief: string) => void;
  onStoreBrief: (brief: string) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function HubRegimeShiftSentinel({
  focusSymbol,
  riskStance,
  marketRegime,
  onInjectBrief,
  onStoreBrief,
}: HubRegimeShiftSentinelProps) {
  const [rollingWinRate, setRollingWinRate] = useState("46");
  const [avgRMultiple, setAvgRMultiple] = useState("0.7");
  const [drawdownPct, setDrawdownPct] = useState("6.5");
  const [volatilityShockPct, setVolatilityShockPct] = useState("18");
  const [setupConfidence, setSetupConfidence] = useState("62");

  const analysis = useMemo(() => {
    const winRate = Number(rollingWinRate || "0");
    const avgR = Number(avgRMultiple || "0");
    const drawdown = Number(drawdownPct || "0");
    const volShock = Number(volatilityShockPct || "0");
    const confidence = Number(setupConfidence || "0");

    const mismatchRaw =
      (50 - winRate) * 0.9 +
      (avgR < 1 ? (1 - avgR) * 25 : 0) +
      drawdown * 2.4 +
      volShock * 1.6 +
      (riskStance === "aggressive" ? 8 : 0) -
      confidence * 0.18;

    const mismatchIndex = clamp(Math.round(mismatchRaw), 0, 100);

    const status = mismatchIndex >= 70 ? "SHIFT_DETECTED" : mismatchIndex >= 45 ? "SHIFT_WARNING" : "REGIME_STABLE";

    const protocol =
      status === "SHIFT_DETECTED"
        ? [
            "Freeze non-A+ setups for the next session.",
            "Cut risk-per-trade by 40% until 3 green executions.",
            "Switch to defensive templates aligned with current regime.",
          ]
        : status === "SHIFT_WARNING"
          ? [
              "Reduce size by 20% and require two-signal confirmation.",
              "Increase invalidation strictness and shorten holding time.",
              "Track slippage/latency and reassess after 5 trades.",
            ]
          : [
              "Maintain current playbook with unchanged risk budget.",
              "Continue logging regime behavior drift indicators.",
              "Re-run sentinel after each 3-trade block.",
            ];

    return {
      winRate,
      avgR,
      drawdown,
      volShock,
      confidence,
      mismatchIndex,
      status,
      protocol,
    };
  }, [rollingWinRate, avgRMultiple, drawdownPct, volatilityShockPct, setupConfidence, riskStance]);

  const buildBrief = () => {
    const lines = [
      "REGIME_SHIFT_SENTINEL_BRIEF",
      `SYMBOL: ${focusSymbol || "N/A"}`,
      `MARKET_REGIME: ${marketRegime}`,
      `RISK_STANCE: ${riskStance.toUpperCase()}`,
      `ROLLING_WIN_RATE_PCT: ${analysis.winRate.toFixed(1)}%`,
      `AVERAGE_R_MULTIPLE: ${analysis.avgR.toFixed(2)}`,
      `DRAWDOWN_PCT: ${analysis.drawdown.toFixed(2)}%`,
      `VOLATILITY_SHOCK_PCT: ${analysis.volShock.toFixed(2)}%`,
      `SETUP_CONFIDENCE_0_TO_100: ${analysis.confidence.toFixed(0)}`,
      `MISMATCH_INDEX_0_TO_100: ${analysis.mismatchIndex}`,
      `STATUS: ${analysis.status}`,
      "TEMP_RULESET_OVERRIDE:",
      ...analysis.protocol.map((line, idx) => `${idx + 1}. ${line}`),
      "UNMET_DEMAND_COVERAGE: Adaptive regime-drift detection + temporary ruleset override + risk auto-throttle.",
    ];

    return lines.join("\n");
  };

  return (
    <div className="rounded-xl border border-violet-400/20 bg-[rgba(14,10,22,0.82)] px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-violet-200">Regime Shift Sentinel</p>
        <span className="rounded-full border border-white/15 bg-black/40 px-2 py-0.5 text-[9px] uppercase text-zinc-300">
          Mismatch {analysis.mismatchIndex}
        </span>
      </div>

      <p className="mb-2 text-[10px] text-zinc-400">
        Detect when your current playbook no longer fits live conditions and auto-propose a temporary ruleset override.
      </p>

      <div className="grid gap-2 md:grid-cols-2">
        <input
          value={rollingWinRate}
          onChange={(event) => setRollingWinRate(event.target.value.replace(/[^\d.]/g, "").slice(0, 6))}
          className="rounded-md border border-white/15 bg-black/50 px-2 py-1 text-[11px] text-white outline-none focus:border-violet-300/60"
          placeholder="Rolling win rate %"
        />
        <input
          value={avgRMultiple}
          onChange={(event) => setAvgRMultiple(event.target.value.replace(/[^\d.-]/g, "").slice(0, 6))}
          className="rounded-md border border-white/15 bg-black/50 px-2 py-1 text-[11px] text-white outline-none focus:border-violet-300/60"
          placeholder="Average R multiple"
        />
        <input
          value={drawdownPct}
          onChange={(event) => setDrawdownPct(event.target.value.replace(/[^\d.]/g, "").slice(0, 6))}
          className="rounded-md border border-white/15 bg-black/50 px-2 py-1 text-[11px] text-white outline-none focus:border-violet-300/60"
          placeholder="Drawdown %"
        />
        <input
          value={volatilityShockPct}
          onChange={(event) => setVolatilityShockPct(event.target.value.replace(/[^\d.]/g, "").slice(0, 6))}
          className="rounded-md border border-white/15 bg-black/50 px-2 py-1 text-[11px] text-white outline-none focus:border-violet-300/60"
          placeholder="Volatility shock %"
        />
      </div>

      <div className="mt-2">
        <label className="mb-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-400" htmlFor="regime-confidence-range">
          <span>Setup confidence</span>
          <span>{analysis.confidence.toFixed(0)}%</span>
        </label>
        <input
          id="regime-confidence-range"
          type="range"
          min={0}
          max={100}
          value={analysis.confidence}
          onChange={(event) => setSetupConfidence(event.target.value)}
          className="w-full accent-violet-400"
        />
      </div>

      <div className="mt-2 rounded-lg border border-white/10 bg-black/35 px-2.5 py-2 text-[10px] text-zinc-300">
        <div className="flex items-center gap-2">
          <Gauge className="h-3.5 w-3.5 text-violet-300" />
          <span className="font-mono uppercase text-zinc-400">Status:</span>
          <span className="text-violet-100">{analysis.status}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {analysis.status === "SHIFT_DETECTED" ? (
            <Siren className="h-3.5 w-3.5 text-rose-300" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-amber-300" />
          )}
          <span className="text-zinc-200">Temp ruleset override ready.</span>
        </div>
        <ul className="mt-1 space-y-0.5 text-zinc-200">
          {analysis.protocol.map((step) => (
            <li key={step}>• {step}</li>
          ))}
        </ul>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onInjectBrief(buildBrief())}
          className="rounded-full border border-violet-300/30 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase text-violet-100"
        >
          Insert Sentinel Brief
        </button>
        <button
          type="button"
          onClick={() => onStoreBrief(buildBrief())}
          className="rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase text-cyan-100"
        >
          Save Regime Memory
        </button>
      </div>
    </div>
  );
}
