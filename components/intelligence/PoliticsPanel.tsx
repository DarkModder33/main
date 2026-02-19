"use client";

import { CopilotPanel } from "@/components/intelligence/CopilotPanel";
import { useIntelligenceFeed } from "@/components/intelligence/useIntelligenceFeed";
import { PoliticalTrade } from "@/lib/intelligence/types";
import { useMemo, useState } from "react";

export function PoliticsPanel() {
  const [symbol, setSymbol] = useState("");
  const [chamber, setChamber] = useState("");
  const [action, setAction] = useState("");
  const [theme, setTheme] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (symbol.trim()) params.set("symbol", symbol.trim().toUpperCase());
    if (chamber) params.set("chamber", chamber);
    if (action) params.set("action", action);
    if (theme.trim()) params.set("theme", theme.trim());
    return params.toString();
  }, [symbol, chamber, action, theme]);

  const { items, count, generatedAt, loading, error, reload } = useIntelligenceFeed<PoliticalTrade>(
    "/api/intelligence/politics",
    query,
  );

  const context = useMemo(() => JSON.stringify(items.slice(0, 8)), [items]);

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <section className="theme-panel p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Symbol
            <input
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              placeholder="COIN"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Chamber
            <select
              value={chamber}
              onChange={(event) => setChamber(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="">Any</option>
              <option value="house">House</option>
              <option value="senate">Senate</option>
            </select>
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Action
            <select
              value={action}
              onChange={(event) => setAction(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="">Any</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Theme
            <input
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
              placeholder="AI infrastructure"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={reload} className="theme-cta theme-cta--loud">
            Refresh Feed
          </button>
          <p className="text-xs text-[#8ea8be]">
            {loading ? "Loading..." : `${count} disclosures`} {generatedAt ? `• ${generatedAt.slice(0, 10)}` : ""}
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
                <th className="py-2 pr-4">Politician</th>
                <th className="py-2 pr-4">Chamber</th>
                <th className="py-2 pr-4">Symbol</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Value Range</th>
                <th className="py-2 pr-4">Theme</th>
                <th className="py-2 pr-4">Disclosed</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-white/5 text-white">
                  <td className="py-2 pr-4 font-semibold">{item.politician}</td>
                  <td className="py-2 pr-4">{item.chamber}</td>
                  <td className="py-2 pr-4">{item.symbol}</td>
                  <td className="py-2 pr-4">{item.action.toUpperCase()}</td>
                  <td className="py-2 pr-4">{item.valueRange}</td>
                  <td className="py-2 pr-4">{item.theme}</td>
                  <td className="py-2 pr-4">{item.disclosedAt}</td>
                </tr>
              ))}
              {items.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="py-4 text-[#8ea8be]">
                    No matching records. Relax filters and retry.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <CopilotPanel
        lane="politics-intel"
        defaultPrompt="What policy-linked signals stand out, and how should this influence position sizing?"
        contextBuilder={() => context}
      />
    </div>
  );
}
