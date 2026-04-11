import { TrackedCtaLink } from "@/components/monetization/TrackedCtaLink";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { createPageMetadata } from "@/lib/seo";
import Script from "next/script";

export const metadata = createPageMetadata({
  title: "Digital Product Roadmap Consulting | TradeHax AI",
  description:
    "Plan product utility phases, growth milestones, and measurable rollout KPIs with a practical consulting roadmap for your digital business.",
  path: "/web3-token-roadmap-consulting",
  keywords: [
    "digital product roadmap consulting",
    "product strategy consulting",
    "app development roadmap",
    "digital business strategy",
  ],
});

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Digital Product Roadmap Consulting",
  provider: {
    "@type": "Organization",
    name: "TradeHax AI",
  },
  serviceType: "Product Strategy Consulting",
  areaServed: "United States",
  description:
    "Product utility planning, phased rollout strategy, growth readiness, and KPI mapping for sustainable digital business growth.",
};

export default function ProductRoadmapConsultingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <Script id="service-product-roadmap" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(serviceJsonLd)}
      </Script>

      
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/5 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-fuchsia-200">Product Advisory</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Digital Product Roadmap Consulting</h1>
          <p className="mt-3 max-w-3xl text-sm text-zinc-300 sm:text-base">
            Build a forward-leaning roadmap with practical phases: onboarding, feature utility, retention loops, and growth milestones.
            We focus on measurable outcomes and real business value.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              "Phase 1: onboarding + user experience",
              "Phase 2: feature loops + engagement",
              "Phase 3: growth + accountability",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-200">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <TrackedCtaLink
              href="/schedule"
              conversionId="book_ai_consult"
              surface="seo:product_roadmap"
              conversionContext={{ placement: "hero", variant: "book_consult", audience: "all" }}
              className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/20 px-4 py-2 text-xs font-semibold text-fuchsia-100 hover:bg-fuchsia-500/30"
            >
              Book a Consultation
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/services"
              conversionId="open_services"
              surface="seo:product_roadmap"
              conversionContext={{ placement: "hero", variant: "view_services", audience: "all" }}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-zinc-100 hover:bg-white/15"
            >
              View All Services
            </TrackedCtaLink>
          </div>
        </section>
      </main>
      <ShamrockFooter />
    </div>
  );
}

