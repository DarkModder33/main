"use client";

import { TrackedCtaLink } from "@/components/monetization/TrackedCtaLink";
import { scheduleLinks } from "@/lib/booking";
import { ArrowRight, Sparkles, Wrench, Code2, Guitar } from "lucide-react";
import { useMemo, useState } from "react";

const EXAMPLE_PROMPTS = [
  "iPhone screen broken",
  "laptop water damage",
  "Android battery replacement",
  "Need a landing page",
  "Build a mobile app",
  "Guitar lessons remote",
  "Data recovery from failed drive",
  "Unbrick my phone",
] as const;

type EstimateResult = {
  title: string;
  range: string;
  note: string;
  href: string;
  conversionId: "book_repair_quote" | "book_ai_consult" | "book_guitar_lesson" | "open_schedule";
  icon: "repair" | "dev" | "music" | "general";
};

function matchEstimate(query: string): EstimateResult {
  const q = query.toLowerCase().trim();

  if (!q) {
    return {
      title: "Free scope & quote",
      range: "$89+",
      note: "Tell us what you need — we reply with a clear range the same day.",
      href: scheduleLinks.root,
      conversionId: "open_schedule",
      icon: "general",
    };
  }

  // Device / repair keywords
  if (
    /screen|display|glass|cracked|broken phone|iphone|android|tablet|ipad|battery|charging|port|water|liquid|damage|data recover|unbrick|esim|imei|esn|firmware|bricked/.test(
      q,
    )
  ) {
    return {
      title: "Device repair / recovery",
      range: "$50 – $200",
      note: "Remote diagnostics when possible. Mail-in and Greater Philadelphia options available.",
      href: scheduleLinks.techSupport,
      conversionId: "book_repair_quote",
      icon: "repair",
    };
  }

  // Development / web / app
  if (
    /website|landing|web app|mobile app|ios|android app|shopify|ecommerce|e-commerce|api|backend|ai bot|chatbot|automation|web3|smart contract|next\.js|react/.test(
      q,
    )
  ) {
    return {
      title: "Custom development",
      range: "From $299",
      note: "Landing pages to full apps, AI integrations, and e-commerce. Scoped before any invoice.",
      href: scheduleLinks.webDevConsult,
      conversionId: "book_ai_consult",
      icon: "dev",
    };
  }

  // Music / lessons
  if (/guitar|lesson|music|coaching|practice|song|riff/.test(q)) {
    return {
      title: "Remote guitar lessons",
      range: "From $40 / session",
      note: "1-on-1 remote sessions via Google Meet, Zoom, or Teams. All levels welcome.",
      href: scheduleLinks.guitarLessons,
      conversionId: "book_guitar_lesson",
      icon: "music",
    };
  }

  return {
    title: "Custom quote",
    range: "Free estimate",
    note: "We’ll map the right service and send a clear price range quickly.",
    href: scheduleLinks.root,
    conversionId: "open_schedule",
    icon: "general",
  };
}

export function InstantEstimate() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => matchEstimate(query), [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const applyPrompt = (prompt: string) => {
    setQuery(prompt);
    setSubmitted(true);
  };

  const Icon =
    result.icon === "repair"
      ? Wrench
      : result.icon === "dev"
        ? Code2
        : result.icon === "music"
          ? Guitar
          : Sparkles;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="instant-estimate" className="sr-only">
          Describe your issue or project for an instant estimate
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="instant-estimate"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (submitted) setSubmitted(false);
            }}
            placeholder="e.g. iPhone screen broken, need a landing page…"
            className="flex-1 min-h-[48px] rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-colors"
            autoComplete="off"
          />
          <button
            type="submit"
            className="theme-cta theme-cta--loud min-h-[48px] px-6 shrink-0"
          >
            Get free estimate
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Example prompts */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => applyPrompt(prompt)}
            className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Result card */}
      {(submitted || query.length > 2) && (
        <div className="mt-6 rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-5 sm:p-6 animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
                Instant range
              </p>
              <h3 className="text-lg font-bold text-white">{result.title}</h3>
              <p className="text-2xl font-black text-white mt-1">{result.range}</p>
              <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{result.note}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <TrackedCtaLink
                  href={result.href}
                  conversionId={result.conversionId}
                  surface="home:instant_estimate"
                  conversionContext={{
                    placement: "estimate_result",
                    variant: result.icon,
                    audience: "all",
                  }}
                  className="theme-cta theme-cta--loud theme-cta--compact"
                >
                  Book free quote
                  <ArrowRight className="w-3.5 h-3.5" />
                </TrackedCtaLink>
                <TrackedCtaLink
                  href="/services"
                  conversionId="open_services"
                  surface="home:instant_estimate"
                  className="theme-cta theme-cta--secondary theme-cta--compact"
                >
                  View all services
                </TrackedCtaLink>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-zinc-500 border-t border-white/5 pt-3">
            Ranges are estimates only. Final price after short discovery. Remote, mail-in, and Greater Philadelphia options available.
          </p>
        </div>
      )}
    </div>
  );
}
