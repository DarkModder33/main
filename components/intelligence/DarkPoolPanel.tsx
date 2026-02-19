"use client";

import { CopilotPanel } from "@/components/intelligence/CopilotPanel";
import { useIntelligenceFeed } from "@/components/intelligence/useIntelligenceFeed";
import { formatDateTime, formatUsd } from "@/lib/intelligence/format";
import { DarkPoolTrade } from "@/lib/intelligence/types";
import { useMemo, useState } from "react";

export function DarkPoolPanel() {
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState("");
  const [minNotional, setMinNotional] = useState("");
  const [minScore, setMinScore] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (symbol.trim()) params.set("symbol", symbol.trim().toUpperCase());
    if (side) params.set("side", side);
    if (minNotional) params.set("minNotional", minNotional);
    if (minScore) params.set("minScore", minScore);
    return params.toString();
  }, [symbol, side, minNotional, minScore]);

  const { items, count, generatedAt, loading, error, reload } = useIntelligenceFeed<DarkPoolTrade>(
    "/api/intelligence/dark-pool",
    query,
  );

  const context = useMemo(() => JSON.stringify(items.slice(0, 6)), [items]);

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <section className="theme-panel p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Symbol
            <input
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              placeholder="MSFT"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Side Estimate
            <select
              value={side}
              onChange={(event) => setSide(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="">Any</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Min Notional
            <input
              value={minNotional}
              onChange={(event) => setMinNotional(event.target.value)}
              placeholder="10000000"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Min Score
            <input
              value={minScore}
              onChange={(event) => setMinScore(event.target.value)}
              placeholder="70"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={reload} className="theme-cta theme-cta--loud">
            Refresh Feed
          </button>
          <p className="text-xs text-[#8ea8be]">
            {loading ? "Loading..." : `${count} rows`} {generatedAt ? `• ${formatDateTime(generatedAt)}` : ""}
          </p>
        </div>

        {error ? (
          <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">
            {error}
          </p>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[#8ea8be] border-b border-white/10">
                <th className="py-2 pr-4">Symbol</th>
                <th className="py-2 pr-4">Notional</th>
                <th className="py-2 pr-4">Size</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Side</th>
                <th className="py-2 pr-4">Venue</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2 pr-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {items.map((trade) => (
                <tr key={trade.id} className="border-b border-white/5 text-white">
                  <td className="py-2 pr-4 font-semibold">{trade.symbol}</td>
                  <td className="py-2 pr-4">{formatUsd(trade.notionalUsd)}</td>
                  <td className="py-2 pr-4">{trade.size.toLocaleString()}</td>
                  <td className="py-2 pr-4">{trade.price}</td>
                  <td className="py-2 pr-4">{trade.sideEstimate}</td>
                  <td className="py-2 pr-4">{trade.venue}</td>
                  <td className="py-2 pr-4">{trade.unusualScore}</td>
                  <td className="py-2 pr-4">{formatDateTime(trade.executedAt)}</td>
                </tr>
              ))}
              {items.length === 0 && !loading ? (
                <tr>
                  <td colSpan={8} className="py-4 text-[#8ea8be]">
                    No matching dark pool records. Relax filters and retry.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <CopilotPanel
        lane="dark-pool-intel"
        defaultPrompt="Interpret this dark pool activity and identify whether it supports continuation or mean reversion."
        contextBuilder={() => context}
      />
    </div>
  );
}
