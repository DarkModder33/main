import { SocialProviderWizard } from "@/components/admin/SocialProviderWizard";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import { createPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = createPageMetadata({
  title: "Social Provider Wizard | TradeHax AI",
  description:
    "Configure social media API providers, generate environment payloads, and export Vercel-ready config in one click.",
  path: "/admin/social-wizard",
  robots: {
    index: false,
    follow: false,
  },
});

export default function SocialProviderWizardPage() {
  return (
    <div className="min-h-screen">
      <ShamrockHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <SocialProviderWizard />
      </main>
      <ShamrockFooter />
    </div>
  );
}
