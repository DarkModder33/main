import { ActionRail } from "@/components/monetization/ActionRail";
import { TrackedCtaLink } from "@/components/monetization/TrackedCtaLink";
import { createPageMetadata } from "@/lib/seo";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FlaskConical,
  LayoutDashboard,
  Radar,
  Sparkles,
} from "lucide-react";

export const metadata = createPageMetadata({
  title: "Crypto Project | TradeHax AI — Cross-Chain Intelligence & Trading Tools",
  description:
    "The TradeHax AI crypto project: cross-chain flow intelligence, AI-powered portfolio analytics, strategy building, backtesting, and sentiment analysis — all in one place.",
  path: "/crypto-project",
  keywords: [
    "crypto intelligence",
    "cross-chain flow",
    "crypto portfolio tracker",
    "AI trading tools",
    "crypto strategy builder",
    "backtesting crypto",
    "crypto sentiment engine",
    "web3 analytics",
    "bitcoin ethereum solana",
  ],
});

const capabilities = [
  {
    icon: Radar,
    title: "Cross-Chain Flow Intelligence",
    description:
      "Monitor pair-level directional flow across Ethereum, Solana, Avalanche, BSC, and more. Filter by chain, pair, side, notional size, and confidence score in real time.",
    color: "cyan",
  },
  {
    icon: LayoutDashboard,
    title: "Portfolio Dashboard",
    description:
      "Connect your exchanges and track your full multi-asset crypto portfolio in one place. Real-time value, allocation charts, and AI-powered rebalance suggestions.",
    color: "emerald",
  },
  {
    icon: Activity,
    title: "Sentiment Engine",
    description:
      "Fear & Greed analysis aggregated from social media, news, and on-chain signals. Watch market mood shift in real time across BTC, ETH, and SOL.",
    color: "amber",
  },
  {
    icon: BrainCircuit,
    title: "Strategy Builder",
    description:
      "Drag-and-drop no-code strategy canvas. Combine indicators, filters, and actions, then export or push directly to a bot.",
    color: "purple",
  },
  {
    icon: FlaskConical,
    title: "Backtesting Sandbox",
    description:
      "Run your strategies against historical crypto data. Analyze equity curves, win rate, max drawdown, and monthly returns with one-click reports.",
    color: "rose",
  },
  {
    icon: BarChart3,
    title: "AI Signal Explainability",
    description:
      "See exactly why the AI generated each crypto signal. Factor weights, confidence breakdown, risk assessment, and similar historical precedents.",
    color: "indigo",
  },
] as const;

const roadmapItems = [
  {
    phase: "Now",
    label: "Live",
    color: "emerald",
    items: [
      "Cross-chain crypto flow tape (ETH, SOL, AVAX, BSC)",
      "Real-time pair-level directional flow with confidence scoring",
      "Multi-exchange portfolio aggregation and allocation charts",
      "AI-powered rebalance suggestions",
      "Fear & Greed sentiment gauge",
    ],
  },
  {
    phase: "Next",
    label: "In Progress",
    color: "cyan",
    items: [
      "Drag-and-drop strategy builder with no-code blocks",
      "Historical backtesting engine with equity curve",
      "AI explainability layer for each generated signal",
      "On-chain whale radar and wallet tracking",
      "Cross-asset correlation scanner",
    ],
  },
  {
    phase: "Later",
    label: "Planned",
    color: "purple",
    items: [
      "Automated bot execution with kill-switch controls",
      "Decentralised exchange (DEX) analytics integration",
      "Multi-signature portfolio management support",
      "Advanced options flow for crypto derivatives",
      "Institutional-grade reporting and export tools",
    ],
  },
] as const;

const faqs = [
  {
    q: "Is this financial advice?",
    a: "No. All signals, flow data, and analytics are strictly educational and informational. TradeHax AI does not provide personalised financial or investment advice. Always conduct your own research and consult a licensed financial professional before trading.",
  },
  {
    q: "Which blockchains are supported?",
    a: "The crypto flow intelligence currently covers Ethereum, Solana, Avalanche (C-Chain), BSC, Polygon, Arbitrum, and Optimism. Coverage is expanding with each release.",
  },
  {
    q: "How is the flow data sourced?",
    a: "Flow data is aggregated from on-chain transaction feeds, DEX APIs, and centralised exchange order-book tapes. All data is filtered for minimum notional thresholds and assigned a confidence score before display.",
  },
  {
    q: "Can I use these tools without connecting a wallet or exchange?",
    a: "Yes. The flow intelligence and sentiment modules are fully read-only and require no wallet or API connection. The portfolio dashboard optionally connects to exchanges for real-time balance tracking.",
  },
  {
    q: "What is the risk disclaimer for automated strategies?",
    a: "Automated crypto strategies carry significant risk including total loss of capital. Markets are volatile, APIs can fail, and past backtest performance is not indicative of future results. Use position sizing and hard stop-losses at all times.",
  },
] as const;

