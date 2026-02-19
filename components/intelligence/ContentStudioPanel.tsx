"use client";

import { useState } from "react";

type DailyBrief = {
  focus: string;
  generatedAt: string;
  youtube: {
    title: string;
    hook: string;
    script: string[];
    cta: string;
  };
  discord: {
    headline: string;
    summary: string;
    blocks: string[];
    action: string;
  };
};

export function ContentStudioPanel() {
  const [focus, setFocus] = useState("cross-asset");
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateBrief() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/intelligence/content/daily-brief?focus=${encodeURIComponent(focus)}`,
        {
          cache: "no-store",
        },
      );
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setError(payload.error || "Failed to generate daily brief.");
        return;
      }
      setBrief(payload.brief as DailyBrief);
      setModel(String(payload.model ?? ""));
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Failed to generate daily brief.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Ignore clipboard errors in unsupported contexts.
    }
  }

  const youtubeText = brief
    ? [brief.youtube.title, brief.youtube.hook, ...brief.youtube.script, brief.youtube.cta].join(
        "\n\n",
      )
    : "";
  const discordText = brief
    ? [brief.discord.headline, brief.discord.summary, ...brief.discord.blocks, brief.discord.action].join(
        "\n",
      )
    : "";

  return (
    <section className="theme-panel p-5 sm:p-6">
      <p className="theme-kicker mb-3">Media Bridge</p>
      <h2 className="theme-title text-2xl mb-4">YouTube + Discord Daily Brief</h2>
      <p className="text-sm text-[#a8bfd1] mb-5">
        Generate ready-to-publish content snippets from live intelligence feeds for growth loops.
      </p>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
          Focus
          <select
            value={focus}
            onChange={(event) => setFocus(event.target.value)}
            className="mt-2 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
          >
            <option value="cross-asset">Cross-asset</option>
            <option value="options">Options-heavy</option>
            <option value="crypto">Crypto-heavy</option>
            <option value="macro">Macro catalyst</option>
          </select>
        </label>
        <button type="button" onClick={generateBrief} disabled={loading} className="theme-cta theme-cta--loud">
          {loading ? "Generating..." : "Generate Daily Brief"}
        </button>
        {model ? (
          <span className="text-xs text-[#8ea8be] uppercase tracking-[0.2em]">Model: {model}</span>
        ) : null}
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {error}
        </p>
      ) : null}

      {brief ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white">YouTube Draft</h3>
              <button
                type="button"
                onClick={() => copyToClipboard(youtubeText)}
                className="theme-cta theme-cta--secondary text-xs px-3 py-1"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-cyan-100">{brief.youtube.title}</p>
            <p className="text-sm text-[#a8bfd1] mt-2">{brief.youtube.hook}</p>
            <ul className="mt-3 space-y-2 text-sm text-[#c8d7e3] list-disc pl-5">
              {brief.youtube.script.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-emerald-200">{brief.youtube.cta}</p>
          </article>

          <article className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white">Discord Brief</h3>
              <button
                type="button"
                onClick={() => copyToClipboard(discordText)}
                className="theme-cta theme-cta--secondary text-xs px-3 py-1"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-cyan-100">{brief.discord.headline}</p>
            <p className="text-sm text-[#a8bfd1] mt-2">{brief.discord.summary}</p>
            <ul className="mt-3 space-y-2 text-sm text-[#c8d7e3] list-disc pl-5">
              {brief.discord.blocks.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-emerald-200">{brief.discord.action}</p>
          </article>
        </div>
      ) : null}
    </section>
  );
}
