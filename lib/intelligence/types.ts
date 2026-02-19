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