export default function CryptoProjectPage() {
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* ── Hero ── */}
        <section className="theme-panel p-8 sm:p-12 md:p-16 mb-8 text-center">
          <span className="theme-kicker mb-5">Crypto Project</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight font-black text-white tracking-tighter uppercase mb-6">
            Cross-Chain Intelligence &amp; AI Trading Tools
          </h1>
          <p className="text-zinc-200 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
            The TradeHax AI crypto platform unifies cross-chain flow intelligence, portfolio analytics, sentiment
            monitoring, strategy building, and AI signal explainability — all under one roof.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <TrackedCtaLink
              href="/ai-hub"
              conversionId="open_ai_chat"
              surface="crypto-project:hero"
              className="theme-cta theme-cta--loud px-6 py-3"
            >
              Launch AI Copilot
              <ArrowRight className="w-4 h-4" />
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/intelligence"
              conversionId="open_intelligence"
              surface="crypto-project:hero"
              className="theme-cta theme-cta--secondary px-6 py-3"
            >
              View Intelligence Hub
            </TrackedCtaLink>
          </div>
        </section>

        <ActionRail surface="crypto-project" className="mb-8" />

        {/* ── Capabilities ── */}
        <section className="mb-8">
          <div className="theme-panel p-6 sm:p-8 mb-6">
            <span className="theme-kicker mb-3">What&apos;s Included</span>
            <h2 className="theme-title text-2xl sm:text-3xl font-bold mb-2">Platform Capabilities</h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl">
              Six production-ready modules working together — from on-chain flow to automated strategy execution.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, description, color }) => (
              <article key={title} className="theme-grid-card">
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-${color}-500/10 mb-4`}>
                  <Icon className={`w-5 h-5 text-${color}-400`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Why Crypto Intelligence ── */}
        <section className="theme-panel p-6 sm:p-8 mb-8">
          <span className="theme-kicker mb-3">Edge</span>
          <h2 className="theme-title text-2xl font-bold mb-6">Why Use AI-Powered Crypto Intelligence?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                { text: "See directional flow before price moves — cross-chain notional data surfaces large coordinated buys and sells." },
                { text: "Risk-first framework with compliance language — educational signals only, never financial advice." },
                { text: "Multi-chain coverage unified in one view — no need to monitor five separate block explorers." },
              ].map(({ text }) => (
                <div key={text} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[
                { text: "Backtested confidence scoring — every signal comes with a historical win-rate context." },
                { text: "Explainable AI — understand the exact factors and weights behind each generated signal." },
                { text: "Sentiment-aware strategy tuning — sync strategy aggressiveness with live Fear & Greed conditions." },
              ].map(({ text }) => (
                <div key={text} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Roadmap ── */}
        <section className="mb-8">
          <div className="theme-panel p-6 sm:p-8 mb-6">
            <span className="theme-kicker mb-3">Progress</span>
            <h2 className="theme-title text-2xl font-bold">Product Roadmap</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {roadmapItems.map(({ phase, label, color, items }) => (
              <div key={phase} className="theme-grid-card">
                <div className={`flex items-center gap-2 mb-4`}>
                  <span className={`text-xs font-bold uppercase tracking-widest text-${color}-400 border border-${color}-400/30 rounded-full px-2 py-0.5 bg-${color}-500/10`}>
                    {label}
                  </span>
                  <h3 className="font-bold text-white">{phase}</h3>
                </div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                      <Sparkles className={`w-3 h-3 text-${color}-400 mt-0.5 shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ & Disclaimers ── */}
        <section className="theme-panel p-6 sm:p-8 mb-8">
          <span className="theme-kicker mb-3">FAQ &amp; Disclaimers</span>
          <h2 className="theme-title text-2xl font-bold mb-6">Common Questions</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <summary className="cursor-pointer text-sm font-semibold text-white">{q}</summary>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-500/5 p-4 text-xs text-amber-200 leading-relaxed">
            <strong className="block mb-1 text-amber-100 uppercase tracking-wide">Important Risk Disclosure</strong>
            Cryptocurrency trading involves significant risk of loss and is not suitable for all investors. Past
            performance of any tool, signal, or strategy shown on this platform is not indicative of future results.
            TradeHax AI is an educational technology platform and does not hold any financial services licence. Nothing
            on this page constitutes financial, investment, or trading advice.
          </div>
        </section>

        {/* ── CTA Links ── */}
        <section className="theme-panel p-6 sm:p-8">
          <h2 className="theme-title text-xl font-bold mb-6">Get Started</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <TrackedCtaLink
              href="/ai-hub"
              conversionId="open_ai_chat"
              surface="crypto-project:cta"
              className="theme-cta theme-cta--loud justify-center px-5 py-4"
            >
              AI Copilot
              <ArrowRight className="w-4 h-4" />
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/intelligence"
              conversionId="open_intelligence"
              surface="crypto-project:cta"
              className="theme-cta theme-cta--secondary justify-center px-5 py-4"
            >
              Intelligence Hub
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/pricing"
              conversionId="open_pricing"
              surface="crypto-project:cta"
              className="theme-cta theme-cta--secondary justify-center px-5 py-4"
            >
              View Plans
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/schedule"
              conversionId="open_schedule"
              surface="crypto-project:cta"
              className="theme-cta theme-cta--secondary justify-center px-5 py-4"
            >
              Book Consult
            </TrackedCtaLink>
          </div>
        </section>

      </main>
    </div>
  );
}

