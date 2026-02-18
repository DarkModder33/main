"use client";

import { Bot, TrendingUp, Activity, Zap } from "lucide-react";
import { useCallback, useState } from "react";

interface BotInfo {
  id: string;
  name: string;
  strategy: string;
  status: "active" | "paused" | "stopped";
  winRate: number;
  netProfit: number;
  activeTrades: number;
}

export function TradehaxBotDashboard() {
  const [bots, setBots] = useState<BotInfo[]>([
    {
      id: "bot-1",
      name: "Scalping Bot Alpha",
      strategy: "scalping",
      status: "active",
      winRate: 83.3,
      netProfit: 2.45,
      activeTrades: 3,
    },
    {
      id: "bot-2",
      name: "Swing Trader Beta",
      strategy: "swing",
      status: "active",
      winRate: 71.2,
      netProfit: 5.82,
      activeTrades: 1,
    },
  ]);

  const [selectedBot, setSelectedBot] = useState<string | null>(null);

  const createNewBot = useCallback(async () => {
    const name = prompt("Bot name:");
    if (!name) return;

    try {
      const response = await fetch("/api/trading/bot/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          strategy: "swing",
          riskLevel: "medium",
          allocatedCapital: 5,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        setBots((prev) => [
          ...prev,
          {
            id: data.bot.id,
            name: data.bot.name,
            strategy: data.bot.strategy,
            status: "active",
            winRate: 0,
            netProfit: 0,
            activeTrades: 0,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to create bot:", error);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-300 flex items-center gap-2">
          <Bot className="w-8 h-8" />
          TradeHax Bots
        </h1>
        <button
          onClick={createNewBot}
          className="theme-cta theme-cta--loud px-4 py-2"
        >
          + Create Bot
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {bots.map((bot) => (
          <div
            key={bot.id}
            onClick={() => setSelectedBot(bot.id)}
            className={`theme-panel p-6 cursor-pointer transition ${
              selectedBot === bot.id
                ? "border-2 border-cyan-400"
                : "border border-emerald-500/20"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{bot.name}</h3>
                <p className="text-sm text-emerald-200/70 capitalize">
                  {bot.strategy}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded text-xs font-bold ${
                  bot.status === "active"
                    ? "bg-emerald-600/40 text-emerald-300"
                    : "bg-gray-600/40 text-gray-300"
                }`}
              >
                {bot.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs text-gray-400">Win Rate</div>
                  <div className="font-bold text-green-300">{bot.winRate}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-yellow-400" />
                <div>
                  <div className="text-xs text-gray-400">Net Profit</div>
                  <div className="font-bold text-yellow-300">
                    {bot.netProfit} SOL
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-xs text-gray-400">Active Trades</div>
                  <div className="font-bold text-blue-300">{bot.activeTrades}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedBot && (
        <div className="theme-panel p-6">
          <h2 className="text-xl font-bold text-white mb-4">Bot Details</h2>
          <div className="space-y-4">
            <button className="theme-cta theme-cta--secondary w-full py-2">
              View Performance
            </button>
            <button className="theme-cta theme-cta--secondary w-full py-2">
              Configure Strategy
            </button>
            <button className="theme-cta theme-cta--warning w-full py-2">
              Pause Bot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
