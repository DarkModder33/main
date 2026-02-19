import { FlowTapePanel } from "@/components/intelligence/FlowTapePanel";
import { IntelligencePageShell } from "@/components/intelligence/IntelligencePageShell";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import { createPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = createPageMetadata({
  title: "Options Flow Tape | TradeHax Intelligence",
  description: "Live-style options flow tape with filters, unusual scoring, and AI-assisted interpretation.",
  path: "/intelligence/flow",
});

export default function IntelligenceFlowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <ShamrockHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <IntelligencePageShell
          kicker="Flow Layer"
          title="Options Flow Tape"
          description="Track premium concentration, unusual score, and directional bias before execution planning."
          quickLinks={[
            { label: "Overview", href: "/intelligence" },
            { label: "Dark Pool", href: "/intelligence/dark-pool" },
            { label: "News", href: "/intelligence/news" },
          ]}
        >
          <FlowTapePanel />
        </IntelligencePageShell>
      </main>
      <ShamrockFooter />
    </div>
  );
}
