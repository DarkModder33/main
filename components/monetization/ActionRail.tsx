import { TrackedCtaLink } from "@/components/monetization/TrackedCtaLink";
import { bookingLinks } from "@/lib/booking";
import { CalendarClock, CreditCard, Gem, Mail } from "lucide-react";

interface ActionRailProps {
  surface: string;
  className?: string;
}

export function ActionRail({ surface, className = "" }: ActionRailProps) {
  return (
    <section className={`theme-panel p-4 sm:p-5 ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <span className="theme-kicker">Pipeline Shortcuts</span>
        <span className="theme-chip">Book | Mint | Subscribe | Contact</span>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <TrackedCtaLink
          href="/schedule"
          conversionId="open_schedule"
          surface={`${surface}:action_rail`}
          className="theme-cta theme-cta--compact w-full"
        >
          <CalendarClock className="w-4 h-4" />
          Book Service
        </TrackedCtaLink>
        <TrackedCtaLink
          href="/crypto-project"
          conversionId="open_crypto_project"
          surface={`${surface}:action_rail`}
          className="theme-cta theme-cta--secondary theme-cta--compact w-full"
        >
          <Gem className="w-4 h-4" />
          Mint Access
        </TrackedCtaLink>
        <TrackedCtaLink
          href="/pricing"
          conversionId="open_pricing"
          surface={`${surface}:action_rail`}
          className="theme-cta theme-cta--loud theme-cta--compact w-full"
        >
          <CreditCard className="w-4 h-4" />
          View Tiers
        </TrackedCtaLink>
        <TrackedCtaLink
          href="mailto:support@tradehaxai.tech?subject=TradeHax%20Project%20Inquiry"
          conversionId="email_contact"
          surface={`${surface}:action_rail`}
          external
          className="theme-cta theme-cta--muted theme-cta--compact w-full"
        >
          <Mail className="w-4 h-4" />
          Contact Direct
        </TrackedCtaLink>
      </div>
      <p className="mt-3 text-xs text-[#b4c7d6]">
        Fast lane: schedule support, open mint path, compare plans, or contact directly.
      </p>
      <p className="mt-1 text-[11px] text-[#9cb3c1]">
        Prefer immediate tech support?{" "}
        <TrackedCtaLink
          href={bookingLinks.techSupport}
          conversionId="book_repair_quote"
          surface={`${surface}:action_rail`}
          external
          className="text-[#9bffbf] font-semibold hover:text-[#00ff41] transition-colors"
        >
          Book a repair intake slot
        </TrackedCtaLink>
        .
      </p>
    </section>
  );
}
