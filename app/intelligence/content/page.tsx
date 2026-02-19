import { ContentStudioPanel } from "@/components/intelligence/ContentStudioPanel";
import { IntelligencePageShell } from "@/components/intelligence/IntelligencePageShell";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content Studio | TradeHax Intelligence",
  description:
    "Generate daily YouTube and Discord content briefs directly from intelligence feeds.",
};

export default function IntelligenceContentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <ShamrockHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <IntelligencePageShell
          kicker="Growth Layer"
          title="YouTube + Discord Content Studio"
          description="Automate signal-to-content workflows by generating daily briefs from flow, crypto, and catalyst intelligence."
          quickLinks={[
            { label: "Overview", href: "/intelligence" },
            { label: "News Feed", href: "/intelligence/news" },
            { label: "Political Monitor", href: "/intelligence/politics" },
          ]}
        >
          <ContentStudioPanel />
        </IntelligencePageShell>
      </main>
      <ShamrockFooter />
    </div>
  );
}
