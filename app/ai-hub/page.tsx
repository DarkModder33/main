import { UnifiedAIWorkspace } from "@/components/ai/UnifiedAIWorkspace";
import { createPageMetadata } from "@/lib/seo";
import { Brain } from "lucide-react";

export const metadata = createPageMetadata({
  title: "TradeHax AI Hub - Unified Workspace",
  description:
    "One clear AI workspace for chat, text generation, image generation, autopilot controls, and monitoring.",
  path: "/ai-hub",
  keywords: ["ai hub", "trading ai", "chat", "automation", "unified workspace"],
});

export default function AIHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-8 text-center">
          <div className="theme-badge inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold mb-5">
            <Brain className="w-4 h-4" />
            UNIFIED AI WORKSPACE
          </div>

          <h1 className="theme-title text-3xl sm:text-5xl font-bold mb-4">TradeHax AI Hub</h1>
          <p className="mx-auto max-w-3xl text-sm sm:text-base text-zinc-300">
            Clutter removed. Use one interface for all core AI tasks: chat, content, visuals, autopilot controls, and health monitoring.
          </p>
        </header>

        <UnifiedAIWorkspace />
      </main>
    </div>
  );
}
