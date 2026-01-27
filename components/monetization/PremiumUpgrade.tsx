'use client';

import { Check, Zap, Star, Crown } from 'lucide-react';

/**
 * Premium subscription upgrade CTA
 * Promotes paid tier with clear value proposition
 */
export function PremiumUpgrade() {
  const handleUpgradeClick = () => {
    // Track premium upgrade click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'premium_upgrade_click', {
        event_category: 'conversion',
        event_label: 'premium_cta',
        value: 10,
      });
    }
    // TODO: Redirect to Stripe checkout
    window.location.href = '/api/stripe/checkout';
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-purple-900/50 border-2 border-purple-500/50 rounded-2xl p-8 shadow-2xl">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold px-4 py-2 rounded-full text-sm mb-6">
          <Crown className="w-4 h-4" />
          LIMITED OFFER
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text mb-4">
          Upgrade to Premium
        </h2>
        
        <p className="text-gray-300 text-lg mb-6">
          Unlock advanced trading signals, ad-free experience, and exclusive strategies used by professional traders.
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Feature icon={<Zap className="w-5 h-5" />} text="Real-time AI Trading Signals" />
          <Feature icon={<Star className="w-5 h-5" />} text="Ad-Free Experience" />
          <Feature icon={<Check className="w-5 h-5" />} text="Priority Support 24/7" />
          <Feature icon={<Check className="w-5 h-5" />} text="Advanced Analytics Dashboard" />
          <Feature icon={<Check className="w-5 h-5" />} text="Exclusive Trading Strategies" />
          <Feature icon={<Check className="w-5 h-5" />} text="Portfolio Risk Analysis" />
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-5xl font-bold text-white">$9.99</span>
          <span className="text-gray-400">/month</span>
          <span className="ml-4 text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
            Save $20 vs. competitors
          </span>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleUpgradeClick}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-105"
        >
          Upgrade Now →
        </button>

        <p className="text-gray-500 text-sm mt-4">
          🔒 Cancel anytime. No commitments.
        </p>
      </div>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-200">
      <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}

/**
 * Compact premium banner for sidebar placement
 */
export function PremiumBanner() {
  const handleClick = () => {
    // Track banner click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'premium_banner_click', {
        event_category: 'conversion',
        event_label: 'sidebar_banner',
        value: 10,
      });
    }
    window.location.href = '/api/stripe/checkout';
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-5 h-5 text-yellow-400" />
        <span className="text-yellow-400 font-bold text-sm">PREMIUM</span>
      </div>
      
      <h3 className="text-lg font-bold text-white mb-2">
        Go Ad-Free + Get Signals
      </h3>
      
      <p className="text-gray-400 text-sm mb-4">
        Unlock advanced features for $9.99/mo
      </p>
      
      <button
        onClick={handleClick}
        className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
      >
        Upgrade Now
      </button>
    </div>
  );
}
