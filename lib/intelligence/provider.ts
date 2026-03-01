import {
  getCryptoTape,
  getDarkPoolTape,
  getFlowTape,
  getIntelligenceNews,
  getIntelligenceOverview,
  getPoliticsTape,
} from "@/lib/intelligence/mock-data";
import {
  CryptoFlowTrade,
  DarkPoolTrade,
  FlowTrade,
  IntelligenceNewsItem,
  IntelligenceOverview,
  IntelligenceProviderStatus,
  PoliticalTrade,
} from "@/lib/intelligence/types";
import {
  applyLiveOverlay,
  ensureLiveIngestion,
  getLiveIngestionStatus,
} from "@/lib/intelligence/live-ingestion";
import { recordProviderMetric } from "@/lib/intelligence/metrics";
import { resolveVendorAdapter } from "@/lib/intelligence/vendor-adapters";

type IntelligenceSnapshot = {
  status: IntelligenceProviderStatus;
  overview: IntelligenceOverview;
  flowTape: FlowTrade[];
  darkPoolTape: DarkPoolTrade[];
  politicsTape: PoliticalTrade[];
  cryptoTape: CryptoFlowTrade[];
  news: IntelligenceNewsItem[];
};

type SnapshotCacheEntry = {
  key: string;
  expiresAt: number;
  snapshot: IntelligenceSnapshot;
};

function getSnapshotCacheRef() {
  const globalRef = globalThis as typeof globalThis & {
    __TRADEHAX_INTELLIGENCE_SNAPSHOT_CACHE__?: SnapshotCacheEntry | null;
  };
  if (!("__TRADEHAX_INTELLIGENCE_SNAPSHOT_CACHE__" in globalRef)) {
    globalRef.__TRADEHAX_INTELLIGENCE_SNAPSHOT_CACHE__ = null;
  }
  return globalRef;
}

function hasVendorCredentials() {
  return Boolean(
    process.env.UNUSUALWHALES_API_KEY ||
      process.env.BLOOMBERG_API_KEY ||
      process.env.BPIPE_TOKEN ||
      process.env.POLYGON_API_KEY ||
      process.env.FINNHUB_API_KEY,
  );
}

function resolveVendorName() {
  const configured = String(process.env.INTELLIGENCE_VENDOR_NAME || "").trim();
  if (configured) {
    return configured;
  }
  if (process.env.UNUSUALWHALES_API_KEY) return "unusualwhales";
  if (process.env.BLOOMBERG_API_KEY || process.env.BPIPE_TOKEN) return "bloomberg";
  if (process.env.POLYGON_API_KEY) return "polygon";
  if (process.env.FINNHUB_API_KEY) return "finnhub";
  return "mock";
}

function resolveProviderSource() {
  const forced = String(
    process.env.TRADEHAX_INTELLIGENCE_PROVIDER || process.env.INTELLIGENCE_DATA_PROVIDER || "",
  )
    .trim()
    .toLowerCase();

  if (forced === "mock" || forced === "vendor") {
    return forced as "mock" | "vendor";
  }

  return hasVendorCredentials() ? "vendor" : "mock";
}

