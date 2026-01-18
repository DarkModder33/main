'use client';

import { ExternalLink, TrendingUp } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface AffiliateBannerProps {
  partner: string;
  title: string;
  description: string;
  ctaText: string;
  href: string;
  badge?: string;
  className?: string;
}

/**
 * Affiliate promotion banner with tracking
 */
export function AffiliateBanner({
  partner,
  title,
  description,
  ctaText,
  href,
  badge,
  className = '',
}: AffiliateBannerProps) {
  const handleClick = () => {
    trackEvent.affiliateClick(partner);
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-purple-900/30 border border-purple-500/30 rounded-xl p-6 ${className}`}>
      {badge && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
          {badge}
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            {description}
          </p>
          
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-purple-500/50"
          >
            {ctaText}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact affiliate link with tracking
 */
export function AffiliateLink({
  partner,
  children,
  href,
  className = '',
}: {
  partner: string;
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  const handleClick = () => {
    trackEvent.affiliateClick(partner);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={`text-purple-400 hover:text-purple-300 underline decoration-dotted transition-colors ${className}`}
    >
      {children}
    </a>
  );
}

/**
 * Recommended tools section with affiliate links
 */
export function RecommendedTools() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">
        🛠️ Recommended Trading Tools
      </h2>
      
      <AffiliateBanner
        partner="coinbase"
        title="Coinbase - Best for Beginners"
        description="Get $10 in Bitcoin when you buy $100 or more. Trusted by millions worldwide."
        ctaText="Get $10 Bonus"
        href={process.env.NEXT_PUBLIC_COINBASE_REF || '#'}
        badge="$10 BONUS"
      />
      
      <AffiliateBanner
        partner="binance"
        title="Binance - Advanced Trading"
        description="Trade 350+ cryptocurrencies with the world's largest crypto exchange. Low fees and high liquidity."
        ctaText="Start Trading"
        href={process.env.NEXT_PUBLIC_BINANCE_REF || '#'}
      />
      
      <AffiliateBanner
        partner="phantom"
        title="Phantom Wallet - Solana Wallet"
        description="The easiest way to store and swap tokens on Solana. Required for trading on our platform."
        ctaText="Download Phantom"
        href={process.env.NEXT_PUBLIC_PHANTOM_REF || '#'}
      />
    </div>
  );
}
