import { IntelligencePageShell } from "@/components/intelligence/IntelligencePageShell";
import { NewsPanel } from "@/components/intelligence/NewsPanel";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalyst News Feed | TradeHax Intelligence",
  description: "Action-oriented catalyst feed with impact and category segmentation.",
};

export default function IntelligenceNewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <ShamrockHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <IntelligencePageShell
          kicker="Catalyst Layer"
          title="News Catalyst Feed"
          description="Prioritize high-impact headlines and convert narrative risk into measurable watchlist actions."
          quickLinks={[
            { label: "Overview", href: "/intelligence" },
            { label: "Politics", href: "/intelligence/politics" },
            { label: "Content Studio", href: "/intelligence/content" },
          ]}
        >
          <NewsPanel />
        </IntelligencePageShell>
      </main>
      <ShamrockFooter />
    </div>
  );
}