function resolveCacheTtlMs() {
  const value = Number.parseInt(
    String(process.env.TRADEHAX_INTELLIGENCE_CACHE_MS || "15000"),
    10,
  );
  if (!Number.isFinite(value) || value < 1_000) {
    return 15_000;
  }
  return Math.min(120_000, value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function asString(value: unknown, fallback = "") {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

function asNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

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

async function fetchPublicEquityQuotes(symbols: string[]) {
  if (symbols.length === 0) {
    return new Map<string, { price: number; changePct: number }>();
  }

  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}`;
  const payload = await fetchJson(url);
  const rows = Array.isArray((payload as any)?.quoteResponse?.result)
    ? (payload as any).quoteResponse.result
    : [];

  const map = new Map<string, { price: number; changePct: number }>();
  for (const row of rows) {
    const symbol = asString(row?.symbol, "").toUpperCase();
    const price = asNumber(row?.regularMarketPrice, NaN);
    const changePct = asNumber(row?.regularMarketChangePercent, 0);
    if (!symbol || !Number.isFinite(price) || price <= 0) {
      continue;
    }
    map.set(symbol, { price, changePct });
  }

  return map;
}

async function fetchPublicCryptoQuotes() {
  const pairs = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(pairs))}`;
  const payload = await fetchJson(url);
  const rows = Array.isArray(payload) ? payload : [];

  const map = new Map<string, { price: number; changePct: number }>();
  for (const row of rows) {
    const pair = asString((row as any)?.symbol, "").toUpperCase();
    const symbol = pair.endsWith("USDT") ? pair.slice(0, -4) : pair;
    const price = asNumber((row as any)?.lastPrice, NaN);
    const changePct = asNumber((row as any)?.priceChangePercent, 0);
    if (!symbol || !Number.isFinite(price) || price <= 0) {
      continue;
    }
    map.set(symbol, { price, changePct });
  }

  return map;
}

function sentimentFromPct(changePct: number): FlowTrade["sentiment"] {
  if (changePct >= 1) return "bullish";
  if (changePct <= -1) return "bearish";
  return "neutral";
}

function scoreSeed(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100_000;
  }
  return hash / 100_000;
}

function jitter(value: number, seed: string, maxPct = 0.08) {
  const normalized = scoreSeed(seed);
  const direction = normalized >= 0.5 ? 1 : -1;
  const magnitude = (normalized % 0.5) * 2 * maxPct;
  return Math.round(value * (1 + direction * magnitude));
}

function toMockSnapshot(): IntelligenceSnapshot {
  return {
    status: {
      source: "mock",
      vendor: "mock",
      configured: false,
      simulated: true,
      mode: "simulated",
      detail: "Mock feed mode enabled.",
      generatedAt: new Date().toISOString(),
      cacheTtlMs: resolveCacheTtlMs(),
    },
    overview: getIntelligenceOverview(),
    flowTape: getFlowTape(),
    darkPoolTape: getDarkPoolTape(),
    politicsTape: getPoliticsTape(),
    cryptoTape: getCryptoTape(),
    news: getIntelligenceNews(),
  };
}

async function toPublicLiveSnapshot(): Promise<IntelligenceSnapshot | null> {
  const base = toMockSnapshot();
  const generatedAt = new Date().toISOString();

  try {
    const equitySymbols = Array.from(
      new Set([
        ...base.flowTape.map((item) => item.symbol),
        ...base.darkPoolTape.map((item) => item.symbol),
        ...base.news.map((item) => item.symbol),
      ]),
    ).slice(0, 25);

    const [equities, crypto] = await Promise.all([
      fetchPublicEquityQuotes(equitySymbols),
      fetchPublicCryptoQuotes(),
    ]);

    const flowTape = base.flowTape.map((trade) => {
      const quote = equities.get(trade.symbol);
      if (!quote) {
        return trade;
      }
      const spotPrice = Number.parseFloat(quote.price.toFixed(4));
      const premiumMultiplier = 1 + quote.changePct / 100;
      return {
        ...trade,
        spotPrice,
        premiumUsd: Math.max(10_000, Math.round(trade.premiumUsd * premiumMultiplier)),
        sentiment: sentimentFromPct(quote.changePct),
        openedAt: generatedAt,
      };
    });

    const darkPoolTape = base.darkPoolTape.map((trade) => {
      const quote = equities.get(trade.symbol);
      if (!quote) {
        return trade;
      }
      const price = Number.parseFloat(quote.price.toFixed(4));
      const notionalUsd = Math.round(Math.max(100_000, trade.size * price));
      return {
        ...trade,
        price,
        notionalUsd,
        unusualScore: clamp(Math.round(trade.unusualScore + quote.changePct / 2), 35, 99),
        executedAt: generatedAt,
      };
    });

    const cryptoTape = base.cryptoTape.map((trade) => {
      const baseAsset = trade.pair.split("/")[0]?.toUpperCase() || "";
      const quote = crypto.get(baseAsset);
      if (!quote) {
        return trade;
      }
      const momentum = Math.min(0.18, Math.abs(quote.changePct) / 100);
      const side = quote.changePct >= 0 ? "long" : "short";
      const confidence = clamp(0.58 + momentum, 0.5, 0.95);
      return {
        ...trade,
        side,
        confidence,
        notionalUsd: Math.max(50_000, Math.round(trade.notionalUsd * (1 + quote.changePct / 100))),
        triggeredAt: generatedAt,
      } as typeof trade;
    });

    const news = base.news.map((item) => {
      const quote = equities.get(item.symbol) || crypto.get(item.symbol);
      if (!quote) {
        return {
          ...item,
          publishedAt: generatedAt,
          source: item.source.includes("Public") ? item.source : `${item.source} + PublicFeeds`,
        };
      }
      const impact: IntelligenceNewsItem["impact"] =
        Math.abs(quote.changePct) >= 2.2 ? "high" : Math.abs(quote.changePct) >= 0.8 ? "medium" : "low";
      return {
        ...item,
        impact,
        summary: `${item.summary} Live move: ${quote.changePct >= 0 ? "+" : ""}${quote.changePct.toFixed(2)}%.`,
        publishedAt: generatedAt,
        source: item.source.includes("Public") ? item.source : `${item.source} + PublicFeeds`,
      };
    });

    return {
      status: {
        source: "mock",
        vendor: "public",
        configured: true,
        simulated: false,
        mode: "live",
        detail: "Public live feeds (Yahoo + Binance) merged without premium vendor keys.",
        generatedAt,
        cacheTtlMs: resolveCacheTtlMs(),
      },
      flowTape,
      darkPoolTape,
      politicsTape: base.politicsTape,
      cryptoTape,
      news,
      overview: buildOverview({
        flowTape,
        darkPoolTape,
        cryptoTape,
        news,
      }),
    };
  } catch {
    return null;
  }
}

function toVendorSimulatedSnapshot(vendor: string): IntelligenceSnapshot {
  const flowTape = getFlowTape().map((trade) => ({
    ...trade,
    premiumUsd: jitter(trade.premiumUsd, `${vendor}:${trade.id}:premium`, 0.14),
    unusualScore: clamp(
      Math.round(jitter(trade.unusualScore, `${vendor}:${trade.id}:score`, 0.1)),
      40,
      99,
    ),
  }));
  const darkPoolTape = getDarkPoolTape().map((trade) => ({
    ...trade,
    notionalUsd: jitter(trade.notionalUsd, `${vendor}:${trade.id}:notional`, 0.16),
    unusualScore: clamp(
      Math.round(jitter(trade.unusualScore, `${vendor}:${trade.id}:score`, 0.1)),
      35,
      99,
    ),
  }));
  const cryptoTape = getCryptoTape().map((trade) => ({
    ...trade,
    notionalUsd: jitter(trade.notionalUsd, `${vendor}:${trade.id}:notional`, 0.2),
    confidence: clamp(
      trade.confidence + (scoreSeed(`${vendor}:${trade.id}:confidence`) - 0.5) * 0.15,
      0.4,
      0.98,
    ),
  }));
  const politicsTape = getPoliticsTape();
  const news = getIntelligenceNews().map((item) => ({
    ...item,
    source: `${vendor}:${item.source}`,
  }));

  const overview: IntelligenceOverview = {
    generatedAt: new Date().toISOString(),
    optionsPremium24hUsd: flowTape.reduce((total, trade) => total + trade.premiumUsd, 0),
    darkPoolNotional24hUsd: darkPoolTape.reduce((total, trade) => total + trade.notionalUsd, 0),
    cryptoNotional24hUsd: cryptoTape.reduce((total, trade) => total + trade.notionalUsd, 0),
    highImpactNewsCount: news.filter((item) => item.impact === "high").length,
    unusualContractsCount: flowTape.filter((trade) => trade.unusualScore >= 80).length,
  };

  return {
    status: {
      source: "vendor",
      vendor,
      configured: hasVendorCredentials(),
      simulated: true,
      mode: "simulated",
      detail: "Vendor selected but live endpoints unavailable; using deterministic simulation.",
      generatedAt: new Date().toISOString(),
      cacheTtlMs: resolveCacheTtlMs(),
    },
    overview,
    flowTape,
    darkPoolTape,
    politicsTape,
    cryptoTape,
    news,
  };
}

function buildOverview(snapshot: Pick<IntelligenceSnapshot, "flowTape" | "darkPoolTape" | "cryptoTape" | "news">) {
  return {
    generatedAt: new Date().toISOString(),
    optionsPremium24hUsd: snapshot.flowTape.reduce((total, trade) => total + trade.premiumUsd, 0),
    darkPoolNotional24hUsd: snapshot.darkPoolTape.reduce(
      (total, trade) => total + trade.notionalUsd,
      0,
    ),
    cryptoNotional24hUsd: snapshot.cryptoTape.reduce((total, trade) => total + trade.notionalUsd, 0),
    highImpactNewsCount: snapshot.news.filter((item) => item.impact === "high").length,
    unusualContractsCount: snapshot.flowTape.filter((trade) => trade.unusualScore >= 80).length,
  } satisfies IntelligenceOverview;
}

function buildCacheKey() {
  const vendor = resolveVendorName().toLowerCase();
  const source = resolveProviderSource();
  const keyParts = [
    source,
    vendor,
    String(Boolean(process.env.UNUSUALWHALES_API_KEY)),
    String(Boolean(process.env.POLYGON_API_KEY)),
    String(Boolean(process.env.BLOOMBERG_API_KEY || process.env.BPIPE_TOKEN)),
  ];
  return keyParts.join(":");
}

function getCachedSnapshot(cacheKey: string) {
  const cacheRef = getSnapshotCacheRef();
  const cached = cacheRef.__TRADEHAX_INTELLIGENCE_SNAPSHOT_CACHE__;
  if (!cached) return null;
  if (cached.key !== cacheKey) return null;
  if (cached.expiresAt <= Date.now()) return null;
  return cached.snapshot;
}

function setCachedSnapshot(cacheKey: string, snapshot: IntelligenceSnapshot) {
  const cacheRef = getSnapshotCacheRef();
  cacheRef.__TRADEHAX_INTELLIGENCE_SNAPSHOT_CACHE__ = {
    key: cacheKey,
    snapshot,
    expiresAt: Date.now() + resolveCacheTtlMs(),
  };
}

async function toVendorSnapshot() {
  const vendor = resolveVendorName();
  const simulatedBase = toVendorSimulatedSnapshot(vendor);
  const adapter = resolveVendorAdapter(vendor);
  const startedAtMs = Date.now();

  if (!adapter) {
    recordProviderMetric({
      vendor,
      mode: "simulated",
      ok: false,
      latencyMs: Date.now() - startedAtMs,
      error: `No direct adapter available for vendor '${vendor}'.`,
    });
    return {
      ...simulatedBase,
      status: {
        ...simulatedBase.status,
        detail: `No direct adapter available for vendor '${vendor}'.`,
      },
    };
  }

  try {
    const adapterResult = await adapter({
      baseFlowTape: simulatedBase.flowTape,
      baseDarkPoolTape: simulatedBase.darkPoolTape,
      basePoliticsTape: simulatedBase.politicsTape,
      baseNews: simulatedBase.news,
    });

    if (!adapterResult) {
      recordProviderMetric({
        vendor,
        mode: "simulated",
        ok: true,
        latencyMs: Date.now() - startedAtMs,
      });
      return simulatedBase;
    }

    const mergedSnapshot: IntelligenceSnapshot = {
      flowTape: adapterResult.flowTape || simulatedBase.flowTape,
      darkPoolTape: adapterResult.darkPoolTape || simulatedBase.darkPoolTape,
      politicsTape: adapterResult.politicsTape || simulatedBase.politicsTape,
      cryptoTape: simulatedBase.cryptoTape,
      news: adapterResult.news || simulatedBase.news,
      overview: simulatedBase.overview,
      status: simulatedBase.status,
    };

    mergedSnapshot.overview = buildOverview({
      flowTape: mergedSnapshot.flowTape,
      darkPoolTape: mergedSnapshot.darkPoolTape,
      cryptoTape: mergedSnapshot.cryptoTape,
      news: mergedSnapshot.news,
    });

    const liveMode = adapterResult.liveData;
    mergedSnapshot.status = {
      ...simulatedBase.status,
      simulated: !liveMode,
      mode: liveMode ? "live" : "simulated",
      detail: adapterResult.detail || simulatedBase.status.detail,
      generatedAt: new Date().toISOString(),
      cacheTtlMs: resolveCacheTtlMs(),
    };

    recordProviderMetric({
      vendor,
      mode: liveMode ? "live" : "simulated",
      ok: true,
      latencyMs: Date.now() - startedAtMs,
    });

    return mergedSnapshot;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Vendor adapter failure.";
    recordProviderMetric({
      vendor,
      mode: "simulated",
      ok: false,
      latencyMs: Date.now() - startedAtMs,
      error: message,
    });
    return {
      ...simulatedBase,
      status: {
        ...simulatedBase.status,
        lastError: message,
      },
    };
  }
}

export async function getIntelligenceSnapshot(): Promise<IntelligenceSnapshot> {
  ensureLiveIngestion();
  const source = resolveProviderSource();
  const cacheKey = buildCacheKey();
  const cached = getCachedSnapshot(cacheKey);
  const liveStatus = getLiveIngestionStatus();

  if (cached && cached.status.generatedAt) {
    const overlay = applyLiveOverlay({
      flowTape: cached.flowTape,
      darkPoolTape: cached.darkPoolTape,
      news: cached.news,
    });
    return {
      ...cached,
      flowTape: overlay.flowTape,
      darkPoolTape: overlay.darkPoolTape,
      news: overlay.news,
      overview: buildOverview({
        flowTape: overlay.flowTape,
        darkPoolTape: overlay.darkPoolTape,
        cryptoTape: cached.cryptoTape,
        news: overlay.news,
      }),
      status: {
        ...cached.status,
        detail: [cached.status.detail, `ws:${liveStatus.connected ? "connected" : "idle"}`]
          .filter(Boolean)
          .join(" | "),
      },
    };
  }

  let baseSnapshot: IntelligenceSnapshot;
  if (source === "vendor") {
    baseSnapshot = await toVendorSnapshot();
  } else {
    const publicSnapshot = await toPublicLiveSnapshot();
    if (publicSnapshot) {
      baseSnapshot = publicSnapshot;
      recordProviderMetric({
        vendor: "public",
        mode: "live",
        ok: true,
        latencyMs: 1,
      });
    } else {
      baseSnapshot = toMockSnapshot();
      recordProviderMetric({
        vendor: "mock",
        mode: "simulated",
        ok: true,
        latencyMs: 1,
      });
    }
  }

  const overlay = applyLiveOverlay({
    flowTape: baseSnapshot.flowTape,
    darkPoolTape: baseSnapshot.darkPoolTape,
    news: baseSnapshot.news,
  });
  const snapshot: IntelligenceSnapshot = {
    ...baseSnapshot,
    flowTape: overlay.flowTape,
    darkPoolTape: overlay.darkPoolTape,
    news: overlay.news,
    overview: buildOverview({
      flowTape: overlay.flowTape,
      darkPoolTape: overlay.darkPoolTape,
      cryptoTape: baseSnapshot.cryptoTape,
      news: overlay.news,
    }),
    status: {
      ...baseSnapshot.status,
      detail: [
        baseSnapshot.status.detail,
        `ws:${liveStatus.connected ? "connected" : "idle"}`,
        `overlay_events:${overlay.overlayInfo.recentEvents}`,
      ]
        .filter(Boolean)
        .join(" | "),
    },
  };
  setCachedSnapshot(cacheKey, snapshot);
  return snapshot;
}

export async function getIntelligenceProviderStatus() {
  const snapshot = await getIntelligenceSnapshot();
  return snapshot.status;
}
