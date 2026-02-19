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

type IntelligenceSnapshot = {
  status: IntelligenceProviderStatus;
  overview: IntelligenceOverview;
  flowTape: FlowTrade[];
  darkPoolTape: DarkPoolTrade[];
  politicsTape: PoliticalTrade[];
  cryptoTape: CryptoFlowTrade[];
  news: IntelligenceNewsItem[];
};

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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
      generatedAt: new Date().toISOString(),
    },
    overview: getIntelligenceOverview(),
    flowTape: getFlowTape(),
    darkPoolTape: getDarkPoolTape(),
    politicsTape: getPoliticsTape(),
    cryptoTape: getCryptoTape(),
    news: getIntelligenceNews(),
  };
}

function toVendorSnapshot(): IntelligenceSnapshot {
  const vendor = resolveVendorName();
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
      // Until a direct paid feed is attached, the adapter runs deterministic simulation.
      simulated: !hasVendorCredentials(),
      generatedAt: new Date().toISOString(),
    },
    overview,
    flowTape,
    darkPoolTape,
    politicsTape,
    cryptoTape,
    news,
  };
}

export function getIntelligenceSnapshot(): IntelligenceSnapshot {
  return resolveProviderSource() === "vendor" ? toVendorSnapshot() : toMockSnapshot();
}

export function getIntelligenceProviderStatus() {
  return getIntelligenceSnapshot().status;
}
