import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import { createPageMetadata } from "@/lib/seo";
import { GamesHubClient } from "./GamesHubClient";

export const metadata = createPageMetadata({
  title: "Games Hub | TradeHax AI",
  description:
    "Unified games hub for Hax Runner and upcoming decentralized arcade features including LibRetro core roadmap.",
  path: "/games",
  keywords: ["games hub", "browser arcade", "hax runner", "decentralized gaming"],
});

export default function GamesHubPage() {
  return (
    <div className="min-h-screen">
      <ShamrockHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <section className="theme-panel p-6 sm:p-8 mb-8">
          <span className="theme-kicker mb-3">Arcade Layer</span>
          <h1 className="theme-title text-3xl sm:text-4xl mb-4">TradeHax Games Hub</h1>
          <p className="text-[#a6bdd0] max-w-3xl">
            Enter gameplay routes, manage ROM metadata queue, and monitor rollout for decentralized arcade modules.
          </p>
        </section>
        <GamesHubClient />
      </main>
      <ShamrockFooter />
    </div>
  );
}
