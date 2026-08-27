import { ExperimentReadoutPanel } from "@/components/analytics/ExperimentReadoutPanel";
import { HomeEngagementTracker } from "@/components/analytics/HomeEngagementTracker";
import { InstantEstimate } from "@/components/landing/InstantEstimate";
import { TrackedCtaLink } from "@/components/monetization/TrackedCtaLink";
import { DeferredRender } from '@/components/ui/DeferredRender';
import { scheduleLinks } from "@/lib/booking";
import { businessProfile } from "@/lib/business-profile";
import {
    ArrowRight,
    CheckCircle2,
    CircuitBoard,
    Guitar,
    MessageSquare,
    MonitorSmartphone,
    Sparkles,
    Wrench,
} from "lucide-react";
import dynamic from "next/dynamic";
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const LiveActivity = dynamic(
  () => import("@/components/ui/LiveActivity").then((mod) => mod.LiveActivity),
  {},
);

const ServiceGrid = dynamic(
  () => import("@/components/landing/ServiceGrid").then((mod) => mod.ServiceGrid),
  {
    loading: () => <div className="mx-auto max-w-7xl px-6 py-20 text-zinc-500 text-sm">Loading service capabilities…</div>,
  },
);

const AINeuralHub = dynamic(
  () => import("@/components/landing/AINeuralHub").then((mod) => mod.AINeuralHub),
  {
    loading: () => <div className="mx-auto max-w-7xl px-6 py-20 text-zinc-500 text-sm">Loading AI workspace…</div>,
  },
);

const Roadmap = dynamic(
  () => import("@/components/landing/Roadmap").then((mod) => mod.Roadmap),
  {
    loading: () => <div className="mx-auto max-w-7xl px-6 py-20 text-zinc-500 text-sm">Loading roadmap…</div>,
  },
);

