import { ShamrockFooter } from "@/components/shamrock/ShamrockFooter";
import { ShamrockHeader } from "@/components/shamrock/ShamrockHeader";
import { bookingLinks } from "@/lib/booking";
import { CalendarCheck2, Clock3, Link2, MonitorCog } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schedule - TradeHax AI",
  description:
    "Book repairs, lessons, and consulting through TradeHax AI scheduling pipelines.",
};

const bookingOptions = [
  {
    title: "Device Repair",
    detail: "Remote-first diagnostics and hardware support scheduling.",
    href: bookingLinks.techSupport,
  },
  {
    title: "Guitar Lessons",
    detail: "Weekly and monthly lesson scheduling with live remote sessions.",
    href: bookingLinks.guitarLessons,
  },
  {
    title: "Web3 Consulting",
    detail: "Architecture planning, pipeline setup, and Solana integrations.",
    href: bookingLinks.webDevConsult,
  },
] as const;

export default function SchedulePage() {
  return (
    <div className="min-h-screen">
      <ShamrockHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <section className="theme-panel p-6 sm:p-8 mb-8">
          <span className="theme-kicker mb-3">Scheduling Pipeline</span>
          <h1 className="theme-title text-3xl sm:text-4xl font-bold mb-4">
            Book Services in the Matrix Operations Flow
          </h1>
          <p className="theme-subtitle">
            Use the direct booking lanes below. This page is optimized for both
            desktop and mobile scheduling.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-3 mb-8">
          {bookingOptions.map((item) => (
            <article key={item.title} className="theme-grid-card">
              <CalendarCheck2 className="w-5 h-5 text-[#77f9a8]" />
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p>{item.detail}</p>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="theme-cta theme-cta--compact mt-1 self-start"
              >
                Open Booking
                <Link2 className="w-4 h-4" />
              </a>
            </article>
          ))}
        </section>

        <section className="theme-panel p-5 sm:p-6 mb-8">
          <h2 className="theme-title text-2xl font-bold mb-4">
            Embedded Calendar View
          </h2>
          <div className="rounded-xl overflow-hidden border border-[#5f769f]/45 bg-[#040a13]">
            <iframe
              title="TradeHax AI Calendar"
              src="https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FNew_York"
              className="w-full h-[560px]"
            />
          </div>
          <p className="text-xs text-[#9ca9c5] mt-3">
            Replace this calendar source with your production booking calendar
            URL for live availability.
          </p>
        </section>

        <section className="theme-panel p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="theme-grid-card">
              <Clock3 className="w-5 h-5 text-[#77f9a8]" />
              <h3 className="font-semibold text-lg">Response Commitment</h3>
              <p>Target first-response window is under two hours during active hours.</p>
            </article>
            <article className="theme-grid-card">
              <MonitorCog className="w-5 h-5 text-[#77f9a8]" />
              <h3 className="font-semibold text-lg">Remote-First</h3>
              <p>Most consultations and lessons are optimized for remote delivery.</p>
            </article>
          </div>
        </section>
      </main>
      <ShamrockFooter />
    </div>
  );
}
