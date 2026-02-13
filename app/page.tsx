import { WalletButton } from "@/components/counter/WalletButton";
import { InContentAd, FooterBannerAd } from "@/components/monetization/AdSenseBlock";
import { EmailCaptureModal } from "@/components/monetization/EmailCaptureModal";
import { RecommendedTools } from "@/components/monetization/AffiliateBanner";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import { bookingLinks } from "@/lib/booking";
import {
  ArrowRight,
  CalendarClock,
  CircuitBoard,
  CreditCard,
  Gamepad2,
  Gem,
  Guitar,
  HandCoins,
  House,
  Info,
  MonitorSmartphone,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TradeHax AI - Matrix Web3 Platform",
  description:
    "Professional matrix-themed Web3 platform with Solana trading, NFT mint utilities, repair bookings, guitar lessons, and digital services.",
};

const menuCards = [
  {
    href: "/",
    title: "Home",
    description: "Return to mission control for TradeHax AI.",
    icon: House,
  },
  {
    href: "/crypto-project",
    title: "Crypto Project",
    description: "Devnet mint flow, wallet onboarding, and NFT access.",
    icon: Gem,
  },
  {
    href: "/schedule",
    title: "Schedule",
    description: "Book repair, lessons, and consulting sessions fast.",
    icon: CalendarClock,
  },
  {
    href: "/pricing",
    title: "Pricing",
    description: "Clear tiers for service retainers and subscriptions.",
    icon: CreditCard,
  },
  {
    href: "/about",
    title: "About",
    description: "Legacy, customer trust, and execution standards.",
    icon: Info,
  },
  {
    href: "/services",
    title: "Services",
    description: "Repair, music instruction, and digital Web3 builds.",
    icon: Wrench,
  },
] as const;

const pipeline = [
  {
    title: "Signal Intake",
    detail:
      "Capture market, client, and service requests into one operating lane.",
  },
  {
    title: "AI + Human Review",
    detail:
      "Blend automation with operator checks before execution for reliability.",
  },
  {
    title: "Execution Layer",
    detail:
      "Run trading actions, booking flows, and delivery tasks with auditable status.",
  },
  {
    title: "Revenue Loop",
    detail:
      "Monetize through mint upgrades, bookings, subscriptions, and referrals.",
  },
] as const;

const galleryItems = [
  { src: "/reference-hyperborea-thumb.jpg", caption: "Hyperborea Original Visual" },
  { src: "/og-home.svg", caption: "Main Platform Portal" },
  { src: "/og-game.svg", caption: "Escher Maze Game Interface" },
  { src: "/og-dashboard.svg", caption: "Trading Dashboard Surface" },
  { src: "/og-services.svg", caption: "Service Booking Presentation" },
  { src: "/og-music.svg", caption: "Music and Lessons Hub" },
] as const;

