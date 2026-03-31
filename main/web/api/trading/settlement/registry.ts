import type { SettlementAdapter } from './types.js';
import { polygonSettlementAdapter } from './adapters/polygon-adapter.js';
import { l2StubSettlementAdapter } from './adapters/l2-stub-adapter.js';
import { l2CustomSettlementAdapter } from './adapters/l2-custom-adapter.js';
import { polymarketSettlementAdapter } from './adapters/polymarket-adapter.js';

const adaptersByKey: Record<string, SettlementAdapter> = {
  [polygonSettlementAdapter.key]: polygonSettlementAdapter,
  [l2StubSettlementAdapter.key]: l2StubSettlementAdapter,
  [l2CustomSettlementAdapter.key]: l2CustomSettlementAdapter,
  [polymarketSettlementAdapter.key]: polymarketSettlementAdapter,
};

export function resolveSettlementAdapter(preferredKey?: string): SettlementAdapter {
  if (preferredKey && adaptersByKey[preferredKey]) return adaptersByKey[preferredKey];
  return polygonSettlementAdapter;
}
