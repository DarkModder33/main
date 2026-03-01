/**
 * TradeHax native asset configuration (chain-agnostic)
 */
export const HAX_TOKEN_CONFIG = {
  NAME: "TradeHax Native Utility Asset",
  SYMBOL: "HAX",
  DECIMALS: Number.parseInt(process.env.TRADEHAX_NATIVE_DECIMALS || "18", 10),
  CHAIN_NAMESPACE: process.env.TRADEHAX_CHAIN_NAMESPACE || "tradehax-l2",
  NETWORK: process.env.TRADEHAX_CHAIN_NETWORK || "alpha",
  ASSET_ID: process.env.TRADEHAX_NATIVE_ASSET_ID || "HAX_NATIVE_ASSET",
  TREASURY_ACCOUNT: process.env.TRADEHAX_TREASURY_ACCOUNT || "tradehax_treasury_main",
  // Backward compatibility aliases for existing UI/runtime references.
  MINT_ADDRESS: process.env.TRADEHAX_NATIVE_ASSET_ID || "HAX_NATIVE_ASSET",
};

type BalanceStore = Map<string, number>;

function getBalanceStore(): BalanceStore {
  const globalRef = globalThis as typeof globalThis & {
    __TRADEHAX_HAX_BALANCE_STORE__?: BalanceStore;
  };

  if (!globalRef.__TRADEHAX_HAX_BALANCE_STORE__) {
    globalRef.__TRADEHAX_HAX_BALANCE_STORE__ = new Map<string, number>();
  }

  return globalRef.__TRADEHAX_HAX_BALANCE_STORE__;
}

function normalizeAccountId(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-.:@]/g, "")
    .slice(0, 128);
}

function resolveInitialBalance() {
  const parsed = Number.parseFloat(process.env.TRADEHAX_NATIVE_BOOTSTRAP_BALANCE || "0");
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, parsed);
}

export class HaxTokenManager {
  constructor() {}

  /**
   * Prepare native asset deployment metadata for chain-agnostic minting/orchestration.
   */
  async prepareTokenCreation(operatorAccountId: string) {
    const operator = normalizeAccountId(operatorAccountId);
    if (!operator) {
      throw new Error("operatorAccountId is required");
    }

    return {
      message: "Native asset deployment metadata prepared.",
      chainNamespace: HAX_TOKEN_CONFIG.CHAIN_NAMESPACE,
      network: HAX_TOKEN_CONFIG.NETWORK,
      assetId: HAX_TOKEN_CONFIG.ASSET_ID,
      operator,
      decimals: HAX_TOKEN_CONFIG.DECIMALS,
    };
  }

  /**
   * Get balance of HAX for a given account id.
   */
  async getHaxBalance(accountId: string): Promise<number> {
    const normalized = normalizeAccountId(accountId);
    if (!normalized) {
      return 0;
    }

    const store = getBalanceStore();
    if (!store.has(normalized)) {
      store.set(normalized, resolveInitialBalance());
    }

    return store.get(normalized) || 0;
  }

  /**
   * Apply settlement delta to account balance (positive for mint/credit, negative for debit/burn).
   */
  async applySettlement(accountId: string, delta: number) {
    const normalized = normalizeAccountId(accountId);
    if (!normalized) {
      throw new Error("accountId is required");
    }
    if (!Number.isFinite(delta)) {
      throw new Error("delta must be finite");
    }

    const current = await this.getHaxBalance(normalized);
    const next = Math.max(0, current + delta);
    getBalanceStore().set(normalized, next);
    return {
      accountId: normalized,
      previous: current,
      next,
      delta,
      appliedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate liquidity/routing bootstrap config for your own chain/L2.
   */
  getLiquidityPoolConfig() {
    return {
      chainNamespace: HAX_TOKEN_CONFIG.CHAIN_NAMESPACE,
      network: HAX_TOKEN_CONFIG.NETWORK,
      baseToken: HAX_TOKEN_CONFIG.ASSET_ID,
      quoteToken: process.env.TRADEHAX_QUOTE_ASSET_ID || "USDX",
      targetLiquidity: Number.parseFloat(process.env.TRADEHAX_TARGET_LIQUIDITY || "100000"),
      feeBps: Number.parseInt(process.env.TRADEHAX_DEFAULT_FEE_BPS || "30", 10),
    };
  }
}
