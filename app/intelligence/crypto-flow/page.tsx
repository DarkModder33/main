import { CryptoFlowPanel } from "@/components/intelligence/CryptoFlowPanel";
import { IntelligencePageShell } from "@/components/intelligence/IntelligencePageShell";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import { createPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = createPageMetadata({
  title: "Crypto Flow Intelligence | TradeHax Intelligence",
  description: "Cross-chain crypto flow monitor with confidence and notional filters.",
  path: "/intelligence/crypto-flow",
});

export default function IntelligenceCryptoFlowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <ShamrockHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <IntelligencePageShell
          kicker="Crypto Layer"
          title="Crypto Flow Intelligence"
          description="Unify pair-level directional flow across Solana, Ethereum, Base, and Arbitrum."
          quickLinks={[
            { label: "Overview", href: "/intelligence" },
            { label: "Flow Tape", href: "/intelligence/flow" },
            { label: "Calculator", href: "/intelligence/calculator" },
          ]}
        >
          <CryptoFlowPanel />
        </IntelligencePageShell>
      </main>
      <ShamrockFooter />
    </div>
  );
}
