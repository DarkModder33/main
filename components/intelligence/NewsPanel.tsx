"use client";

import { CopilotPanel } from "@/components/intelligence/CopilotPanel";
import { useIntelligenceFeed } from "@/components/intelligence/useIntelligenceFeed";
import { formatDateTime } from "@/lib/intelligence/format";
import { IntelligenceNewsItem } from "@/lib/intelligence/types";
import { useMemo, useState } from "react";

export function NewsPanel() {
  const [symbol, setSymbol] = useState("");
  const [impact, setImpact] = useState("");
  const [category, setCategory] = useState("");
  const [queryText, setQueryText] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (symbol.trim()) params.set("symbol", symbol.trim().toUpperCase());
    if (impact) params.set("impact", impact);
    if (category) params.set("category", category);
    if (queryText.trim()) params.set("q", queryText.trim());
    return params.toString();
  }, [symbol, impact, category, queryText]);

  const { items, count, generatedAt, loading, error, reload } = useIntelligenceFeed<IntelligenceNewsItem>(
    "/api/intelligence/news",
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
              placeholder="NVDA"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Impact
            <select
              value={impact}
              onChange={(event) => setImpact(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="">Any</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="">Any</option>
              <option value="earnings">Earnings</option>
              <option value="macro">Macro</option>
              <option value="crypto">Crypto</option>
              <option value="policy">Policy</option>
              <option value="technical">Technical</option>
            </select>
          </label>
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Search
            <input
              value={queryText}
              onChange={(event) => setQueryText(event.target.value)}
              placeholder="liquidity"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={reload} className="theme-cta theme-cta--loud">
            Refresh Feed
          </button>
          <p className="text-xs text-[#8ea8be]">
            {loading ? "Loading..." : `${count} items`} {generatedAt ? `• ${formatDateTime(generatedAt)}` : ""}
          </p>
        </div>

        {error ? (
          <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">
            {error}
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-cyan-100">
                  {item.symbol}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[#c1d4e4]">
                  {item.category}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[#c1d4e4]">
                  {item.impact}
                </span>
                <span className="text-[#8ea8be]">{formatDateTime(item.publishedAt)}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-[#aac0d0]">{item.summary}</p>
              <p className="text-xs text-[#8ea8be] mt-2">Source: {item.source}</p>
            </article>
          ))}
          {items.length === 0 && !loading ? (
            <p className="text-sm text-[#8ea8be]">
              No matching stories. Relax filters and retry.
            </p>
          ) : null}
        </div>
      </section>

      <CopilotPanel
        lane="news-intel"
        defaultPrompt="Summarize the highest-impact catalysts and map them to actionable watchlist priorities."
        contextBuilder={() => context}
      />
    </div>
  );
}
