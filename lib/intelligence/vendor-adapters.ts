import {
  DarkPoolTrade,
  FlowTrade,
  IntelligenceNewsItem,
  PoliticalTrade,
} from "@/lib/intelligence/types";

type AdapterInput = {
  baseFlowTape: FlowTrade[];
  baseDarkPoolTape: DarkPoolTrade[];
  basePoliticsTape: PoliticalTrade[];
  baseNews: IntelligenceNewsItem[];
};

type AdapterResult = {
  flowTape?: FlowTrade[];
  darkPoolTape?: DarkPoolTrade[];
  politicsTape?: PoliticalTrade[];
  news?: IntelligenceNewsItem[];
  liveData: boolean;
  detail: string;
};

type VendorAdapter = (input: AdapterInput) => Promise<AdapterResult | null>;

type UnknownRecord = Record<string, unknown>;

function toRecord(value: unknown): UnknownRecord {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as UnknownRecord;
}

function pickArray(payload: unknown, candidateKeys: string[]) {
  if (Array.isArray(payload)) return payload;
  const obj = toRecord(payload);
  for (const key of candidateKeys) {
    const value = obj[key];
    if (Array.isArray(value)) return value;
  }
  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) return value;
  }
  return [] as unknown[];
}

function asNumber(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asInt(value: unknown, fallback: number) {
  return Math.max(0, Math.round(asNumber(value, fallback)));
}

function asString(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return fallback;
}

function normalizeSymbol(value: unknown) {
  return asString(value, "")
    .toUpperCase()
    .replace(/[^A-Z0-9/_.\-]/g, "")
    .slice(0, 24);
}

function normalizeIsoTimestamp(value: unknown) {
  const raw = asString(value, "");
  const parsed = Date.parse(raw);
  if (Number.isFinite(parsed)) {
    return new Date(parsed).toISOString();
  }
  return new Date().toISOString();
}

function normalizeDate(value: unknown, fallback: string) {
  const raw = asString(value, "");
  if (!raw) return fallback;
  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return new Date(parsed).toISOString().slice(0, 10);
}

function toImpactLevel(value: unknown): "high" | "medium" | "low" {
  const normalized = asString(value, "").toLowerCase();
  if (normalized.includes("high") || normalized === "3") return "high";
  if (normalized.includes("medium") || normalized === "2") return "medium";
  if (normalized.includes("low") || normalized === "1") return "low";
  return "medium";
}

function toNewsCategory(value: unknown): IntelligenceNewsItem["category"] {
  const normalized = asString(value, "").toLowerCase();
  if (normalized.includes("earn")) return "earnings";
  if (normalized.includes("macro") || normalized.includes("fed")) return "macro";
  if (normalized.includes("crypto") || normalized.includes("chain")) return "crypto";
  if (normalized.includes("policy") || normalized.includes("regulat")) return "policy";
  return "technical";
}

function toFlowSide(value: unknown): FlowTrade["side"] {
  const normalized = asString(value, "").toLowerCase();
  return normalized.includes("put") || normalized === "p" ? "put" : "call";
}

function toFlowSentiment(value: unknown): FlowTrade["sentiment"] {
  const normalized = asString(value, "").toLowerCase();
  if (normalized.includes("bear")) return "bearish";
  if (normalized.includes("bull")) return "bullish";
  return "neutral";
}

function toDarkPoolSide(value: unknown): DarkPoolTrade["sideEstimate"] {
  const normalized = asString(value, "").toLowerCase();
  if (normalized.includes("buy")) return "buy";
  if (normalized.includes("sell")) return "sell";
  return "mixed";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function requestJson(url: string, options: RequestInit = {}, timeoutMs = 8_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return (await response.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

function mergeFlowTape(baseFlowTape: FlowTrade[], incoming: FlowTrade[]) {
  const baseBySymbol = new Map(baseFlowTape.map((item) => [item.symbol, item]));
  const merged: FlowTrade[] = [];
  for (const item of incoming) {
    const fallback = baseBySymbol.get(item.symbol);
    merged.push({
      ...fallback,
      ...item,
      id: item.id || fallback?.id || `flow_vendor_${item.symbol}`,
      symbol: item.symbol || fallback?.symbol || "SPY",
    } as FlowTrade);
  }
  return merged.length > 0 ? merged : baseFlowTape;
}

function mergeDarkPoolTape(baseDarkPoolTape: DarkPoolTrade[], incoming: DarkPoolTrade[]) {
  const baseBySymbol = new Map(baseDarkPoolTape.map((item) => [item.symbol, item]));
  const merged: DarkPoolTrade[] = [];
  for (const item of incoming) {
    const fallback = baseBySymbol.get(item.symbol);
    merged.push({
      ...fallback,
      ...item,
      id: item.id || fallback?.id || `dark_vendor_${item.symbol}`,
      symbol: item.symbol || fallback?.symbol || "SPY",
    } as DarkPoolTrade);
  }
  return merged.length > 0 ? merged : baseDarkPoolTape;
}

function mergeNews(baseNews: IntelligenceNewsItem[], incoming: IntelligenceNewsItem[]) {
  if (incoming.length === 0) {
    return baseNews;
  }
  return incoming.slice(0, 40);
}

async function unusualWhalesAdapter(input: AdapterInput): Promise<AdapterResult | null> {
  const apiKey = process.env.UNUSUALWHALES_API_KEY;
  if (!apiKey) return null;

  const baseUrl = asString(process.env.UNUSUALWHALES_BASE_URL, "https://api.unusualwhales.com");
  const flowEndpoint = asString(process.env.UNUSUALWHALES_FLOW_ENDPOINT, "");
  const darkPoolEndpoint = asString(process.env.UNUSUALWHALES_DARK_POOL_ENDPOINT, "");
  const newsEndpoint = asString(process.env.UNUSUALWHALES_NEWS_ENDPOINT, "");

  if (!flowEndpoint && !darkPoolEndpoint && !newsEndpoint) {
    return {
      liveData: false,
      detail:
        "UNUSUALWHALES_API_KEY set but endpoint env vars are missing. Configure *_FLOW_ENDPOINT, *_DARK_POOL_ENDPOINT, *_NEWS_ENDPOINT.",
    };
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  let flowTape = input.baseFlowTape;
  let darkPoolTape = input.baseDarkPoolTape;
  let news = input.baseNews;
  let liveData = false;
  const detailParts: string[] = [];

  if (flowEndpoint) {
    const payload = await requestJson(`${baseUrl}${flowEndpoint}`, { headers });
    const rows = pickArray(payload, ["data", "results", "items", "flow"]);
    const mapped = rows
      .map((row, index) => {
        const data = toRecord(row);
        const symbol = normalizeSymbol(data.symbol ?? data.ticker ?? data.underlying);
        if (!symbol) return null;
        return {
          id: asString(data.id, `uw_flow_${symbol}_${index}`),
          symbol,
          side: toFlowSide(data.side ?? data.option_type ?? data.contract_type),
          premiumUsd: asInt(data.premium ?? data.notional ?? data.total_premium, 500_000),
          size: asInt(data.size ?? data.contracts ?? data.volume, 200),
          strike: asNumber(data.strike ?? data.strike_price, 0),
          spotPrice: asNumber(data.spot_price ?? data.underlying_price, 0),
          expiry: normalizeDate(data.expiry ?? data.expiration, "2026-12-18"),
          sentiment: toFlowSentiment(data.sentiment),
          sweep: asBoolean(data.sweep ?? data.is_sweep, false),
          unusualScore: clamp(asInt(data.unusual_score ?? data.score ?? data.rank, 75), 40, 99),
          openedAt: normalizeIsoTimestamp(data.timestamp ?? data.executed_at ?? data.created_at),
        } satisfies FlowTrade;
      })
      .filter(Boolean) as FlowTrade[];

    if (mapped.length > 0) {
      flowTape = mergeFlowTape(input.baseFlowTape, mapped);
      liveData = true;
      detailParts.push(`flow:${mapped.length}`);
    }
  }

  if (darkPoolEndpoint) {
    const payload = await requestJson(`${baseUrl}${darkPoolEndpoint}`, { headers });
    const rows = pickArray(payload, ["data", "results", "items", "dark_pool"]);
    const mapped = rows
      .map((row, index) => {
        const data = toRecord(row);
        const symbol = normalizeSymbol(data.symbol ?? data.ticker ?? data.underlying);
        if (!symbol) return null;
        return {
          id: asString(data.id, `uw_dark_${symbol}_${index}`),
          symbol,
          notionalUsd: asInt(data.notional ?? data.premium ?? data.value, 10_000_000),
          size: asInt(data.size ?? data.shares ?? data.volume, 10_000),
          price: asNumber(data.price ?? data.execution_price, 0),
          sideEstimate: toDarkPoolSide(data.side ?? data.side_estimate),
          venue: asString(data.venue ?? data.exchange, "UW"),
          unusualScore: clamp(asInt(data.unusual_score ?? data.score, 70), 35, 99),
          executedAt: normalizeIsoTimestamp(data.timestamp ?? data.executed_at ?? data.created_at),
        } satisfies DarkPoolTrade;
      })
      .filter(Boolean) as DarkPoolTrade[];

    if (mapped.length > 0) {
      darkPoolTape = mergeDarkPoolTape(input.baseDarkPoolTape, mapped);
      liveData = true;
      detailParts.push(`dark:${mapped.length}`);
    }
  }

  if (newsEndpoint) {
    const payload = await requestJson(`${baseUrl}${newsEndpoint}`, { headers });
    const rows = pickArray(payload, ["data", "results", "items", "news"]);
    const mapped = rows
      .map((row, index) => {
        const data = toRecord(row);
        const title = asString(data.title ?? data.headline, "");
        if (!title) return null;
        const symbol = normalizeSymbol(data.symbol ?? data.ticker ?? data.asset);
        return {
          id: asString(data.id, `uw_news_${symbol || "GEN"}_${index}`),
          title,
          symbol: symbol || "SPY",
          impact: toImpactLevel(data.impact ?? data.severity),
          category: toNewsCategory(data.category ?? data.topic),
          summary: asString(data.summary ?? data.description, title),
          publishedAt: normalizeIsoTimestamp(data.published_at ?? data.timestamp),
          source: "Unusual Whales",
        } satisfies IntelligenceNewsItem;
      })
      .filter(Boolean) as IntelligenceNewsItem[];

    if (mapped.length > 0) {
      news = mergeNews(input.baseNews, mapped);
      liveData = true;
      detailParts.push(`news:${mapped.length}`);
    }
  }

  return {
    flowTape,
    darkPoolTape,
    news,
    liveData,
    detail: detailParts.length > 0 ? detailParts.join(", ") : "No usable records returned.",
  };
}

async function polygonAdapter(input: AdapterInput): Promise<AdapterResult | null> {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) return null;

  const baseUrl = asString(process.env.POLYGON_BASE_URL, "https://api.polygon.io");
  const symbols = Array.from(new Set(input.baseFlowTape.map((item) => item.symbol))).slice(0, 50);
  if (symbols.length === 0) {
    return null;
  }

  let flowTape = input.baseFlowTape;
  let darkPoolTape = input.baseDarkPoolTape;
  let news = input.baseNews;
  let liveData = false;
  const details: string[] = [];

  try {
    const snapshotUrl =
      `${baseUrl}/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${encodeURIComponent(
        symbols.join(","),
      )}&apiKey=${encodeURIComponent(apiKey)}`;
    const snapshotPayload = await requestJson(snapshotUrl);
    const tickerRows = pickArray(snapshotPayload, ["tickers", "results", "data"]);
    const tickerMap = new Map<string, number>();
    for (const raw of tickerRows) {
      const row = toRecord(raw);
      const symbol = normalizeSymbol(row.ticker ?? row.symbol);
      if (!symbol) continue;
      const day = toRecord(row.day);
      const lastTrade = toRecord(row.lastTrade ?? row.last_trade);
      const price = asNumber(lastTrade.p ?? day.c ?? day.close, 0);
      if (price > 0) {
        tickerMap.set(symbol, price);
      }
    }

    if (tickerMap.size > 0) {
      flowTape = input.baseFlowTape.map((trade) =>
        tickerMap.has(trade.symbol) ? { ...trade, spotPrice: tickerMap.get(trade.symbol) || trade.spotPrice } : trade,
      );
      darkPoolTape = input.baseDarkPoolTape.map((trade) =>
        tickerMap.has(trade.symbol) ? { ...trade, price: tickerMap.get(trade.symbol) || trade.price } : trade,
      );
      liveData = true;
      details.push(`snapshots:${tickerMap.size}`);
    }
  } catch (error) {
    details.push(`snapshot_error:${error instanceof Error ? error.message : "unknown"}`);
  }

  try {
    const newsUrl =
      `${baseUrl}/v2/reference/news?limit=20&order=desc&sort=published_utc&apiKey=${encodeURIComponent(apiKey)}`;
    const newsPayload = await requestJson(newsUrl);
    const newsRows = pickArray(newsPayload, ["results", "data", "news"]);
    const mapped = newsRows
      .map((raw, index) => {
        const row = toRecord(raw);
        const title = asString(row.title, "");
        if (!title) return null;
        const symbolsField = row.tickers;
        const ticker =
          Array.isArray(symbolsField) && symbolsField.length > 0
            ? normalizeSymbol(symbolsField[0])
            : normalizeSymbol(row.symbol);
        const description = asString(row.description, title);
        const keywordText = `${title} ${description}`.toLowerCase();
        const impact: IntelligenceNewsItem["impact"] =
          keywordText.includes("beat") ||
          keywordText.includes("miss") ||
          keywordText.includes("guidance") ||
          keywordText.includes("sec")
            ? "high"
            : "medium";

        return {
          id: asString(row.id, `poly_news_${ticker || "GEN"}_${index}`),
          title,
          symbol: ticker || "SPY",
          impact,
          category: toNewsCategory(
            row.article_url ?? row.keywords ?? toRecord(row.publisher).name,
          ),
          summary: description.slice(0, 220),
          publishedAt: normalizeIsoTimestamp(row.published_utc),
          source: "Polygon",
        } satisfies IntelligenceNewsItem;
      })
      .filter(Boolean) as IntelligenceNewsItem[];

    if (mapped.length > 0) {
      news = mergeNews(input.baseNews, mapped);
      liveData = true;
      details.push(`news:${mapped.length}`);
    }
  } catch (error) {
    details.push(`news_error:${error instanceof Error ? error.message : "unknown"}`);
  }

  return {
    flowTape,
    darkPoolTape,
    news,
    liveData,
    detail: details.join(", "),
  };
}

async function bloombergAdapter(input: AdapterInput): Promise<AdapterResult | null> {
  const hasAuth = Boolean(process.env.BLOOMBERG_API_KEY || process.env.BPIPE_TOKEN);
  if (!hasAuth) return null;

  const baseUrl = asString(process.env.BLOOMBERG_PROXY_BASE_URL, "");
  const flowEndpoint = asString(process.env.BLOOMBERG_FLOW_ENDPOINT, "");
  const darkPoolEndpoint = asString(process.env.BLOOMBERG_DARK_POOL_ENDPOINT, "");
  const newsEndpoint = asString(process.env.BLOOMBERG_NEWS_ENDPOINT, "");

  if (!baseUrl || (!flowEndpoint && !darkPoolEndpoint && !newsEndpoint)) {
    return {
      liveData: false,
      detail:
        "Bloomberg credentials detected but proxy endpoint env vars missing (BLOOMBERG_PROXY_BASE_URL and BLOOMBERG_*_ENDPOINT).",
    };
  }

  const headers = {
    "Content-Type": "application/json",
    "X-API-Key": asString(process.env.BLOOMBERG_API_KEY, asString(process.env.BPIPE_TOKEN, "")),
  };

  let flowTape = input.baseFlowTape;
  let darkPoolTape = input.baseDarkPoolTape;
  let news = input.baseNews;
  let liveData = false;
  const details: string[] = [];

  if (flowEndpoint) {
    const payload = await requestJson(`${baseUrl}${flowEndpoint}`, { headers });
    const rows = pickArray(payload, ["data", "results", "flow"]);
    const mapped = rows
      .map((raw, index) => {
        const row = toRecord(raw);
        const symbol = normalizeSymbol(row.symbol ?? row.ticker);
        if (!symbol) return null;
        return {
          id: asString(row.id, `bbg_flow_${symbol}_${index}`),
          symbol,
          side: toFlowSide(row.side ?? row.option_type),
          premiumUsd: asInt(row.premium ?? row.notional, 1_000_000),
          size: asInt(row.size ?? row.volume, 300),
          strike: asNumber(row.strike, 0),
          spotPrice: asNumber(row.spot ?? row.price, 0),
          expiry: normalizeDate(row.expiry ?? row.expiration, "2026-12-18"),
          sentiment: toFlowSentiment(row.sentiment),
          sweep: asBoolean(row.sweep, false),
          unusualScore: clamp(asInt(row.unusual_score ?? row.score, 80), 40, 99),
          openedAt: normalizeIsoTimestamp(row.timestamp),
        } satisfies FlowTrade;
      })
      .filter(Boolean) as FlowTrade[];
    if (mapped.length > 0) {
      flowTape = mergeFlowTape(input.baseFlowTape, mapped);
      liveData = true;
      details.push(`flow:${mapped.length}`);
    }
  }

  if (darkPoolEndpoint) {
    const payload = await requestJson(`${baseUrl}${darkPoolEndpoint}`, { headers });
    const rows = pickArray(payload, ["data", "results", "dark_pool"]);
    const mapped = rows
      .map((raw, index) => {
        const row = toRecord(raw);
        const symbol = normalizeSymbol(row.symbol ?? row.ticker);
        if (!symbol) return null;
        return {
          id: asString(row.id, `bbg_dark_${symbol}_${index}`),
          symbol,
          notionalUsd: asInt(row.notional ?? row.value, 20_000_000),
          size: asInt(row.size ?? row.shares, 30_000),
          price: asNumber(row.price ?? row.execution_price, 0),
          sideEstimate: toDarkPoolSide(row.side ?? row.side_estimate),
          venue: asString(row.venue ?? row.exchange, "BBG"),
          unusualScore: clamp(asInt(row.unusual_score ?? row.score, 78), 35, 99),
          executedAt: normalizeIsoTimestamp(row.timestamp),
        } satisfies DarkPoolTrade;
      })
      .filter(Boolean) as DarkPoolTrade[];
    if (mapped.length > 0) {
      darkPoolTape = mergeDarkPoolTape(input.baseDarkPoolTape, mapped);
      liveData = true;
      details.push(`dark:${mapped.length}`);
    }
  }

  if (newsEndpoint) {
    const payload = await requestJson(`${baseUrl}${newsEndpoint}`, { headers });
    const rows = pickArray(payload, ["data", "results", "news"]);
    const mapped = rows
      .map((raw, index) => {
        const row = toRecord(raw);
        const title = asString(row.title ?? row.headline, "");
        if (!title) return null;
        const symbol = normalizeSymbol(row.symbol ?? row.ticker);
        return {
          id: asString(row.id, `bbg_news_${symbol || "GEN"}_${index}`),
          title,
          symbol: symbol || "SPY",
          impact: toImpactLevel(row.impact ?? row.severity),
          category: toNewsCategory(row.category ?? row.topic),
          summary: asString(row.summary ?? row.description, title),
          publishedAt: normalizeIsoTimestamp(row.published_at ?? row.timestamp),
          source: "Bloomberg",
        } satisfies IntelligenceNewsItem;
      })
      .filter(Boolean) as IntelligenceNewsItem[];

    if (mapped.length > 0) {
      news = mergeNews(input.baseNews, mapped);
      liveData = true;
      details.push(`news:${mapped.length}`);
    }
  }

  return {
    flowTape,
    darkPoolTape,
    politicsTape: input.basePoliticsTape,
    news,
    liveData,
    detail: details.join(", "),
  };
}

function resolveVendorAlias(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized.includes("unusual")) return "unusualwhales";
  if (normalized.includes("polygon")) return "polygon";
  if (normalized.includes("bloomberg") || normalized.includes("bpipe")) return "bloomberg";
  return normalized;
}

export function resolveVendorAdapter(vendor: string): VendorAdapter | null {
  const normalized = resolveVendorAlias(vendor);
  if (normalized === "unusualwhales") return unusualWhalesAdapter;
  if (normalized === "polygon") return polygonAdapter;
  if (normalized === "bloomberg") return bloombergAdapter;
  return null;
}
