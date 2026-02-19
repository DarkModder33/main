import {
  CryptoFlowTrade,
  DarkPoolTrade,
  FlowTrade,
  IntelligenceNewsItem,
  IntelligenceOverview,
  PoliticalTrade,
} from "@/lib/intelligence/types";

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const flowTape: FlowTrade[] = [
  {
    id: "flow_001",
    symbol: "NVDA",
    side: "call",
    premiumUsd: 2_450_000,
    size: 1800,
    strike: 960,
    spotPrice: 944,
    expiry: "2026-03-20",
    sentiment: "bullish",
    sweep: true,
    unusualScore: 94,
    openedAt: minutesAgo(9),
  },
  {
    id: "flow_002",
    symbol: "TSLA",
    side: "put",
    premiumUsd: 1_120_000,
    size: 2100,
    strike: 185,
    spotPrice: 192,
    expiry: "2026-03-06",
    sentiment: "bearish",
    sweep: true,
    unusualScore: 88,
    openedAt: minutesAgo(14),
  },
  {
    id: "flow_003",
    symbol: "SPY",
    side: "call",
    premiumUsd: 3_900_000,
    size: 4200,
    strike: 535,
    spotPrice: 529,
    expiry: "2026-02-27",
    sentiment: "bullish",
    sweep: false,
    unusualScore: 82,
    openedAt: minutesAgo(22),
  },
  {
    id: "flow_004",
    symbol: "AAPL",
    side: "put",
    premiumUsd: 980_000,
    size: 1500,
    strike: 207.5,
    spotPrice: 212,
    expiry: "2026-04-17",
    sentiment: "neutral",
    sweep: false,
    unusualScore: 74,
    openedAt: minutesAgo(33),
  },
  {
    id: "flow_005",
    symbol: "AMD",
    side: "call",
    premiumUsd: 760_000,
    size: 1300,
    strike: 198,
    spotPrice: 192,
    expiry: "2026-03-13",
    sentiment: "bullish",
    sweep: true,
    unusualScore: 79,
    openedAt: minutesAgo(41),
  },
];

const darkPoolTape: DarkPoolTrade[] = [
  {
    id: "dp_001",
    symbol: "MSFT",
    notionalUsd: 34_500_000,
    size: 89_000,
    price: 387.64,
    sideEstimate: "buy",
    venue: "TRF",
    unusualScore: 86,
    executedAt: minutesAgo(11),
  },
  {
    id: "dp_002",
    symbol: "META",
    notionalUsd: 21_200_000,
    size: 45_300,
    price: 467.88,
    sideEstimate: "sell",
    venue: "ATS",
    unusualScore: 72,
    executedAt: minutesAgo(17),
  },
  {
    id: "dp_003",
    symbol: "QQQ",
    notionalUsd: 49_900_000,
    size: 111_000,
    price: 449.22,
    sideEstimate: "mixed",
    venue: "TRF",
    unusualScore: 81,
    executedAt: minutesAgo(26),
  },
  {
    id: "dp_004",
    symbol: "AMZN",
    notionalUsd: 17_400_000,
    size: 95_000,
    price: 183.3,
    sideEstimate: "buy",
    venue: "ATS",
    unusualScore: 68,
    executedAt: minutesAgo(38),
  },
];

const politicsTape: PoliticalTrade[] = [
  {
    id: "pol_001",
    politician: "Rep. Sample",
    chamber: "house",
    symbol: "NVDA",
    action: "buy",
    valueRange: "$50K - $100K",
    disclosedAt: "2026-02-18",
    transactedAt: "2026-02-12",
    theme: "AI infrastructure",
  },
  {
    id: "pol_002",
    politician: "Sen. Example",
    chamber: "senate",
    symbol: "XOM",
    action: "sell",
    valueRange: "$15K - $50K",
    disclosedAt: "2026-02-17",
    transactedAt: "2026-02-10",
    theme: "energy hedging",
  },
  {
    id: "pol_003",
    politician: "Rep. Demo",
    chamber: "house",
    symbol: "COIN",
    action: "buy",
    valueRange: "$1K - $15K",
    disclosedAt: "2026-02-16",
    transactedAt: "2026-02-09",
    theme: "crypto market structure",
  },
  {
    id: "pol_004",
    politician: "Sen. Placeholder",
    chamber: "senate",
    symbol: "JPM",
    action: "buy",
    valueRange: "$50K - $100K",
    disclosedAt: "2026-02-14",
    transactedAt: "2026-02-07",
    theme: "rates sensitivity",
  },
];

