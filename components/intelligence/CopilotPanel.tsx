"use client";

import { useState } from "react";

type CopilotPanelProps = {
  lane: string;
  defaultPrompt: string;
  contextBuilder: () => string;
};

export function CopilotPanel(props: CopilotPanelProps) {
  const { lane, defaultPrompt, contextBuilder } = props;
  const [question, setQuestion] = useState(defaultPrompt);
  const [response, setResponse] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runCopilot() {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    try {
      const result = await fetch("/api/intelligence/copilot", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          context: contextBuilder(),
          lane,
        }),
      });
      const payload = await result.json();
      if (!result.ok || !payload.ok) {
        setError(payload.error || "Failed to run copilot.");
        return;
      }
      setResponse(String(payload.response ?? ""));
      setModel(String(payload.model ?? ""));
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Copilot request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="theme-panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="theme-kicker">AI Copilot</p>
        <p className="text-xs text-[#8ea8be] uppercase tracking-[0.2em]">{lane}</p>
      </div>

      <label className="block text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be] mb-2">
        Ask for a trade-ready interpretation
      </label>
      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        rows={3}
        className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
      />
      <button
        type="button"
        onClick={runCopilot}
        disabled={loading}
        className="theme-cta theme-cta--loud mt-3"
      >
        {loading ? "Analyzing..." : "Run Copilot"}
      </button>

      {error ? (
        <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          {error}
        </p>
      ) : null}

      {response ? (
        <div className="mt-3 rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-200 mb-2">
            {model || "copilot"}
          </p>
          <pre className="whitespace-pre-wrap text-xs sm:text-sm text-cyan-100">{response}</pre>
        </div>
      ) : null}
    </section>
  );
}
