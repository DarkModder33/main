"use client";

import { Brain, Zap, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface EnvironmentContext {
  user: {
    experience: string;
    riskTolerance: string;
    portfolio: { totalAssets: number; allocation: Record<string, number> };
  };
  marketData: Record<string, { price: number; change24h: number }>;
  marketFreshness?: {
    generatedAt: string;
    latencyMs: number;
    isDegraded: boolean;
    coverage: number;
    averageDivergenceBps: number;
    trackedSymbols: string[];
    providerStatus: Record<string, { ok: boolean; error?: string }>;
  };
  marketConvergence?: Record<
    string,
    {
      symbol: string;
      price: number;
      change24h: number;
      providers: string[];
      divergenceBps: number;
      confidence: "high" | "medium" | "low";
      updatedAt: string;
    }
  >;
  activeBots: string[];
  recentSignals: Array<{ symbol: string; action: string; confidence: number }>;
}

function confidenceTone(value?: "high" | "medium" | "low") {
  if (value === "high") return "text-emerald-400";
  if (value === "medium") return "text-yellow-300";
  return "text-red-300";
}

export function SmartEnvironmentMonitor() {
  const [context, setContext] = useState<EnvironmentContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        // Initialize environment
        const initResponse = await fetch("/api/environment/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "user-" + Math.random().toString(36).substr(2, 9),
            preferences: {
              riskTolerance: "moderate",
              tradingExperience: "intermediate",
            },
          }),
        });

        const initData = await initResponse.json();

        // Get context
        const contextResponse = await fetch(
          `/api/environment/context?sessionId=${initData.environment.sessionId}`,
        );
        const contextData = await contextResponse.json();
        setContext(contextData.context);
      } catch (error) {
        console.error("Failed to initialize environment:", error);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  if (loading) {
    return (
      <div className="theme-panel p-6 text-center">
        <p className="text-cyan-200">Initializing smart environment...</p>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="theme-panel p-6 text-red-200">
        Failed to load environment
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-cyan-300 flex items-center gap-2">
          <Brain className="w-8 h-8" />
          Smart Environment
        </h1>
      </div>

      {/* Portfolio Overview */}
      <div className="theme-panel p-6">
        <h2 className="text-xl font-bold text-white mb-4">Portfolio Overview</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-4xl font-bold text-emerald-400">
              {context.user.portfolio.totalAssets} units
            </div>
            <p className="text-sm text-gray-400">Total Assets</p>
          </div>
          <div>
            <div className="text-lg font-bold text-white mb-3">Allocation</div>
            <div className="space-y-2">
              {Object.entries(context.user.portfolio.allocation).map(
                ([token, percent]) => (
                  <div key={token} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{token}</span>
                    <div className="flex items-center gap-2">
                      <progress
                        className="w-24 h-2 [&::-webkit-progress-bar]:bg-gray-700 [&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500 rounded overflow-hidden"
                        value={Number(percent)}
                        max={100}
                      />
                      <span className="text-sm font-bold text-gray-300 w-8 text-right">
                        {percent}%
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Market Data */}
      <div className="theme-panel p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Market Data
        </h2>
        {context.marketFreshness ? (
          <div
            className={`mb-4 rounded border p-3 text-xs ${
              context.marketFreshness.isDegraded
                ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-200"
                : "border-cyan-500/30 bg-cyan-500/10 text-cyan-100"
            }`}
          >
            <div className="font-semibold">
              Live convergence snapshot • {new Date(context.marketFreshness.generatedAt).toLocaleTimeString()}
            </div>
            <div className="mt-1 opacity-90">
              Coverage: {(context.marketFreshness.coverage * 100).toFixed(0)}% • Avg divergence: {context.marketFreshness.averageDivergenceBps.toFixed(2)} bps • Fetch latency: {context.marketFreshness.latencyMs}ms
            </div>
            <div className="mt-1 opacity-90">
              Providers: {Object.entries(context.marketFreshness.providerStatus)
                .map(([name, status]) => `${name}:${status.ok ? "ok" : "down"}`)
                .join(" | ")}
            </div>
          </div>
        ) : null}
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(context.marketData).map(([symbol, data]) => (
            <div key={symbol} className="border border-blue-500/20 rounded p-4">
              <div className="font-bold text-white">{symbol}</div>
              <div className="text-2xl font-bold text-blue-400">
                ${data.price.toFixed(2)}
              </div>
              <div
                className={`text-sm font-bold ${data.change24h >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {data.change24h >= 0 ? "+" : ""}
                {data.change24h.toFixed(2)}%
              </div>
              {context.marketConvergence?.[symbol] ? (
                <div className="mt-2 text-xs text-gray-300">
                  <div>
                    Sources: {context.marketConvergence[symbol].providers.join(", ")}
                  </div>
                  <div>
                    Divergence: {context.marketConvergence[symbol].divergenceBps.toFixed(2)} bps
                  </div>
                  <div className={confidenceTone(context.marketConvergence[symbol].confidence)}>
                    Confidence: {context.marketConvergence[symbol].confidence.toUpperCase()}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Active Bots */}
      <div className="theme-panel p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Active Bots
        </h2>
        <div className="space-y-2">
          {context.activeBots.map((bot) => (
            <div
              key={bot}
              className="flex items-center justify-between border border-yellow-500/20 rounded p-3"
            >
              <span className="font-mono text-yellow-300 text-sm">{bot}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Signals */}
      <div className="theme-panel p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Trading Signals</h2>
        <div className="space-y-3">
          {context.recentSignals.map((signal, i) => (
            <div key={i} className="flex items-center justify-between border-b border-gray-700 pb-3">
              <div>
                <div className="font-bold text-white">{signal.symbol}</div>
                <div className="text-sm text-gray-400">
                  Confidence: {(signal.confidence * 100).toFixed(0)}%
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded text-xs font-bold ${
                  signal.action === "buy"
                    ? "bg-green-600/40 text-green-300"
                    : signal.action === "sell"
                      ? "bg-red-600/40 text-red-300"
                      : "bg-gray-600/40 text-gray-300"
                }`}
              >
                {signal.action.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Context Info */}
      <div className="theme-panel p-6 bg-cyan-600/10 border border-cyan-500/20">
        <h3 className="font-bold text-cyan-300 mb-2">System Prompt Context</h3>
        <p className="text-sm text-cyan-100/80 font-mono whitespace-pre-wrap">
          {context.user.experience.charAt(0).toUpperCase() +
            context.user.experience.slice(1)}{" "}
          trader • {context.user.riskTolerance} risk tolerance • {context.activeBots.length}{" "}
          active bots
        </p>
      </div>
    </div>
  );
}
