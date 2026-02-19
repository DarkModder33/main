import { DarkPoolPanel } from "@/components/intelligence/DarkPoolPanel";
import { IntelligencePageShell } from "@/components/intelligence/IntelligencePageShell";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dark Pool Scanner | TradeHax Intelligence",
  description: "Off-exchange trade scanner with side-estimate filters and AI context.",
};

export default function IntelligenceDarkPoolPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <ShamrockHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <IntelligencePageShell
          kicker="Liquidity Layer"
          title="Dark Pool Scanner"
          description="Surface high-notional off-exchange execution and map likely accumulation/distribution patterns."
          quickLinks={[
            { label: "Overview", href: "/intelligence" },
            { label: "Flow Tape", href: "/intelligence/flow" },
            { label: "Calculator", href: "/intelligence/calculator" },
          ]}
        >
          <DarkPoolPanel />
        </IntelligencePageShell>
      </main>
      <ShamrockFooter />
    </div>
  );
}
