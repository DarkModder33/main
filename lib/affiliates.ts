/**
 * Affiliate link management and tracking
 * Centralized configuration for all affiliate partnerships
 */

export interface AffiliateLink {
  id: string;
  name: string;
  description: string;
  url: string;
  commission: string;
  category: 'exchange' | 'wallet' | 'tools' | 'education' | 'hardware';
}

export const affiliates: Record<string, AffiliateLink> = {
  coinbase: {
    id: 'coinbase',
    name: 'Coinbase',
    description: 'Best crypto exchange for beginners. Get $10 bonus.',
    url: process.env.NEXT_PUBLIC_COINBASE_REF || 'https://coinbase.com/join/REF_CODE',
    commission: '5-50%',
    category: 'exchange',
  },
  binance: {
    id: 'binance',
    name: 'Binance',
    description: 'World\'s largest crypto exchange. Low fees.',
    url: process.env.NEXT_PUBLIC_BINANCE_REF || 'https://binance.com/ref/REF_CODE',
    commission: '20-40%',
    category: 'exchange',
  },
  phantom: {
    id: 'phantom',
    name: 'Phantom Wallet',
    description: 'The best Solana wallet for traders.',
    url: process.env.NEXT_PUBLIC_PHANTOM_REF || 'https://phantom.app/?ref=REF_CODE',
    commission: 'Variable',
    category: 'wallet',
  },
  ledger: {
    id: 'ledger',
    name: 'Ledger Hardware Wallet',
    description: 'Secure your crypto with hardware wallet.',
    url: process.env.NEXT_PUBLIC_LEDGER_REF || 'https://shop.ledger.com/?r=REF_CODE',
    commission: '10%',
    category: 'hardware',
  },
  tradingview: {
    id: 'tradingview',
    name: 'TradingView',
    description: 'Professional charting and trading platform.',
    url: process.env.NEXT_PUBLIC_TRADINGVIEW_REF || 'https://tradingview.com/?aff_id=REF_CODE',
    commission: '50%',
    category: 'tools',
  },
  coingecko: {
    id: 'coingecko',
    name: 'CoinGecko',
    description: 'Track cryptocurrency prices and market data.',
    url: process.env.NEXT_PUBLIC_COINGECKO_REF || 'https://coingecko.com/?ref=REF_CODE',
    commission: 'Variable',
    category: 'tools',
  },
  alchemy: {
    id: 'alchemy',
    name: 'Alchemy',
    description: 'Web3 development platform and RPC provider.',
    url: process.env.NEXT_PUBLIC_ALCHEMY_REF || 'https://alchemy.com/?r=REF_CODE',
    commission: 'Variable',
    category: 'tools',
  },
};

/**
 * Get affiliate link by ID
 */
export function getAffiliateLink(id: string): AffiliateLink | undefined {
  return affiliates[id];
}

/**
 * Get all affiliates by category
 */
export function getAffiliatesByCategory(category: AffiliateLink['category']): AffiliateLink[] {
  return Object.values(affiliates).filter(affiliate => affiliate.category === category);
}

/**
 * Get all exchanges
 */
export function getExchangeAffiliates(): AffiliateLink[] {
  return getAffiliatesByCategory('exchange');
}

/**
 * Get all wallets
 */
export function getWalletAffiliates(): AffiliateLink[] {
  return getAffiliatesByCategory('wallet');
}

/**
 * Get all trading tools
 */
export function getToolAffiliates(): AffiliateLink[] {
  return getAffiliatesByCategory('tools');
}

/**
 * Track affiliate click (server-side)
 * This would typically log to a database or analytics service
 */
export async function trackAffiliateClick(affiliateId: string, userId?: string): Promise<void> {
  try {
    // TODO: Implement server-side tracking
    // Could log to database, analytics service, or both
    console.log('Affiliate click:', {
      affiliateId,
      userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to track affiliate click:', error);
  }
}
