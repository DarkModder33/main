"use client";

import { WalletButton } from "@/components/counter/WalletButton";
import { AINeuralHub } from '@/components/landing/AINeuralHub';
import { Roadmap } from '@/components/landing/Roadmap';
import { ServiceGrid } from '@/components/landing/ServiceGrid';
import { TrackedCtaLink } from "@/components/monetization/TrackedCtaLink";
import { GlitchText } from '@/components/ui/GlitchText';
import { LiveActivity } from '@/components/ui/LiveActivity';
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
import Link from 'next/link';

const intentLanes = [
  {
    title: "Need Service Now",
    detail: "Phone/computer repair, optimization, and urgent troubleshooting with rapid intake.",
    href: scheduleLinks.techSupport,
    external: false,
    conversionId: "book_repair_quote",
    surface: "home:intent_lane",
    cta: "Start Tech Support Intake",
    icon: Wrench,
  },
  {
    title: "Need a Build Partner",
    detail: "Website creation, app development, blockchain/crypto systems, and AI automation delivery.",
    href: scheduleLinks.webDevConsult,
    external: false,
    conversionId: "book_web3_consult",
    surface: "home:intent_lane",
    cta: "Book Build Consultation",
    icon: MonitorSmartphone,
  },
  {
    title: "Music Lessons and Artist Growth",
    detail: "Private guitar lessons, platform growth, and scholarship/reward infrastructure.",
    href: "/music",
    external: false,
    conversionId: "open_music",
    surface: "home:intent_lane",
    cta: "Explore Music Services",
    icon: Guitar,
  },
  {
    title: "Trading Research and Token Roadmap",
    detail: "Follow market discussions, project updates, and utility-token roadmap progress.",
    href: "/crypto-project",
    external: false,
    conversionId: "open_crypto_project",
    surface: "home:intent_lane",
    cta: "Review Crypto Project",
    icon: CircuitBoard,
  },
  {
    title: "Need Snow Removal in South Jersey",
    detail: "Fast snow plowing and driveway clearing across Atlantic County, NJ with local response.",
    href: "/snow-removal",
    external: false,
    conversionId: "open_services",
    surface: "home:intent_lane",
    cta: "Book Snow Removal",
    icon: Wrench,
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero + Scaffold */}
      <section className="relative overflow-hidden px-6 pt-20 pb-14">
        <div className="absolute top-[-8rem] right-[-6rem] w-[460px] h-[460px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-9rem] left-[-4rem] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <div className="theme-panel p-8 md:p-12">
            <span className="theme-kicker mb-4">Operational Entry</span>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic uppercase mb-5">
              <GlitchText text="TradeHax" />
            </h1>
            <p className="text-zinc-300 text-lg max-w-2xl leading-relaxed mb-8">
              Professional digital execution for service, growth, and AI workflows.
              Start with a clear intent and move through a predictable path.
            </p>

            <div className="flex flex-wrap gap-3">
              <TrackedCtaLink
                href={scheduleLinks.root}
                conversionId="open_schedule"
                surface="home:hero"
                className="theme-cta theme-cta--loud px-6 py-3"
              >
                Start Service Intake
              </TrackedCtaLink>
              <Link
                href="/ai-hub"
                className="theme-cta theme-cta--secondary px-6 py-3"
              >
                Open AI Workspace
              </Link>
              <Link
                href="/pricing"
                className="theme-cta theme-cta--muted px-6 py-3"
              >
                Review Plans
              </Link>
            </div>
          </div>

          <div className="theme-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-300">Execution Scaffold</h2>
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="space-y-3">
              {[
                {
                  title: "1) Define Intent",
                  detail: "Choose service, AI workflow, or market research path.",
                },
                {
                  title: "2) Follow Route",
                  detail: "Use guided page flow with minimal decision overhead.",
                },
                {
                  title: "3) Execute Next Action",
                  detail: "Book, deploy, or run the recommended operation.",
                },
              ].map((step) => (
                <article key={step.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    {step.title}
                  </h3>
                  <p className="text-xs text-zinc-400">{step.detail}</p>
                </article>
              ))}
            </div>
            <div className="mt-5">
              <div className="min-h-10">
                <WalletButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      <LiveActivity />

      {/* Intent Lanes Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="theme-panel p-8 md:p-12">
          <span className="theme-kicker mb-4">Start Here</span>
          <h2 className="theme-title text-4xl md:text-5xl mb-6">Choose Your Primary Path</h2>
          <p className="text-zinc-300 max-w-2xl mb-12 text-lg">
            This matrix removes guesswork: select one lane, complete the route, then return for the next objective.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {intentLanes.map((lane) => (
              <article key={lane.title} className="theme-grid-card">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 mb-4">
                  <lane.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white uppercase italic">{lane.title}</h3>
                <p className="text-zinc-300 text-sm leading-relaxed">{lane.detail}</p>
                <TrackedCtaLink
                  href={lane.href}
                  external={lane.external}
                  conversionId={lane.conversionId}
                  surface={lane.surface}
                  className="theme-cta theme-cta--secondary mt-4 self-start"
                >
                  {lane.cta}
                  <ArrowRight className="w-4 h-4" />
                </TrackedCtaLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Service Grid Section */}
      <ServiceGrid />

      <AINeuralHub />

      <Roadmap />

      {/* Quick Contact Rail */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-center justify-center gap-6 p-8 glass-panel rounded-3xl border border-white/5">
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
          <Link href="/snow-removal" className="text-zinc-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">
            Snow Removal NJ
          </Link>
        </div>
      </section>
    </main>
  );
}
