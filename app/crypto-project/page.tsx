import { WalletButton } from "@/components/counter/WalletButton";
import { ActionRail } from "@/components/monetization/ActionRail";
import { TrackedCtaLink } from "@/components/monetization/TrackedCtaLink";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import {
  BadgeDollarSign,
  Blocks,
  Gem,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crypto Project - TradeHax AI",
  description:
    "Explore TradeHax AI crypto utilities: Solana wallet onboarding, devnet NFT mint path, and upgrade-ready monetization hooks.",
};

const features = [
  {
    title: "Devnet Wallet Connect",
    text: "Use Phantom or any supported wallet to connect and verify readiness.",
    icon: ShieldCheck,
  },
  {
    title: "Free Entry Mint",
    text: "Onboard users with free entry mint access tied to game and service funnels.",
    icon: Gem,
  },
  {
    title: "Upgrade Pipeline",
    text: "Connect premium mint tiers to subscriptions, perks, and exclusive analytics.",
    icon: BadgeDollarSign,
  },
  {
    title: "Game Integration",
    text: "Map Hyperborea rewards to collectibles and profile progression layers.",
    icon: Sparkles,
  },
] as const;

export default function CryptoProjectPage() {
  return (
    <div className="min-h-screen">
      <ShamrockHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <section className="theme-panel p-6 sm:p-8 mb-8">
          <span className="theme-kicker mb-3">Solana Project Hub</span>
          <h1 className="theme-title text-3xl sm:text-4xl font-bold mb-4">
            Hyperborea NFT + Trading Utility Stack
          </h1>
          <p className="theme-subtitle mb-6">
            This module keeps your new Web3 features while fitting your matrix
            site direction: clean wallet onboarding, mint entry, and premium
            upgrade lanes.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-h-10">
              <WalletButton />
            </div>
            <TrackedCtaLink
              href="/game"
              conversionId="open_game"
              surface="crypto_project:hero"
              className="theme-cta theme-cta--secondary px-5 py-3"
            >
              Open Hyperborea
              <Blocks className="w-4 h-4" />
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/pricing"
              conversionId="open_pricing"
              surface="crypto_project:hero"
              className="theme-cta theme-cta--loud px-5 py-3"
            >
              Mint Upgrade Plans
            </TrackedCtaLink>
          </div>
        </section>

        <ActionRail surface="crypto_project" className="mb-8" />

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {features.map(({ title, text, icon: Icon }) => (
            <article key={title} className="theme-grid-card">
              <Icon className="w-5 h-5 text-[#79f9a9]" />
              <h2 className="text-lg font-semibold">{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="theme-panel p-6 sm:p-8">
          <h2 className="theme-title text-2xl font-bold mb-4">
            Implementation Notes
          </h2>
          <ul className="space-y-3 text-sm sm:text-base text-[#c4d2e9]">
            <li>
              Keep mint APIs behind secure environment variables and server-side
              validation.
            </li>
            <li>
              Route wallet-connected users into schedule and subscription offers
              based on on-chain state.
            </li>
            <li>
              Track conversions from game sessions, mint actions, and booking
              submissions for pipeline optimization.
            </li>
          </ul>
        </section>
      </main>
      <ShamrockFooter />
    </div>
  );
}
