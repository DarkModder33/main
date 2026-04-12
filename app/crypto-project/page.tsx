import { ActionRail } from "@/components/monetization/ActionRail";
import { TrackedCtaLink } from "@/components/monetization/TrackedCtaLink";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { createPageMetadata } from "@/lib/seo";
import {
    BadgeDollarSign,
    Blocks,
    Gem,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

export const metadata = createPageMetadata({
  title: "Digital Services & Product Roadmap | TradeHax AI",
  description:
    "Explore TradeHax AI's service roadmap including AI consulting, web development, game experiences, and premium platform updates.",
  path: "/crypto-project",
  keywords: ["digital services", "ai consulting", "web development", "product roadmap", "platform updates"],
});

const features = [
  {
    title: "AI Consulting",
    text: "Get expert guidance on integrating AI into your workflow, products, and business operations.",
    icon: ShieldCheck,
  },
  {
    title: "Web Development",
    text: "Custom websites, apps, and digital systems built for revenue and growth.",
    icon: Gem,
  },
  {
    title: "Premium Access",
    text: "Unlock premium tiers tied to subscriptions, perks, and upcoming feature releases.",
    icon: BadgeDollarSign,
  },
  {
    title: "Game + Rewards Integration",
    text: "Hyperborea rewards connect to scoring, with bonuses based on gameplay and skill progression.",
    icon: Sparkles,
  },
] as const;

export default function CryptoProjectPage() {
  return (
    <div className="min-h-screen">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <section className="theme-panel p-6 sm:p-8 mb-8">
          <span className="theme-kicker mb-3">Platform Hub</span>
          <h1 className="theme-title text-3xl sm:text-4xl font-bold mb-4">
            Product Roadmap
          </h1>
          <p className="theme-subtitle mb-6">
            Clear updates on service offerings, platform access, and premium utility planning tied to the broader platform.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <TrackedCtaLink
              href="/game"
              conversionId="open_game"
              surface="project:hero"
              className="theme-cta theme-cta--secondary px-5 py-3"
            >
              Open Hyperborea
              <Blocks className="w-4 h-4" />
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/pricing"
              conversionId="open_pricing"
              surface="project:hero"
              className="theme-cta theme-cta--loud px-5 py-3"
            >
              View Upgrade Plans
            </TrackedCtaLink>
          </div>
        </section>

        <ActionRail surface="project" className="mb-8" />

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {features.map(({ title, text, icon: Icon }) => (
            <article key={title} className="theme-grid-card">
              <Icon className="w-5 h-5 text-[#79f9a9]" />
              <h2 className="text-lg font-semibold">{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </section>

        <section className="theme-panel p-6 sm:p-8">
          <h2 className="theme-title text-2xl font-bold mb-4">
            Project Notes
          </h2>
          <ul className="space-y-3 text-sm sm:text-base text-[#c4d2e9] mb-5">
            <li>All features are designed to support service value and reduce friction for visitors.</li>
            <li>Premium access is built around subscriptions, not token gating.</li>
            <li>We track conversion from game activity, bookings, and service inquiries.</li>
          </ul>

          <details className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <summary className="cursor-pointer text-sm font-semibold text-white">Advanced implementation notes</summary>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm text-[#c4d2e9]">
              <li>Keep service APIs behind secure environment variables and server-side validation.</li>
              <li>Route users into relevant service and subscription offers based on their interests.</li>
              <li>Apply analytics across game sessions, booking submissions, and service inquiries for optimization.</li>
            </ul>
          </details>
        </section>
      </main>
      <ShamrockFooter />
    </div>
  );
}

