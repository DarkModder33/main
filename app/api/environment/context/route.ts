/**
 * GET /api/environment/context
 * Get current environment context (market data, AI system prompt, etc.)
 */

import { enforceRateLimit, enforceTrustedOrigin, sanitizePlainText } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

type QuoteSnapshot = {
  source: string;
  symbol: string;
  price: number;
  change24h: number;
  updatedAt: string;
};

type ConvergedQuote = {
  symbol: string;
  price: number;
  change24h: number;
  providers: string[];
  divergenceBps: number;
  confidence: "high" | "medium" | "low";
  updatedAt: string;
};

const TRACKED_SYMBOLS = ["SOL", "USDC", "RAY", "BTC", "ETH"] as const;

const BINANCE_PAIR_BY_SYMBOL: Record<string, string> = {
  SOL: "SOLUSDT",
  USDC: "USDCUSDT",
  RAY: "RAYUSDT",
  BTC: "BTCUSDT",
  ETH: "ETHUSDT",
};

const COINGECKO_ID_BY_SYMBOL: Record<string, string> = {
  SOL: "solana",
  USDC: "usd-coin",
  RAY: "raydium",
  BTC: "bitcoin",
  ETH: "ethereum",
};

function withTimeout<T>(promise: Promise<T>, timeoutMs = 3200): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function fetchJson(url: string) {
  const response = await withTimeout(fetch(url, { cache: "no-store" }));
  if (!response.ok) {
    throw new Error(`http_${response.status}`);
  }
  return response.json() as Promise<unknown>;
}

function safePrice(value: unknown) {
  const parsed = Number.parseFloat(String(value ?? "NaN"));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function safePercent(value: unknown) {
  const parsed = Number.parseFloat(String(value ?? "NaN"));
  return Number.isFinite(parsed) ? parsed : 0;
}

async function fetchBinanceSnapshots() {
  const pairs = TRACKED_SYMBOLS.map((symbol) => BINANCE_PAIR_BY_SYMBOL[symbol]);
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(pairs))}`;
  const payload = await fetchJson(url);

  if (!Array.isArray(payload)) {
    throw new Error("binance_invalid_payload");
  }

  const bySymbol: Record<string, QuoteSnapshot> = {};

  for (const row of payload) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const pair = String((row as Record<string, unknown>).symbol || "").toUpperCase();
    const symbol = Object.entries(BINANCE_PAIR_BY_SYMBOL).find(([, value]) => value === pair)?.[0];
    if (!symbol) {
      continue;
    }

    const price = safePrice((row as Record<string, unknown>).lastPrice);
    if (price === null) {
      continue;
    }

    bySymbol[symbol] = {
      source: "binance",
      symbol,
      price,
      change24h: safePercent((row as Record<string, unknown>).priceChangePercent),
      updatedAt: new Date().toISOString(),
    };
  }

  return bySymbol;
}

async function fetchCoinGeckoSnapshots() {
  const ids = TRACKED_SYMBOLS.map((symbol) => COINGECKO_ID_BY_SYMBOL[symbol]).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
    ids,
  )}&vs_currencies=usd&include_24hr_change=true&precision=full`;
  const payload = await fetchJson(url);

  if (!payload || typeof payload !== "object") {
    throw new Error("coingecko_invalid_payload");
  }

  const bySymbol: Record<string, QuoteSnapshot> = {};

  for (const symbol of TRACKED_SYMBOLS) {
    const id = COINGECKO_ID_BY_SYMBOL[symbol];
    const row = (payload as Record<string, unknown>)[id];
    if (!row || typeof row !== "object") {
      continue;
    }

    const map = row as Record<string, unknown>;
    const price = safePrice(map.usd);
    if (price === null) {
      continue;
    }

    bySymbol[symbol] = {
      source: "coingecko",
      symbol,
      price,
      change24h: safePercent(map.usd_24h_change),
      updatedAt: new Date().toISOString(),
    };
  }

  return bySymbol;
}

function roundTo(value: number, decimals: number) {
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
}