const cryptoTape: CryptoFlowTrade[] = [
  {
    id: "cx_001",
    pair: "SOL/USDC",
    chain: "solana",
    side: "long",
    notionalUsd: 840_000,
    confidence: 0.82,
    exchange: "Jupiter",
    triggeredAt: minutesAgo(8),
  },
  {
    id: "cx_002",
    pair: "ETH/USDT",
    chain: "ethereum",
    side: "spot_buy",
    notionalUsd: 1_450_000,
    confidence: 0.76,
    exchange: "Binance",
    triggeredAt: minutesAgo(19),
  },
  {
    id: "cx_003",
    pair: "BTC/USDT",
    chain: "base",
    side: "short",
    notionalUsd: 2_020_000,
    confidence: 0.69,
    exchange: "Bybit",
    triggeredAt: minutesAgo(31),
  },
  {
    id: "cx_004",
    pair: "WIF/USDC",
    chain: "solana",
    side: "spot_sell",
    notionalUsd: 320_000,
    confidence: 0.61,
    exchange: "Jupiter",
    triggeredAt: minutesAgo(43),
  },
];

const intelligenceNews: IntelligenceNewsItem[] = [
  {
    id: "news_001",
    title: "Mega-cap AI infrastructure capex guidance revised higher",
    symbol: "NVDA",
    impact: "high",
    category: "earnings",
    summary:
      "Guidance revision reinforces near-term demand resilience for accelerator supply chains.",
    publishedAt: minutesAgo(15),
    source: "TradeHax Wire",
  },
  {
    id: "news_002",
    title: "Treasury auction demand cools as front-end yields reprice",
    symbol: "TLT",
    impact: "medium",
    category: "macro",
    summary:
      "Rates-sensitive sectors may face volatility expansion as implied policy path shifts.",
    publishedAt: minutesAgo(27),
    source: "Macro Brief",
  },
  {
    id: "news_003",
    title: "New multi-chain liquidity incentives pull volume into Solana venues",
    symbol: "SOL",
    impact: "high",
    category: "crypto",
    summary:
      "Cross-chain routing intensity increases with concentration around high-throughput pools.",
    publishedAt: minutesAgo(39),
    source: "Onchain Pulse",
  },
  {
    id: "news_004",
    title: "Updated policy draft proposes faster crypto reporting timelines",
    symbol: "COIN",
    impact: "low",
    category: "policy",
    summary:
      "Compliance-focused exchanges may gain relative clarity while smaller venues face overhead pressure.",
    publishedAt: minutesAgo(54),
    source: "Policy Desk",
  },
];

export function getFlowTape() {
  return flowTape;
}

export function getDarkPoolTape() {
  return darkPoolTape;
}

export function getPoliticsTape() {
  return politicsTape;
}

export function getCryptoTape() {
  return cryptoTape;
}

export function getIntelligenceNews() {
  return intelligenceNews;
}

export function getIntelligenceOverview(): IntelligenceOverview {
  const optionsPremium24hUsd = flowTape.reduce((total, trade) => total + trade.premiumUsd, 0);
  const darkPoolNotional24hUsd = darkPoolTape.reduce(
    (total, trade) => total + trade.notionalUsd,
    0,
  );
  const cryptoNotional24hUsd = cryptoTape.reduce(
    (total, trade) => total + trade.notionalUsd,
    0,
  );
  const highImpactNewsCount = intelligenceNews.filter((item) => item.impact === "high").length;
  const unusualContractsCount = flowTape.filter((trade) => trade.unusualScore >= 80).length;

  return {
    generatedAt: new Date().toISOString(),
    optionsPremium24hUsd,
    darkPoolNotional24hUsd,
    cryptoNotional24hUsd,
    highImpactNewsCount,
    unusualContractsCount,
  };
}