export default function Home() {
  return (
    <>
      <ShamrockHeader />

      <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-10">
        <section className="max-w-7xl mx-auto mb-10 sm:mb-14">
          <div className="theme-panel p-6 sm:p-8 md:p-10">
            <div className="max-w-4xl">
              <span className="theme-kicker mb-4">TradeHax Matrix Core</span>
              <div className="theme-hero-sign p-5 sm:p-7 md:p-8">
                <p className="theme-rune text-xs sm:text-sm mb-3">
                  TECH RUNES | SOLANA PIPELINE | DIGITAL WORKSHOP
                </p>
                <h1 className="theme-title text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                  Expert Repairs, Guitar Lessons, and{" "}
                  <span className="theme-title-accent">Web3 Services</span>
                </h1>
                <p className="theme-subtitle text-sm sm:text-base mb-6">
                  Serving Greater Philadelphia and remote clients with a
                  professional matrix-style platform for booking, trading, and
                  Solana-native project execution.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <span className="theme-badge">2h Response Goal</span>
                  <span className="theme-badge">25+ Years Experience</span>
                  <span className="theme-badge">Remote-First Workflow</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/schedule"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00ff41] px-5 py-3 text-black font-semibold hover:bg-[#39ff14] transition-colors"
                >
                  Book Service
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/crypto-project"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#00ff41]/50 bg-[#05120a] px-5 py-3 text-[#9bffc0] font-semibold hover:border-[#00ff41] transition-colors"
                >
                  Open Crypto Project
                  <CircuitBoard className="w-4 h-4" />
                </Link>
                <div className="min-h-10">
                  <WalletButton />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto mb-10 sm:mb-14">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {menuCards.map(({ href, title, description, icon: Icon }) => (
              <Link key={href} href={href} className="theme-grid-card">
                <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl border border-[#00ff41]/40 bg-[#06130c] text-[#8cf8b4]">
                  <Icon className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p>{description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto mb-10 sm:mb-14">
          <div className="theme-panel p-6 sm:p-8">
            <span className="theme-kicker mb-3">Automation Pipeline</span>
            <h2 className="theme-title text-2xl sm:text-3xl font-bold mb-6">
              Keep New Features, Organized as One Pipeline
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {pipeline.map((step, index) => (
                <article key={step.title} className="theme-grid-card">
                  <span className="text-[#73fba8] text-xs tracking-widest font-semibold">
                    STEP 0{index + 1}
                  </span>
                  <h3 className="text-white text-lg font-semibold">{step.title}</h3>
                  <p>{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto mb-10 sm:mb-14">
          <div className="theme-panel p-6 sm:p-8">
            <span className="theme-kicker mb-3">Core Services</span>
            <h2 className="theme-title text-2xl sm:text-3xl font-bold mb-6">
              Real-World Work + Solana Digital Execution
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              <article className="theme-grid-card">
                <div className="inline-flex w-10 h-10 items-center justify-center rounded-lg border border-[#00ff41]/40 bg-[#06130c] text-[#7cf5ad]">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Phone and Device Repair</h3>
                <p>Fast diagnostics, remote triage, and local repair scheduling.</p>
                <a
                  href={bookingLinks.techSupport}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8bffb7] text-sm font-semibold hover:text-[#00ff41] transition-colors"
                >
                  Request a Repair Quote
                </a>
              </article>
              <article className="theme-grid-card">
                <div className="inline-flex w-10 h-10 items-center justify-center rounded-lg border border-[#00ff41]/40 bg-[#06130c] text-[#7cf5ad]">
                  <Guitar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Remote Guitar Lessons</h3>
                <p>Structured lesson tracks with live sessions and progress plans.</p>
                <a
                  href={bookingLinks.guitarLessons}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8bffb7] text-sm font-semibold hover:text-[#00ff41] transition-colors"
                >
                  Reserve a Lesson Slot
                </a>
              </article>
              <article className="theme-grid-card">
                <div className="inline-flex w-10 h-10 items-center justify-center rounded-lg border border-[#00ff41]/40 bg-[#06130c] text-[#7cf5ad]">
                  <MonitorSmartphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Digital and Web3 Services</h3>
                <p>AI trading builds, Solana app work, and automation implementation.</p>
                <a
                  href={bookingLinks.webDevConsult}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8bffb7] text-sm font-semibold hover:text-[#00ff41] transition-colors"
                >
                  Start a Build Consultation
                </a>
              </article>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto mb-10 sm:mb-14">
          <div className="theme-panel p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <span className="theme-kicker mb-2">Visual Archive</span>
                <h2 className="theme-title text-2xl font-bold">Legacy Gallery Stream</h2>
              </div>
              <span className="theme-chip">Scroll Horizontally</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-1">
              {galleryItems.map((item) => (
                <figure key={item.caption} className="theme-gallery-card">
                  <Image
                    src={item.src}
                    alt={item.caption}
                    width={220}
                    height={124}
                    unoptimized={item.src.endsWith(".svg")}
                  />
                  <figcaption className="caption">{item.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto mb-10 sm:mb-14">
          <InContentAd />
        </section>

        <section className="max-w-7xl mx-auto mb-10 sm:mb-14">
          <div className="theme-panel p-6 sm:p-8">
            <span className="theme-kicker mb-3">Income Generation</span>
            <h2 className="theme-title text-2xl sm:text-3xl font-bold mb-6">
              Monetization Lanes Built Into the Platform
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="theme-grid-card">
                <HandCoins className="w-5 h-5 text-[#77f9a7]" />
                <h3 className="font-semibold">Bookings</h3>
                <p>Paid repair, lessons, and consulting appointments.</p>
                <Link href="/schedule" className="text-[#8bffb7] text-sm font-semibold">
                  Open Schedule
                </Link>
              </article>
              <article className="theme-grid-card">
                <Gem className="w-5 h-5 text-[#77f9a7]" />
                <h3 className="font-semibold">NFT Mints</h3>
                <p>Free entry mints with premium upgrade utilities.</p>
                <Link href="/crypto-project" className="text-[#8bffb7] text-sm font-semibold">
                  Mint Access
                </Link>
              </article>
              <article className="theme-grid-card">
                <CreditCard className="w-5 h-5 text-[#77f9a7]" />
                <h3 className="font-semibold">Subscriptions</h3>
                <p>Monthly tiers for insights, support, and premium sessions.</p>
                <Link href="/pricing" className="text-[#8bffb7] text-sm font-semibold">
                  View Tiers
                </Link>
              </article>
              <article className="theme-grid-card">
                <Gamepad2 className="w-5 h-5 text-[#77f9a7]" />
                <h3 className="font-semibold">Cross-Upsells</h3>
                <p>Game, dashboard, and service ecosystem conversion flow.</p>
                <Link href="/dashboard" className="text-[#8bffb7] text-sm font-semibold">
                  Launch Dashboard
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto mb-12">
          <RecommendedTools />
        </section>

        <section className="max-w-7xl mx-auto mb-8">
          <FooterBannerAd />
        </section>
      </main>

      <ShamrockFooter />
      <EmailCaptureModal />
    </>
  );
}