function median(values: number[]) {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function toConfidence(providerCount: number, divergenceBps: number): "high" | "medium" | "low" {
  if (providerCount >= 2 && divergenceBps <= 120) {
    return "high";
  }
  if (providerCount >= 1 && divergenceBps <= 400) {
    return "medium";
  }
  return "low";
}

function convergeQuotes(records: QuoteSnapshot[]) {
  if (records.length === 0) {
    return null;
  }

  const prices = records.map((record) => record.price);
  const changes = records.map((record) => record.change24h);
  const price = median(prices);
  const change24h = median(changes);

  if (price === null || change24h === null) {
    return null;
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const midpoint = (min + max) / 2;
  const divergenceBps = midpoint > 0 ? Math.abs((max - min) / midpoint) * 10_000 : 0;

  const updatedAt = records
    .map((record) => record.updatedAt)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] || new Date().toISOString();

  return {
    price: roundTo(price, 6),
    change24h: roundTo(change24h, 4),
    divergenceBps: roundTo(divergenceBps, 2),
    providers: Array.from(new Set(records.map((record) => record.source))),
    updatedAt,
  };
}

async function buildConvergedMarketData() {
  const startedAt = Date.now();
  const generatedAt = new Date().toISOString();

  const [binance, coingecko] = await Promise.allSettled([
    fetchBinanceSnapshots(),
    fetchCoinGeckoSnapshots(),
  ]);

  const providerStatus: Record<string, { ok: boolean; error?: string }> = {
    binance: {
      ok: binance.status === "fulfilled",
      error: binance.status === "rejected" ? String(binance.reason) : undefined,
    },
    coingecko: {
      ok: coingecko.status === "fulfilled",
      error: coingecko.status === "rejected" ? String(coingecko.reason) : undefined,
    },
  };

  const quotesBySymbol: Record<string, ConvergedQuote> = {};

  for (const symbol of TRACKED_SYMBOLS) {
    const records: QuoteSnapshot[] = [];

    if (binance.status === "fulfilled" && binance.value[symbol]) {
      records.push(binance.value[symbol]);
    }
    if (coingecko.status === "fulfilled" && coingecko.value[symbol]) {
      records.push(coingecko.value[symbol]);
    }

    const converged = convergeQuotes(records);
    if (!converged) {
      continue;
    }

    quotesBySymbol[symbol] = {
      symbol,
      price: converged.price,
      change24h: converged.change24h,
      divergenceBps: converged.divergenceBps,
      providers: converged.providers,
      confidence: toConfidence(converged.providers.length, converged.divergenceBps),
      updatedAt: converged.updatedAt,
    };
  }

  const convergedSymbols = Object.keys(quotesBySymbol);
  const coverage = TRACKED_SYMBOLS.length > 0 ? convergedSymbols.length / TRACKED_SYMBOLS.length : 0;
  const averageDivergenceBps =
    convergedSymbols.length > 0
      ? roundTo(
          convergedSymbols.reduce((acc, symbol) => acc + quotesBySymbol[symbol].divergenceBps, 0) /
            convergedSymbols.length,
          2,
        )
      : 0;

  return {
    generatedAt,
    latencyMs: Date.now() - startedAt,
    isDegraded: convergedSymbols.length === 0 || convergedSymbols.length < 3,
    coverage,
    averageDivergenceBps,
    trackedSymbols: [...TRACKED_SYMBOLS],
    providerStatus,
    quotesBySymbol,
  };
}

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "environment:context:get",
    max: 60,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  try {
    const sessionId = sanitizePlainText(request.nextUrl.searchParams.get("sessionId") || "", 80);

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "sessionId query parameter is required" },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const marketConvergence = await buildConvergedMarketData();

    const marketData = Object.fromEntries(
      Object.entries(marketConvergence.quotesBySymbol).map(([symbol, quote]) => [
        symbol,
        {
          price: quote.price,
          change24h: quote.change24h,
        },
      ]),
    );

    const trainingRecords = Object.values(marketConvergence.quotesBySymbol).map((quote) => ({
      type: "market_quote",
      symbol: quote.symbol,
      priceUsd: quote.price,
      change24hPercent: quote.change24h,
      confidence: quote.confidence,
      divergenceBps: quote.divergenceBps,
      providers: quote.providers,
      timestamp: quote.updatedAt,
    }));

    const context = {
      sessionId,
      user: {
        experience: "intermediate",
        riskTolerance: "moderate",
        portfolio: {
          totalAssets: 50.5,
          allocation: {
            SOL: 40,
            USDC: 35,
            RAY: 20,
            OTHER: 5,
          },
        },
      },
      marketData,
      marketFreshness: {
        generatedAt: marketConvergence.generatedAt,
        latencyMs: marketConvergence.latencyMs,
        isDegraded: marketConvergence.isDegraded,
        coverage: marketConvergence.coverage,
        averageDivergenceBps: marketConvergence.averageDivergenceBps,
        trackedSymbols: marketConvergence.trackedSymbols,
        providerStatus: marketConvergence.providerStatus,
      },
      marketConvergence: marketConvergence.quotesBySymbol,
      trainingSnapshot: {
        schema: "tradehax.market.v1",
        generatedAt: marketConvergence.generatedAt,
        records: trainingRecords,
      },
      activeBots: ["bot-scalping-01", "bot-swing-02"],
      recentSignals: [
        { symbol: "SOL/USDC", action: "buy", confidence: 0.85 },
        { symbol: "RAY/USDC", action: "hold", confidence: 0.72 },
      ],
      systemPrompt: `You are TradeHax AI Assistant specialized in multi-market, chain-agnostic trading intelligence. User is intermediate trader with moderate risk tolerance. Help with trading decisions, bot management, and market analysis. Reference converged live market data with source confidence and divergence metadata. If marketFreshness.isDegraded is true, explicitly mention uncertainty and avoid overconfident exact-price claims.`,
    };

    return NextResponse.json({
      ok: true,
      context,
      timestamp: new Date().toISOString(),
    }, { headers: rateLimit.headers });
  } catch (error) {
    console.error("Context fetch error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Fetch failed",
      },
      { status: 500 },
    );
  }
}
