import { IntelligencePageShell } from "@/components/intelligence/IntelligencePageShell";
import { PositionCalculatorPanel } from "@/components/intelligence/PositionCalculatorPanel";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Risk Calculator | TradeHax Intelligence",
  description: "Quick position sizing and risk/reward planning calculator.",
};

export default function IntelligenceCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <ShamrockHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <IntelligencePageShell
          kicker="Execution Layer"
          title="Risk & Position Calculator"
          description="Convert signal confidence into disciplined position sizing with clear account-level risk constraints."
          quickLinks={[
            { label: "Overview", href: "/intelligence" },
            { label: "Flow Tape", href: "/intelligence/flow" },
            { label: "Crypto Flow", href: "/intelligence/crypto-flow" },
          ]}
        >
          <PositionCalculatorPanel />
        </IntelligencePageShell>
      </main>
      <ShamrockFooter />
    </div>
  );
}
