/**
 * Smart Environment System
 * Manages context, user preferences, trading state, and AI responses
 */

export interface UserProfile {
  id: string;
  walletAddress?: string;
  preferences: {
    theme: "dark" | "light";
    language: string;
    riskTolerance: "conservative" | "moderate" | "aggressive";
    tradingExperience: "beginner" | "intermediate" | "expert";
  };
  portfolio: {
    totalAssets: number;
    allocations: Record<string, number>; // symbol -> percentage
  };
  history: {
    trades: Array<{ symbol: string; action: string; date: number }>;
    interactions: Array<{ prompt: string; response: string; date: number }>;
  };
}

export interface EnvironmentState {
  user: UserProfile;
  marketData: {
    selectedSymbols: string[];
    priceFeeds: Record<string, { price: number; change24h: number }>;
    lastUpdate: number;
  };
  botState: {
    activeBots: string[];
    recentSignals: Array<{ symbol: string; action: string; date: number }>;
  };
  sessionContext: {
    startTime: number;
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
    aiModel: string;
  };
}

class SmartEnvironment {
  private state: EnvironmentState;
  private updateInterval: NodeJS.Timeout | null = null;

  private readonly symbolPairs: Record<string, string> = {
    SOL: "SOLUSDT",
    USDC: "USDCUSDT",
    RAY: "RAYUSDT",
  };

  constructor(userId: string) {
    this.state = this.initializeState(userId);
  }

  private initializeState(userId: string): EnvironmentState {
    return {
      user: {
        id: userId,
        preferences: {
          theme: "dark",
          language: "en",
          riskTolerance: "moderate",
          tradingExperience: "intermediate",
        },
        portfolio: {
          totalAssets: 0,
          allocations: {},
        },
        history: {
          trades: [],
          interactions: [],
        },
      },
      marketData: {
        selectedSymbols: ["SOL", "USDC", "RAY"],
        priceFeeds: {},
        lastUpdate: 0,
      },
      botState: {
        activeBots: [],
        recentSignals: [],
      },
      sessionContext: {
        startTime: Date.now(),
        conversationHistory: [],
        aiModel: "mistral-7b",
      },
    };
  }

  /**
   * Update market data
   */
  updateMarketData(symbol: string, price: number, change24h: number): void {
    if (!this.state.marketData.priceFeeds[symbol]) {
      this.state.marketData.priceFeeds[symbol] = { price, change24h };
    } else {
      this.state.marketData.priceFeeds[symbol] = { price, change24h };
    }
    this.state.marketData.lastUpdate = Date.now();
  }

  private async fetchLiveMarketData(): Promise<void> {
    const symbols = this.state.marketData.selectedSymbols
      .map((symbol) => this.symbolPairs[symbol])
      .filter(Boolean);

    if (symbols.length === 0) {
      return;
    }

    const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`market_http_${response.status}`);
    }

    const payload = (await response.json()) as Array<Record<string, unknown>>;
    for (const row of payload) {
      const pair = String(row.symbol || "").toUpperCase();
      const symbol = Object.entries(this.symbolPairs).find(([, value]) => value === pair)?.[0];
      if (!symbol) {
        continue;
      }

      const price = Number.parseFloat(String(row.lastPrice ?? "NaN"));
      const change24h = Number.parseFloat(String(row.priceChangePercent ?? "NaN"));
      if (!Number.isFinite(price) || !Number.isFinite(change24h)) {
        continue;
      }

      this.updateMarketData(symbol, price, change24h);
    }
  }

  /**
   * Add interaction to history
   */
  recordInteraction(prompt: string, response: string): void {
    this.state.user.history.interactions.push({
      prompt,
      response,
      date: Date.now(),
    });

    this.state.sessionContext.conversationHistory.push(
      { role: "user", content: prompt },
      { role: "assistant", content: response },
    );
  }

  /**
   * Get context-aware system prompt for AI
   */
  getSystemPrompt(): string {
    const portfolio = this.state.user.portfolio;
    const recentSignals = this.state.botState.recentSignals.slice(-5);
    const experience = this.state.user.preferences.tradingExperience;

    return `You are TradeHax AI Assistant, a specialized trading and investment advisor.

User Context:
- Experience Level: ${experience}
- Risk Tolerance: ${this.state.user.preferences.riskTolerance}
- Portfolio Value: ${portfolio.totalAssets} portfolio units
- Active Bots: ${this.state.botState.activeBots.length}

Recent Market Context:
${Object.entries(this.state.marketData.priceFeeds)
  .map(([symbol, data]) => `- ${symbol}: $${data.price} (${data.change24h > 0 ? "+" : ""}${data.change24h}%)`)
  .join("\n")}

Recent Trading Signals:
${recentSignals.map((s) => `- ${s.symbol}: ${s.action}`).join("\n")}

Guidelines:
1. Provide personalized advice based on user's risk tolerance
2. Explain concepts clearly for ${experience} traders
3. Reference recent market data and bot signals
4. Suggest risk management strategies
5. Be concise but comprehensive`;
  }

  /**
   * Get AI-optimized context
   */
  getContext() {
    return {
      user: this.state.user,
      marketData: this.state.marketData,
      botState: this.state.botState,
      systemPrompt: this.getSystemPrompt(),
      conversationHistory: this.state.sessionContext.conversationHistory,
    };
  }

  /**
   * Add trading signal
   */
  addSignal(symbol: string, action: "buy" | "sell" | "hold"): void {
    this.state.botState.recentSignals.push({
      symbol,
      action,
      date: Date.now(),
    });

    // Keep last 20 signals
    if (this.state.botState.recentSignals.length > 20) {
      this.state.botState.recentSignals.shift();
    }
  }

  /**
   * Update bot status
   */
  setBotActive(botId: string, active: boolean): void {
    if (active && !this.state.botState.activeBots.includes(botId)) {
      this.state.botState.activeBots.push(botId);
    } else if (!active) {
      this.state.botState.activeBots = this.state.botState.activeBots.filter(
        (id) => id !== botId,
      );
    }
  }

  /**
   * Get state snapshot
   */
  getState(): EnvironmentState {
    return { ...this.state };
  }

  /**
   * Start auto-update of market data
   */
  startAutoUpdate(interval: number = 30000): void {
    void this.fetchLiveMarketData().catch((error) => {
      console.warn(
        "[SmartEnv] Initial live market update failed:",
        error instanceof Error ? error.message : String(error),
      );
    });

    this.updateInterval = setInterval(() => {
      void this.fetchLiveMarketData().catch((error) => {
        console.warn(
          "[SmartEnv] Auto-update failed:",
          error instanceof Error ? error.message : String(error),
        );
      });
    }, interval);
  }

  /**
   * Stop auto-update
   */
  stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoUpdate();
  }
}

export { SmartEnvironment };
