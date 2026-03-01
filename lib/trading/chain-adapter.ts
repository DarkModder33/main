export type ChainExecutionMode = "live" | "paper";

export type ChainIdentity = {
  namespace: string;
  network: string;
};

export type AssetDescriptor = {
  symbol: string;
  assetId?: string;
  decimals?: number;
};

export type QuoteRequest = {
  baseAsset: AssetDescriptor;
  quoteAsset: AssetDescriptor;
  amount: number;
  slippageBps?: number;
};

export type QuoteResult = {
  provider: string;
  route: string;
  inputAmount: number;
  outputAmount: number;
  unitPrice: number;
  priceImpactPct: number;
  feeAmount: number;
  asOf: string;
};

export type TradeOrder = {
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  limitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  meta?: Record<string, string | number | boolean>;
};

export type OrderExecutionResult = {
  provider: string;
  status: "filled" | "partial" | "rejected" | "pending";
  orderId: string;
  txHash?: string;
  avgFillPrice?: number;
  filledAmount?: number;
  feePaid?: number;
  timestamp: number;
};

export interface ChainTradingAdapter {
  readonly id: string;
  readonly label: string;
  readonly chain: ChainIdentity;
  readonly mode: ChainExecutionMode;

  getQuote(input: QuoteRequest): Promise<QuoteResult>;
  executeOrder(order: TradeOrder): Promise<OrderExecutionResult>;
  getSpotPrice(symbol: string): Promise<number>;
}

type AdapterRegistry = Map<string, ChainTradingAdapter>;

function getRegistry(): AdapterRegistry {
  const globalRef = globalThis as typeof globalThis & {
    __TRADEHAX_CHAIN_ADAPTERS__?: AdapterRegistry;
  };

  if (!globalRef.__TRADEHAX_CHAIN_ADAPTERS__) {
    globalRef.__TRADEHAX_CHAIN_ADAPTERS__ = new Map();
  }

  return globalRef.__TRADEHAX_CHAIN_ADAPTERS__;
}

export function registerChainAdapter(adapter: ChainTradingAdapter) {
  getRegistry().set(adapter.id, adapter);
}

export function listChainAdapters() {
  return Array.from(getRegistry().values());
}

export function getChainAdapter(adapterId: string) {
  return getRegistry().get(adapterId) || null;
}

export function resolveDefaultAdapterId() {
  const fromEnv = String(process.env.TRADEHAX_TRADING_ADAPTER_ID || "").trim();
  if (fromEnv) {
    return fromEnv;
  }

  const fromMode = String(process.env.TRADEHAX_TRADING_MODE || "").trim().toLowerCase();
  if (fromMode === "paper") {
    return "paper-default";
  }

  return "paper-default";
}

class PaperDefaultAdapter implements ChainTradingAdapter {
  readonly id = "paper-default";
  readonly label = "Paper Default Adapter";
  readonly chain: ChainIdentity = {
    namespace: "agnostic",
    network: "paper",
  };
  readonly mode: ChainExecutionMode = "paper";

  async getQuote(input: QuoteRequest): Promise<QuoteResult> {
    const safeAmount = Number.isFinite(input.amount) ? Math.max(0, input.amount) : 0;
    const unitPrice = 1;
    const feeAmount = safeAmount * 0.001;
    return {
      provider: this.label,
      route: `${input.baseAsset.symbol}/${input.quoteAsset.symbol}`,
      inputAmount: safeAmount,
      outputAmount: Math.max(0, safeAmount - feeAmount),
      unitPrice,
      priceImpactPct: 0,
      feeAmount,
      asOf: new Date().toISOString(),
    };
  }

  async executeOrder(order: TradeOrder): Promise<OrderExecutionResult> {
    return {
      provider: this.label,
      status: "filled",
      orderId: `paper_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      avgFillPrice: Number.isFinite(order.limitPrice) ? order.limitPrice : 1,
      filledAmount: order.amount,
      feePaid: Math.max(0, order.amount) * 0.001,
      timestamp: Date.now(),
    };
  }

  async getSpotPrice(): Promise<number> {
    return 1;
  }
}

export function ensureDefaultChainAdapter() {
  const registry = getRegistry();
  if (!registry.has("paper-default")) {
    registry.set("paper-default", new PaperDefaultAdapter());
  }
}
