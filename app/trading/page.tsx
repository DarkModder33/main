import { TradehaxBotDashboard } from "@/components/trading/TradehaxBotDashboard";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";

export const metadata = {
  title: "TradeHax Bots - Automated Trading Dashboard",
  description: "Manage your automated trading bots on Solana with TradeHax",
};

export default function TradingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <ShamrockHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TradehaxBotDashboard />
      </main>

      <ShamrockFooter />
    </div>
  );
}
