import { IntelligencePageShell } from "@/components/intelligence/IntelligencePageShell";
import { PoliticsPanel } from "@/components/intelligence/PoliticsPanel";
import { createPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = createPageMetadata({
  title: "Political Trading Monitor | TradeHax Intelligence",
  description: "Track disclosed congressional and senate trades with theme and action filters.",
  path: "/intelligence/politics",
});

export default function IntelligencePoliticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <IntelligencePageShell
          kicker="Disclosure Layer"
          title="Political Trading Monitor"
          description="Evaluate policy-linked positioning by tracking disclosed buys/sells and thematic concentration."
          quickLinks={[
            { label: "Overview", href: "/intelligence" },
            { label: "News", href: "/intelligence/news" },
            { label: "Content Studio", href: "/intelligence/content" },
          ]}
        >
          <PoliticsPanel />
        </IntelligencePageShell>
      </main>
    </div>
  );
}

