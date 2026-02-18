import { BillingConsole } from "@/components/monetization/BillingConsole";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing | TradeHax AI",
  description:
    "Manage TradeHax AI subscription tiers, usage quotas, and checkout methods for Stripe and Coinbase.",
};

export default function BillingPage() {
  return (
    <div className="min-h-screen">
      <ShamrockHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <section className="theme-panel p-6 sm:p-8 mb-8">
          <span className="theme-kicker mb-3">Revenue Engine</span>
          <h1 className="theme-title text-3xl sm:text-4xl mb-4">Billing and Tier Management</h1>
          <p className="text-[#a6bdd0] max-w-3xl">
            Activate recurring subscriptions with tier-based feature access for AI, game usage, and signal tooling.
          </p>
        </section>

        <BillingConsole />
      </main>
      <ShamrockFooter />
    </div>
  );
}
