"use client";

import { CopilotPanel } from "@/components/intelligence/CopilotPanel";
import { useIntelligenceFeed } from "@/components/intelligence/useIntelligenceFeed";
import { formatDateTime, formatPct, formatUsd } from "@/lib/intelligence/format";
import { CryptoFlowTrade } from "@/lib/intelligence/types";
import { useMemo, useState } from "react";

export function CryptoFlowPanel() {
  const [pair, setPair] = useState("");
  const [chain, setChain] = useState("");
  const [side, setSide] = useState("");
  const [minNotional, setMinNotional] = useState("");
  const [minConfidence, setMinConfidence] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (pair.trim()) params.set("pair", pair.trim().toUpperCase());
    if (chain) params.set("chain", chain);
    if (side) params.set("side", side);
    if (minNotional) params.set("minNotional", minNotional);
    if (minConfidence) params.set("minConfidence", minConfidence);
    return params.toString();
  }, [pair, chain, side, minNotional, minConfidence]);

  const { items, count, generatedAt, loading, error, reload } = useIntelligenceFeed<CryptoFlowTrade>(
    "/api/intelligence/crypto-flow",
    query,
  );
  const context = useMemo(() => JSON.stringify(items.slice(0, 6)), [items]);

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <section className="theme-panel p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Pair
            <input
              value={pair}
              onChange={(event) => setPair(event.target.value)}
              placeholder="SOL/USDC"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Chain
            <select
              value={chain}
              onChange={(event) => setChain(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="">Any</option>
              <option value="solana">Solana</option>
              <option value="ethereum">Ethereum</option>
              <option value="base">Base</option>
              <option value="arbitrum">Arbitrum</option>
            </select>
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Side
            <select
              value={side}
              onChange={(event) => setSide(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="">Any</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
              <option value="spot_buy">Spot Buy</option>
              <option value="spot_sell">Spot Sell</option>
            </select>
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Min Notional
            <input
              value={minNotional}
              onChange={(event) => setMinNotional(event.target.value)}
              placeholder="200000"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Min Confidence
            <input
              value={minConfidence}
              onChange={(event) => setMinConfidence(event.target.value)}
              placeholder="0.7"
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
                <th className="py-2 pr-4">Pair</th>
                <th className="py-2 pr-4">Chain</th>
                <th className="py-2 pr-4">Side</th>
                <th className="py-2 pr-4">Notional</th>
                <th className="py-2 pr-4">Confidence</th>
                <th className="py-2 pr-4">Exchange</th>
                <th className="py-2 pr-4">Triggered</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-white/5 text-white">
                  <td className="py-2 pr-4 font-semibold">{item.pair}</td>
                  <td className="py-2 pr-4">{item.chain}</td>
                  <td className="py-2 pr-4">{item.side}</td>
                  <td className="py-2 pr-4">{formatUsd(item.notionalUsd)}</td>
                  <td className="py-2 pr-4">{formatPct(item.confidence)}</td>
                  <td className="py-2 pr-4">{item.exchange}</td>
                  <td className="py-2 pr-4">{formatDateTime(item.triggeredAt)}</td>
                </tr>
              ))}
              {items.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="py-4 text-[#8ea8be]">
                    No matching crypto signals. Relax filters and retry.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <CopilotPanel
        lane="crypto-intel"
        defaultPrompt="Summarize crypto flow regime and identify safest high-conviction setup."
        contextBuilder={() => context}
      />
    </div>
  );
}