export default async function Home() {
  // Server-side redirect to canonical host when accessing tradehax.net without www
  const host = (await headers()).get('host');
  if (host && host.toLowerCase().trim().startsWith('tradehax.net')) {
    redirect('https://www.tradehax.net/');
  }

  return (
    <main className="min-h-screen bg-black">
      <HomeEngagementTracker />
      <ExperimentReadoutPanel />

      {/* Hero: Instant Estimate + service intro */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-14 sm:pt-20 pb-16 sm:pb-20">
        <div className="absolute top-[-8rem] right-[-6rem] w-[280px] h-[280px] sm:w-[460px] sm:h-[460px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-9rem] left-[-4rem] w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="theme-panel p-8 sm:p-12 md:p-16">
            <span className="theme-kicker mb-5">Founder-led · Remote + Mail-in</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight font-black text-white tracking-tighter uppercase mb-5 break-words">
              Tech repairs, custom builds &amp; music lessons — one expert.
            </h1>
            <p className="text-zinc-200 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-2">
              Get an instant estimate range in seconds. Free quotes, clear scope, no theater.
            </p>
            <p className="text-zinc-400 text-base max-w-2xl mx-auto leading-relaxed mb-8">
              Remote diagnostics, mail-in repairs, and Greater Philadelphia support. Global clients welcome.
            </p>

            {/* Instant Estimate — primary interaction */}
            <InstantEstimate />

            {/* Three entry lane cards */}
            <div className="grid sm:grid-cols-3 gap-4 mt-12 text-left">
              <TrackedCtaLink
                href="/services"
                conversionId="open_services"
                surface="home:entry_lanes"
                conversionContext={{ placement: "entry_lane", variant: "services", audience: "all" }}
                className="interactive-surface p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/30 transition-all group"
              >
                <MonitorSmartphone className="w-6 h-6 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-bold text-white uppercase mb-2">Tech Services</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">Device repairs $50–200 · Custom development from $299</p>
                <span className="text-xs text-emerald-400 font-semibold">→ View catalog</span>
              </TrackedCtaLink>

              <TrackedCtaLink
                href="/music"
                conversionId="open_music"
                surface="home:entry_lanes"
                conversionContext={{ placement: "entry_lane", variant: "music", audience: "all" }}
                className="interactive-surface p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-purple-500/30 transition-all group"
              >
                <Guitar className="w-6 h-6 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-bold text-white uppercase mb-2">Music Coaching</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">Private remote guitar lessons with structured progress.</p>
                <span className="text-xs text-purple-400 font-semibold">→ Start learning</span>
              </TrackedCtaLink>

              <TrackedCtaLink
                href="/intelligence"
                conversionId="open_intelligence"
                surface="home:entry_lanes"
                conversionContext={{ placement: "entry_lane", variant: "intelligence", audience: "all" }}
                className="interactive-surface p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-cyan-500/30 transition-all group"
              >
                <CircuitBoard className="w-6 h-6 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-bold text-white uppercase mb-2">Market Insights</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">Simulation-first research tools and educational signals.</p>
                <span className="text-xs text-cyan-400 font-semibold">→ Open hub</span>
              </TrackedCtaLink>
            </div>
          </div>
        </div>
      </section>

      <LiveActivity />

      {/* Three Flagship Portals */}
      <section id="home-flagship-portals" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="theme-panel p-6 sm:p-8 md:p-12">
          <span className="theme-kicker mb-4">Choose Your Environment</span>
          <h2 className="theme-title text-3xl sm:text-4xl md:text-5xl mb-12">Three Flagship Portals</h2>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Portal A — Tech Services */}
            <article className="theme-grid-card border-l-4 border-l-emerald-500">
              <div className="mb-6">
                <MonitorSmartphone className="w-10 h-10 text-emerald-400 mb-4" />
                <h3 className="text-2xl font-black text-white uppercase italic mb-3">Tech Services</h3>
                <p className="text-zinc-200 text-base leading-relaxed mb-4">
                  One expert, full solutions: device repairs, data recovery, and custom development.
                </p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Screen, battery, water damage &amp; unbricking ($50–200)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Websites, mobile apps, AI &amp; e-commerce (from $299)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Remote or mail-in — Greater Philadelphia + nationwide</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>Scoped before invoice. Clear timelines.</span>
                </li>
              </ul>
              <TrackedCtaLink
                href="/services"
                conversionId="open_services"
                surface="home:flagship_portals"
                conversionContext={{ placement: "flagship_portal", variant: "services", audience: "all" }}
                className="theme-cta theme-cta--loud w-full justify-center"
              >
                View Tech Catalog
                <ArrowRight className="w-4 h-4" />
              </TrackedCtaLink>
            </article>

            {/* Portal B — Music Intelligence */}
            <article className="theme-grid-card border-l-4 border-l-purple-500">
              <div className="mb-6">
                <Guitar className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-2xl font-black text-white uppercase italic mb-3">Music Intelligence</h3>
                <p className="text-zinc-200 text-base leading-relaxed mb-4">
                  AI-assisted guitar environment for learning, creative growth, and premium instruction.
                </p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span>Private guitar lessons with 15+ years teaching experience</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span>AI-powered practice tools and technique analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span>Artist growth programs and scholarship opportunities</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span>Fully remote — Meet, Zoom, Teams</span>
                </li>
              </ul>
              <TrackedCtaLink
                href="/music"
                conversionId="open_music"
                surface="home:flagship_portals"
                conversionContext={{ placement: "flagship_portal", variant: "music", audience: "all" }}
                className="theme-cta theme-cta--loud w-full justify-center"
              >
                Explore Music Portal
                <ArrowRight className="w-4 h-4" />
              </TrackedCtaLink>
            </article>

            {/* Portal C — Trade Intelligence */}
            <article className="theme-grid-card border-l-4 border-l-cyan-500">
              <div className="mb-6">
                <CircuitBoard className="w-10 h-10 text-cyan-400 mb-4" />
                <h3 className="text-2xl font-black text-white uppercase italic mb-3">Trade Intelligence</h3>
                <p className="text-zinc-200 text-base leading-relaxed mb-4">
                  Simulation-first market research. Educational tools only — never a broker.
                </p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span>Options flow &amp; dark pool scanners</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span>Probability engine and risk framing</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span>Cross-market flow with confidence bands</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span>Research interface only. No live order routing.</span>
                </li>
              </ul>
              <TrackedCtaLink
                href="/intelligence"
                conversionId="open_intelligence"
                surface="home:flagship_portals"
                conversionContext={{ placement: "flagship_portal", variant: "intelligence", audience: "all" }}
                className="theme-cta theme-cta--loud w-full justify-center"
              >
                Launch Intelligence Hub
                <ArrowRight className="w-4 h-4" />
              </TrackedCtaLink>
            </article>
          </div>
        </div>
      </section>

      {/* Credibility Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="theme-panel p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-xl bg-cyan-500/10">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase mb-1">Instant Estimates</h3>
              <p className="text-xs text-zinc-400">Free ranges in seconds, clear next steps</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase mb-1">Scoped Before Invoice</h3>
              <p className="text-xs text-zinc-400">Written scope and price before work starts</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-xl bg-purple-500/10">
                <CircuitBoard className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase mb-1">Remote + Mail-in</h3>
              <p className="text-xs text-zinc-400">Global clients · Greater Philadelphia local</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-xl bg-amber-500/10">
                <Wrench className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase mb-1">One Expert</h3>
              <p className="text-xs text-zinc-400">Repairs, builds, lessons, and insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Platform Exists */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="theme-panel p-8 sm:p-12 text-center">
          <span className="theme-kicker mb-4">Platform Rationale</span>
          <h2 className="theme-title text-2xl sm:text-3xl md:text-4xl mb-6">Why This Platform Exists</h2>
          <div className="text-zinc-200 text-base sm:text-lg leading-relaxed space-y-4 max-w-2xl mx-auto">
            <p>
              One system. Multiple specialized environments. One uncompromising quality standard.
            </p>
            <p>
              TradeHax was built to solve a simple problem: <strong className="text-white">execution without fragmentation</strong>.
              Whether you need a repaired phone, a new website, guitar coaching, or market research tools—everything runs on the same
              commitment to clear scope and real results.
            </p>
            <p className="text-sm text-zinc-400 border-t border-white/10 pt-4 mt-6">
              No hype. No shortcuts. Just professional-grade delivery and clear paths to action.
            </p>
          </div>
        </div>
      </section>

      {/* Action Footer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="theme-panel p-8 sm:p-12">
          <div className="text-center mb-8">
            <h2 className="theme-title text-2xl sm:text-3xl mb-3">Ready to Execute?</h2>
            <p className="text-zinc-300 text-base">Choose your entry point and start immediately.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <TrackedCtaLink
              href={scheduleLinks.root}
              conversionId="open_schedule"
              surface="home:action_footer"
              conversionContext={{ placement: "action_footer", variant: "book", audience: "all" }}
              className="theme-cta theme-cta--loud justify-center px-6 py-4"
            >
              Book Free Quote
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/services"
              conversionId="open_services"
              surface="home:action_footer"
              conversionContext={{ placement: "action_footer", variant: "services", audience: "all" }}
              className="theme-cta theme-cta--loud justify-center px-6 py-4"
            >
              Tech Services
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/music"
              conversionId="open_music"
              surface="home:action_footer"
              conversionContext={{ placement: "action_footer", variant: "music", audience: "all" }}
              className="theme-cta theme-cta--loud justify-center px-6 py-4"
            >
              Explore Music
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/intelligence"
              conversionId="open_intelligence"
              surface="home:action_footer"
              conversionContext={{ placement: "action_footer", variant: "intelligence", audience: "all" }}
              className="theme-cta theme-cta--loud justify-center px-6 py-4"
            >
              View Intelligence
            </TrackedCtaLink>
          </div>
        </div>
      </section>

      {/* Service Grid Section */}
      <DeferredRender
        fallback={
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20" aria-busy="true">
            <div className="theme-panel p-6 sm:p-8">
              <div className="h-4 w-40 rounded bg-white/10 animate-pulse" />
              <div className="mt-4 h-3 w-3/4 rounded bg-white/10 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        }
      >
        <section id="home-service-grid">
          <ServiceGrid />
        </section>
      </DeferredRender>

      <DeferredRender
        fallback={
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20" aria-busy="true">
            <div className="theme-panel p-6 sm:p-8">
              <div className="h-4 w-36 rounded bg-white/10 animate-pulse" />
              <div className="mt-4 h-3 w-2/3 rounded bg-white/10 animate-pulse" />
              <div className="mt-2 h-3 w-1/2 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        }
      >
        <section id="home-ai-neural">
          <AINeuralHub />
        </section>
      </DeferredRender>

      <DeferredRender
        fallback={
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20" aria-busy="true">
            <div className="theme-panel p-6 sm:p-8">
              <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
              <div className="mt-4 h-3 w-3/5 rounded bg-white/10 animate-pulse" />
              <div className="mt-2 h-3 w-2/5 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        }
      >
        <section id="home-roadmap">
          <Roadmap />
        </section>
      </DeferredRender>

      {/* Quick Contact Rail */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 p-6 sm:p-8 glass-panel rounded-3xl border border-white/5">
          <p className="text-zinc-300 font-mono text-xs uppercase tracking-widest">Direct Access</p>
          <TrackedCtaLink
            href={businessProfile.contactLinks.text}
            conversionId="contact_text"
            surface="home:footer_rail"
            external
            className="flex items-center gap-2 text-white hover:text-cyan-500 transition-colors font-bold"
          >
            <MessageSquare className="w-4 h-4" />
            Text {businessProfile.contactPhoneDisplay}
          </TrackedCtaLink>
          <div className="h-4 w-px bg-zinc-800 hidden md:block" />
          <Link href="/about" className="text-zinc-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">
            About
          </Link>
          <Link href="/portfolio" className="text-zinc-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">
            Portfolio
          </Link>
        </div>
      </section>

      <div className="mobile-action-shell md:hidden">
        <div className="mobile-action-grid">
          <TrackedCtaLink
            href={scheduleLinks.root}
            conversionId="open_schedule"
            surface="home:mobile_sticky"
            conversionContext={{ placement: "sticky", variant: "book_now", audience: "all" }}
            className="mobile-action-btn mobile-action-btn--primary"
          >
            Book Now
          </TrackedCtaLink>
          <TrackedCtaLink
            href="/services"
            conversionId="open_services"
            surface="home:mobile_sticky"
            conversionContext={{ placement: "sticky", variant: "services", audience: "all" }}
            className="mobile-action-btn"
          >
            Services
          </TrackedCtaLink>
        </div>
      </div>
    </main>
  );
}
