"use client";

import { Loader2, RefreshCw, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

type MetricsPayload = {
  generatedAt: string;
  activeSubscribers: number;
  mrrUsd: number;
  arrUsd: number;
  arpuUsd: number;
  totalUsers: number;
  tierBreakdown: {
    free: number;
    basic: number;
    pro: number;
    elite: number;
  };
};

export function MonetizationAdminPanel() {
  const [adminKey, setAdminKey] = useState("");
  const [metrics, setMetrics] = useState<MetricsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function refreshMetrics(customKey?: string) {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/monetization/admin/metrics", {
        headers: customKey || adminKey ? { "x-tradehax-admin-key": customKey || adminKey } : {},
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        setMessage(payload.error ?? "Unable to load metrics.");
        setMetrics(null);
        return;
      }
      setMetrics(payload.metrics);
    } catch (error) {
      setMessage("Metrics fetch failed.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshMetrics();
  }, []);

  return (
    <div className="space-y-6">
      <section className="theme-panel p-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[280px]">
            <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8fb0c4]">
              Admin Key (optional in prod)
            </label>
            <input
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              placeholder="Enter TRADEHAX_ADMIN_KEY"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </div>
          <button
            onClick={() => refreshMetrics()}
            className="theme-cta theme-cta--secondary"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh Metrics
          </button>
        </div>
        {message ? (
          <p className="mt-3 rounded-xl border border-amber-300/35 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
            {message}
          </p>
        ) : null}
      </section>

      {loading ? (
        <section className="theme-panel p-6 flex items-center gap-3 text-[#9ab3c6]">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading monetization KPIs...
        </section>
      ) : null}

      {!loading && metrics ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="theme-grid-card">
            <div className="flex items-center gap-2 text-[#95f5be] text-sm">
              <TrendingUp className="w-4 h-4" />
              Monthly Recurring Revenue
            </div>
            <p className="text-3xl font-bold text-white">${metrics.mrrUsd.toFixed(2)}</p>
            <p className="text-xs text-[#8fa9bc]">ARR ${metrics.arrUsd.toFixed(2)}</p>
          </article>
          <article className="theme-grid-card">
            <div className="flex items-center gap-2 text-[#95f5be] text-sm">
              <Users className="w-4 h-4" />
              Active Subscribers
            </div>
            <p className="text-3xl font-bold text-white">{metrics.activeSubscribers}</p>
            <p className="text-xs text-[#8fa9bc]">ARPU ${metrics.arpuUsd.toFixed(2)}</p>
          </article>
          <article className="theme-grid-card">
            <p className="text-sm text-[#99b2c6]">Total Users</p>
            <p className="text-3xl font-bold text-white">{metrics.totalUsers}</p>
            <p className="text-xs text-[#8fa9bc]">
              Generated {new Date(metrics.generatedAt).toLocaleString()}
            </p>
          </article>
          <article className="theme-grid-card">
            <p className="text-sm text-[#99b2c6]">Tier Mix</p>
            <ul className="space-y-1 text-sm text-[#d3e0ec]">
              <li>Free: {metrics.tierBreakdown.free}</li>
              <li>Basic: {metrics.tierBreakdown.basic}</li>
              <li>Pro: {metrics.tierBreakdown.pro}</li>
              <li>Elite: {metrics.tierBreakdown.elite}</li>
            </ul>
          </article>
        </section>
      ) : null}
    </div>
  );
}
