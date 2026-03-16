import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <ShamrockHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <section className="theme-panel p-6 sm:p-8 mb-8">
          <span className="theme-kicker mb-3">Welcome to TradeHax AI Onboarding</span>
          <h1 className="theme-title text-3xl sm:text-4xl mb-4">Get Started</h1>
          <p className="text-[#a6bdd0] max-w-2xl mb-6">
            This onboarding guide will help you quickly understand the platform, unlock AI features, and access trading tools. Follow the steps below for a seamless start.
          </p>
          <ol className="list-decimal list-inside text-[#b7cbe3] mb-6">
            <li>Explore the <Link href="/ai-hub" className="text-[#00ff41] underline">AI Hub</Link> for advanced tools.</li>
            <li>Visit <Link href="/trading" className="text-[#00ff41] underline">Trading</Link> to start your journey.</li>
            <li>Check <Link href="/services" className="text-[#00ff41] underline">Services</Link> for personalized options.</li>
            <li>Review <Link href="/portfolio" className="text-[#00ff41] underline">Portfolio</Link> to track your progress.</li>
            <li>Need help? Use the <Link href="/schedule" className="text-[#00ff41] underline">Contact</Link> page for support.</li>
          </ol>
          <div className="mt-6">
            <Link href="/" className="inline-flex items-center rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/20">Back to Home</Link>
          </div>
        </section>
      </main>
      <ShamrockFooter />
    </div>
  );
}

