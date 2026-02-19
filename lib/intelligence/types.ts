export type IntelligenceSentiment = "bullish" | "bearish" | "neutral";

export type FlowTrade = {
  id: string;
  symbol: string;
  side: "call" | "put";
  premiumUsd: number;
  size: number;
  strike: number;
  spotPrice: number;
  expiry: string;
  sentiment: IntelligenceSentiment;
  sweep: boolean;
  unusualScore: number;
  openedAt: string;
};

export type DarkPoolTrade = {
  id: string;
  symbol: string;
  notionalUsd: number;
  size: number;
  price: number;
  sideEstimate: "buy" | "sell" | "mixed";
  venue: string;
  unusualScore: number;
  executedAt: string;
};

export type PoliticalTrade = {
  id: string;
  politician: string;
  chamber: "house" | "senate";
  symbol: string;
  action: "buy" | "sell";
  valueRange: string;
  disclosedAt: string;
  transactedAt: string;
  theme: string;
};

export type CryptoFlowTrade = {
  id: string;
  pair: string;
  chain: "solana" | "ethereum" | "base" | "arbitrum";
  side: "long" | "short" | "spot_buy" | "spot_sell";
  notionalUsd: number;
  confidence: number;
  exchange: string;
  triggeredAt: string;
};

export type IntelligenceNewsItem = {
  id: string;
  title: string;
  symbol: string;
  impact: "high" | "medium" | "low";
  category: "earnings" | "macro" | "crypto" | "policy" | "technical";
  summary: string;
  publishedAt: string;
  source: string;
};

export type IntelligenceOverview = {
  generatedAt: string;
  optionsPremium24hUsd: number;
  darkPoolNotional24hUsd: number;
  cryptoNotional24hUsd: number;
  highImpactNewsCount: number;
  unusualContractsCount: number;
};

export type IntelligenceProviderSource = "mock" | "vendor";

export type IntelligenceProviderStatus = {
  source: IntelligenceProviderSource;
  vendor: string;
  configured: boolean;
  simulated: boolean;
  generatedAt: string;
  mode?: "live" | "simulated";
  detail?: string;
  lastError?: string;
  cacheTtlMs?: number;
};

export type IntelligenceStorageMode = "memory" | "supabase";

export type IntelligenceStorageStatus = {
  mode: IntelligenceStorageMode;
  configured: boolean;
  watchlistTable: string;
  alertsTable: string;
  generatedAt: string;
  fallbackActive: boolean;
  lastError?: string;
};

export type WatchlistAssetType = "equity" | "crypto";

export type WatchlistItem = {
  id: string;
  userId: string;
  symbol: string;
  assetType: WatchlistAssetType;
  minFlowPremiumUsd?: number;
  minDarkPoolNotionalUsd?: number;
  minCryptoNotionalUsd?: number;
  minUnusualScore?: number;
  minConfidence?: number;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type IntelligenceAlertSource = "flow" | "dark_pool" | "crypto" | "news";

export type IntelligenceAlertSeverity = "info" | "watch" | "urgent";

export type IntelligenceAlert = {
  id: string;
  userId: string;
  symbol: string;
  assetType: WatchlistAssetType;
  source: IntelligenceAlertSource;
  severity: IntelligenceAlertSeverity;
  title: string;
  summary: string;
  triggeredAt: string;
  route: string;
  referenceId?: string;
  deliveredToDiscordAt?: string | null;
};
