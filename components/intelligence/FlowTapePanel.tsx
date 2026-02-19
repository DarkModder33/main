"use client";

import { CopilotPanel } from "@/components/intelligence/CopilotPanel";
import { useIntelligenceFeed } from "@/components/intelligence/useIntelligenceFeed";
import { formatDateTime, formatUsd } from "@/lib/intelligence/format";
import { FlowTrade } from "@/lib/intelligence/types";
import { useMemo, useState } from "react";

export function FlowTapePanel() {
  const [symbol, setSymbol] = useState("");
  const [side, setSide] = useState("");
  const [minPremium, setMinPremium] = useState("");
  const [minScore, setMinScore] = useState("");
  const [sort, setSort] = useState("recent");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (symbol.trim()) params.set("symbol", symbol.trim().toUpperCase());
    if (side) params.set("side", side);
    if (minPremium) params.set("minPremium", minPremium);
    if (minScore) params.set("minScore", minScore);
    if (sort) params.set("sort", sort);
    return params.toString();
  }, [symbol, side, minPremium, minScore, sort]);

  const { items, count, generatedAt, loading, error, reload } = useIntelligenceFeed<FlowTrade>(
    "/api/intelligence/flow",
    query,
  );

  const context = useMemo(() => JSON.stringify(items.slice(0, 6)), [items]);

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <section className="theme-panel p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Symbol
            <input
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              placeholder="NVDA"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>

          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Side
            <select
              value={side}
              onChange={(event) => setSide(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="">Any</option>
              <option value="call">Call</option>
              <option value="put">Put</option>
            </select>
          </label>

          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Min Premium
            <input
              value={minPremium}
              onChange={(event) => setMinPremium(event.target.value)}
              placeholder="500000"
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

          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Sort
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="recent">Most Recent</option>
              <option value="premium">Highest Premium</option>
              <option value="score">Highest Score</option>
            </select>
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
                <th className="py-2 pr-4">Side</th>
                <th className="py-2 pr-4">Premium</th>
                <th className="py-2 pr-4">Strike</th>
                <th className="py-2 pr-4">Expiry</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2 pr-4">Opened</th>
              </tr>
            </thead>
            <tbody>
              {items.map((trade) => (
                <tr key={trade.id} className="border-b border-white/5 text-white">
                  <td className="py-2 pr-4 font-semibold">{trade.symbol}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        trade.side === "call"
                          ? "bg-emerald-500/20 text-emerald-200"
                          : "bg-rose-500/20 text-rose-200"
                      }`}
                    >
                      {trade.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{formatUsd(trade.premiumUsd)}</td>
                  <td className="py-2 pr-4">
                    {trade.strike} ({trade.spotPrice})
                  </td>
                  <td className="py-2 pr-4">{trade.expiry}</td>
                  <td className="py-2 pr-4">{trade.unusualScore}</td>
                  <td className="py-2 pr-4">{formatDateTime(trade.openedAt)}</td>
                </tr>
              ))}
              {items.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="py-4 text-[#8ea8be]">
                    No matching flow records. Relax filters and retry.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <CopilotPanel
        lane="flow-intel"
        defaultPrompt="Summarize this tape and identify the highest-conviction setup with risk controls."
        contextBuilder={() => context}
      />
    </div>
  );
}
