"use client";

import { formatDateTime } from "@/lib/intelligence/format";
import { IntelligenceAlert, WatchlistItem } from "@/lib/intelligence/types";
import { useEffect, useMemo, useState } from "react";

type WatchlistResponse = {
  ok: boolean;
  userId: string;
  items: WatchlistItem[];
  error?: string;
};

type AlertsResponse = {
  ok: boolean;
  userId: string;
  tier: string;
  newAlertsCount: number;
  alerts: IntelligenceAlert[];
  dispatch?: {
    ok: boolean;
    deliveredCount: number;
    deliveredAt: string;
    error?: string;
    route: {
      tier: string;
      channelLabel: string;
      viaFallback: boolean;
      webhookConfigured: boolean;
    };
  } | null;
  discordRoute?: {
    tier: string;
    channelLabel: string;
    viaFallback: boolean;
    webhookConfigured: boolean;
  };
  error?: string;
};

function toMaybeNumber(value: string) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function severityClass(severity: IntelligenceAlert["severity"]) {
  if (severity === "urgent") return "bg-red-500/20 text-red-100 border-red-400/40";
  if (severity === "watch") return "bg-amber-500/20 text-amber-100 border-amber-400/40";
  return "bg-cyan-500/20 text-cyan-100 border-cyan-400/40";
}

