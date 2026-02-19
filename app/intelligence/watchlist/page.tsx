import { IntelligencePageShell } from "@/components/intelligence/IntelligencePageShell";
import { WatchlistPanel } from "@/components/intelligence/WatchlistPanel";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist Alerts | TradeHax Intelligence",
  description:
    "Build symbol watchlists, trigger cross-asset alerts, and route notifications to tier-based Discord channels.",
};

export default function IntelligenceWatchlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <ShamrockHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <IntelligencePageShell
          kicker="Automation Layer"
          title="Watchlist + Alert Routing"
          description="Operational watchlist stack for equities and crypto. Scan for high-value triggers and dispatch to Discord channels by subscription tier."
          quickLinks={[
            { label: "Overview", href: "/intelligence" },
            { label: "Flow Tape", href: "/intelligence/flow" },
            { label: "Content Studio", href: "/intelligence/content" },
          ]}
        >
          <WatchlistPanel />
        </IntelligencePageShell>
      </main>
      <ShamrockFooter />
    </div>
  );
}
