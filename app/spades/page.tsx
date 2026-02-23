/* -----------------------------------------------------------------------
 * <copyright company="Microsoft Corporation">
 *   Copyright (c) Microsoft Corporation.  All rights reserved.
 * </copyright>
 * ----------------------------------------------------------------------- */

import { SpadesGame } from '@/components/game/SpadesGame';
import { ShamrockFooter } from '@/components/shamrock/ShamrockFooter';
import { ShamrockHeader } from '@/components/shamrock/ShamrockHeader';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Spades Tournament | TradeHax Arcade',
  description:
    'Play cyberpunk Spades on TradeHax with tournament-ready sessions, optional wallet-linked wager simulation, and multiplayer-ready room flows.',
  path: '/spades',
  keywords: [
    'spades game',
    'spades online',
    'web3 card game',
    'solana game',
    'tradehax arcade',
    'spades tournament',
    'crypto wagering simulation',
  ],
  imagePath: '/og-game.svg',
  imageAlt: 'TradeHax Spades tournament game interface',
});

export default function SpadesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black">
      <ShamrockHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="theme-panel p-6 sm:p-8 mb-6">
          <span className="theme-kicker mb-3">Decentralized Arcade</span>
          <h1 className="theme-title text-3xl sm:text-4xl mb-3">Spades Tournament Arena</h1>
          <p className="text-[#a6bdd0] max-w-3xl">
            Graphic-intensive Spades MVP with cyberpunk visuals, multiplayer-ready room hooks, and
            wallet-aware wager simulation for tournament workflows.
          </p>
        </section>

        <SpadesGame />
      </main>
      <ShamrockFooter />
    </div>
  );
}