export function WatchlistPanel() {
  const [symbol, setSymbol] = useState("");
  const [assetType, setAssetType] = useState<"equity" | "crypto">("equity");
  const [minScore, setMinScore] = useState("");
  const [minFlowPremium, setMinFlowPremium] = useState("");
  const [minDarkPoolNotional, setMinDarkPoolNotional] = useState("");
  const [minCryptoNotional, setMinCryptoNotional] = useState("");
  const [minConfidence, setMinConfidence] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>([]);
  const [tier, setTier] = useState("free");
  const [userId, setUserId] = useState("");
  const [routeLabel, setRouteLabel] = useState("not-configured");
  const [routeConfigured, setRouteConfigured] = useState(false);
  const [routeFallback, setRouteFallback] = useState(false);

  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const alertSummary = useMemo(() => {
    const urgent = alerts.filter((item) => item.severity === "urgent").length;
    const watch = alerts.filter((item) => item.severity === "watch").length;
    return { total: alerts.length, urgent, watch };
  }, [alerts]);

  async function loadWatchlist() {
    const response = await fetch("/api/intelligence/watchlist", { cache: "no-store" });
    const payload = (await response.json()) as WatchlistResponse;
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Unable to load watchlist.");
    }
    setItems(payload.items || []);
    setUserId(payload.userId || "");
  }

  async function loadAlerts(evaluate = false) {
    const endpoint = evaluate
      ? "/api/intelligence/alerts?evaluate=true&limit=80"
      : "/api/intelligence/alerts?limit=80";
    const response = await fetch(endpoint, { cache: "no-store" });
    const payload = (await response.json()) as AlertsResponse;
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "Unable to load alerts.");
    }
    setAlerts(payload.alerts || []);
    setTier(payload.tier || "free");

    if (payload.discordRoute) {
      setRouteLabel(payload.discordRoute.channelLabel);
      setRouteConfigured(Boolean(payload.discordRoute.webhookConfigured));
      setRouteFallback(Boolean(payload.discordRoute.viaFallback));
    }

    if (evaluate) {
      setStatus(`Scan complete. ${payload.newAlertsCount} new alerts.`);
    }
  }

  async function refreshAll() {
    setLoading(true);
    setError("");
    try {
      await Promise.all([loadWatchlist(), loadAlerts(false)]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load watchlist panel.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAll();
  }, []);

  async function handleAdd() {
    setError("");
    setStatus("");

    if (!symbol.trim()) {
      setError("Symbol is required.");
      return;
    }

    try {
      const response = await fetch("/api/intelligence/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.trim().toUpperCase(),
          assetType,
          minUnusualScore: toMaybeNumber(minScore),
          minFlowPremiumUsd: toMaybeNumber(minFlowPremium),
          minDarkPoolNotionalUsd: toMaybeNumber(minDarkPoolNotional),
          minCryptoNotionalUsd: toMaybeNumber(minCryptoNotional),
          minConfidence: toMaybeNumber(minConfidence),
          notes: notes.trim() || undefined,
        }),
      });
      const payload = (await response.json()) as WatchlistResponse;
      if (!response.ok || !payload.ok) {
        setError(payload.error || "Failed to add watchlist item.");
        return;
      }
      setItems(payload.items || []);
      setSymbol("");
      setNotes("");
      setStatus("Watchlist item saved.");
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Failed to save watchlist item.");
    }
  }

  async function handleRemove(item: WatchlistItem) {
    setError("");
    setStatus("");
    try {
      const response = await fetch("/api/intelligence/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: item.symbol,
          assetType: item.assetType,
        }),
      });
      const payload = (await response.json()) as WatchlistResponse & { removed?: number };
      if (!response.ok || !payload.ok) {
        setError(payload.error || "Failed to remove watchlist item.");
        return;
      }
      setItems(payload.items || []);
      setStatus(`Removed ${payload.removed || 0} item(s).`);
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Failed to remove watchlist item.");
    }
  }

  async function handleScan(dispatchToDiscord: boolean) {
    if (dispatchToDiscord) {
      setDispatching(true);
    } else {
      setScanning(true);
    }
    setError("");
    setStatus("");

    try {
      const response = await fetch("/api/intelligence/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluate: true,
          dispatchToDiscord,
          limit: 80,
        }),
      });
      const payload = (await response.json()) as AlertsResponse;
      if (!response.ok || !payload.ok) {
        setError(payload.error || "Alert scan failed.");
        return;
      }

      setAlerts(payload.alerts || []);
      setTier(payload.tier || tier);

      if (payload.dispatch) {
        if (payload.dispatch.ok) {
          setRouteLabel(payload.dispatch.route.channelLabel);
          setRouteConfigured(payload.dispatch.route.webhookConfigured);
          setRouteFallback(payload.dispatch.route.viaFallback);
          setStatus(
            `Scan complete. ${payload.newAlertsCount} new alerts. Discord delivered: ${payload.dispatch.deliveredCount}.`,
          );
        } else {
          setStatus(
            `Scan complete. ${payload.newAlertsCount} new alerts. Discord dispatch failed: ${payload.dispatch.error || "unknown error"}.`,
          );
        }
      } else {
        setStatus(`Scan complete. ${payload.newAlertsCount} new alerts.`);
      }
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Failed to run alert scan.");
    } finally {
      setScanning(false);
      setDispatching(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
      <section className="theme-panel p-5 sm:p-6">
        <p className="theme-kicker mb-2">Phase 2: Watchlists</p>
        <h2 className="theme-title text-2xl mb-2">Persistent Alert Console</h2>
        <p className="text-sm text-[#a8bfd1] mb-5">
          Build watchlists, run cross-asset scans, and route alerts to Discord channels by paid tier.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Symbol / Pair
            <input
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              placeholder={assetType === "crypto" ? "SOL/USDC" : "NVDA"}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>

          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Asset Type
            <select
              value={assetType}
              onChange={(event) => setAssetType(event.target.value === "crypto" ? "crypto" : "equity")}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            >
              <option value="equity">Equity</option>
              <option value="crypto">Crypto</option>
            </select>
          </label>

          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Min Score
            <input
              value={minScore}
              onChange={(event) => setMinScore(event.target.value)}
              placeholder="75"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>

          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Min Flow Premium
            <input
              value={minFlowPremium}
              onChange={(event) => setMinFlowPremium(event.target.value)}
              placeholder="700000"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>

          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Min Dark Pool
            <input
              value={minDarkPoolNotional}
              onChange={(event) => setMinDarkPoolNotional(event.target.value)}
              placeholder="14000000"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>

          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Min Crypto Notional
            <input
              value={minCryptoNotional}
              onChange={(event) => setMinCryptoNotional(event.target.value)}
              placeholder="500000"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>

          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be]">
            Min Confidence (0-1)
            <input
              value={minConfidence}
              onChange={(event) => setMinConfidence(event.target.value)}
              placeholder="0.70"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>

          <label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8ea8be] sm:col-span-2">
            Notes
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional thesis note"
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/60"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={handleAdd} className="theme-cta theme-cta--loud">
            Add / Update
          </button>
          <button
            type="button"
            onClick={() => void handleScan(false)}
            disabled={scanning || dispatching}
            className="theme-cta theme-cta--secondary"
          >
            {scanning ? "Scanning..." : "Run Alert Scan"}
          </button>
          <button
            type="button"
            onClick={() => void handleScan(true)}
            disabled={scanning || dispatching}
            className="theme-cta theme-cta--secondary"
          >
            {dispatching ? "Dispatching..." : "Scan + Send Discord"}
          </button>
          <button
            type="button"
            onClick={() => void refreshAll()}
            disabled={loading}
            className="theme-cta theme-cta--muted"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {status ? (
          <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">
            {error}
          </p>
        ) : null}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[#8ea8be] border-b border-white/10">
                <th className="py-2 pr-4">Symbol</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2 pr-4">Thresholds</th>
                <th className="py-2 pr-4">Updated</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-white/5 text-white align-top">
                  <td className="py-2 pr-4 font-semibold">{item.symbol}</td>
                  <td className="py-2 pr-4 uppercase">{item.assetType}</td>
                  <td className="py-2 pr-4">{item.minUnusualScore ?? "-"}</td>
                  <td className="py-2 pr-4 text-xs text-[#b7c9d7]">
                    Flow: {item.minFlowPremiumUsd ?? "-"} / Dark: {item.minDarkPoolNotionalUsd ?? "-"} / Crypto:{" "}
                    {item.minCryptoNotionalUsd ?? "-"} / Conf: {item.minConfidence ?? "-"}
                  </td>
                  <td className="py-2 pr-4 text-xs text-[#b7c9d7]">{formatDateTime(item.updatedAt)}</td>
                  <td className="py-2 pr-4">
                    <button
                      type="button"
                      className="theme-cta theme-cta--muted text-xs px-2 py-1"
                      onClick={() => void handleRemove(item)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-[#8ea8be]">
                    No watchlist items yet. Add symbols to begin alert automation.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="theme-panel p-5 sm:p-6">
        <p className="theme-kicker mb-2">Alert Stream</p>
        <h3 className="text-xl font-semibold text-white mb-4">Recent Triggers</h3>

        <div className="grid gap-2 text-xs text-[#b7c9d7] mb-4">
          <p>User ID: {userId || "loading"}</p>
          <p>
            Tier Route: {tier} {"->"} #{routeLabel}
          </p>
          <p>Webhook Configured: {routeConfigured ? "yes" : "no"}{routeFallback ? " (fallback)" : ""}</p>
          <p>
            Alerts: {alertSummary.total} total / {alertSummary.urgent} urgent / {alertSummary.watch} watch
          </p>
        </div>

        <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <article key={alert.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${severityClass(alert.severity)}`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#a8bfd1] mt-2">{alert.summary}</p>
              <div className="mt-2 text-[11px] text-[#8ea8be]">
                {alert.symbol} • {alert.source} • {formatDateTime(alert.triggeredAt)}
                {alert.deliveredToDiscordAt ? ` • delivered ${formatDateTime(alert.deliveredToDiscordAt)}` : ""}
              </div>
            </article>
          ))}
          {alerts.length === 0 ? (
            <p className="text-sm text-[#8ea8be]">No alerts yet. Run a scan after adding watchlist symbols.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
