import { TrackedCtaLink } from "@/components/monetization/TrackedCtaLink";
import { createPageMetadata } from "@/lib/seo";
import {
    ArrowRight,
    BookOpen,
    Guitar,
    Medal,
    Music2,
    Sparkles,
    Trophy,
    Users,
    Video
} from "lucide-react";

export const metadata = createPageMetadata({
  title: "Music Intelligence | AI-Assisted Guitar & Creative Growth",
  description:
    "AI-assisted guitar/music environment for learning, creative growth, and premium instruction. Expert teaching, AI-powered practice tools, and milestone-based progression.",
  path: "/music",
  keywords: [
    "online guitar lessons",
    "ai guitar lessons",
    "music intelligence",
    "guitar coaching",
    "music education",
    "remote guitar teacher",
    "beginner guitar lessons",
    "advanced guitar coaching",
  ],
});

export default function MusicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-28 md:pb-14">
        {/* Hero Section */}
        <section className="theme-panel p-8 sm:p-12 md:p-16 mb-8 text-center">
          <span className="theme-kicker mb-5">Music Intelligence</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight font-black text-white tracking-tighter italic uppercase mb-6">
            AI-Assisted Guitar & Creative Growth
          </h1>
          <p className="text-zinc-200 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
            Expert instruction meets intelligent practice systems. Real teaching experience, AI-powered progression tracking, and milestone-based rewards for committed students.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <TrackedCtaLink
              href="/music/lessons"
              conversionId="open_music_lessons"
              surface="music:hero"
              conversionContext={{ placement: "hero_primary", variant: "lessons", audience: "all" }}
              className="theme-cta theme-cta--loud px-6 py-3"
            >
              View Lesson Packages
              <ArrowRight className="w-4 h-4" />
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/music/showcase"
              conversionId="open_music_showcase"
              surface="music:hero"
              conversionContext={{ placement: "hero_secondary", variant: "showcase", audience: "all" }}
              className="theme-cta theme-cta--secondary px-6 py-3"
            >
              Artist Showcase
            </TrackedCtaLink>
          </div>
        </section>

        {/* Value Proposition - What You Get */}
        <section className="theme-panel p-6 sm:p-8 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase italic mb-6">What You Get</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-emerald-500/10">
                <Guitar className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Expert Guitar Instruction</h3>
                <p className="text-sm text-zinc-400">
                  15+ years teaching experience with personalized, one-on-one remote coaching sessions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-purple-500/10">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">AI-Powered Practice Plans</h3>
                <p className="text-sm text-zinc-400">
                  Adaptive weekly practice routines, technique drills, and progression checkpoints tailored to your goals
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-cyan-500/10">
                <Video className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Live Studio Sessions</h3>
                <p className="text-sm text-zinc-400">
                  60-minute personalized lessons via Google Meet with optional in-platform studio room
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-amber-500/10">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Progress Milestones</h3>
                <p className="text-sm text-zinc-400">
                  Track your progress with badges, achievement milestones, and professional review certificates.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-rose-500/10">
                <Music2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Technique & Songwriting</h3>
                <p className="text-sm text-zinc-400">
                  From fundamentals to advanced improvisation, composition, and performance coaching
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-indigo-500/10">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">Artist Growth Programs</h3>
                <p className="text-sm text-zinc-400">
                  Scholarship opportunities, performance showcases, and community collaboration features
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Teaching Philosophy */}
        <section className="theme-panel p-6 sm:p-8 mb-8 border-l-4 border-l-emerald-500">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-emerald-500/10">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white uppercase italic mb-3">Teaching Philosophy</h2>
              <div className="text-zinc-200 space-y-3">
                <p>
                  <strong className="text-white">Single-Teacher Promise:</strong> Every lesson is taught directly by the TradeHax founder, Michael S. Flaherty. No rotating instructors, no inconsistencyâ€”just clear, disciplined coaching from someone with 25+ years of playing experience and extensive teaching background.
                </p>
                <p>
                  <strong className="text-white">Skill First:</strong> Guitar mastery is the primary trust signal. Students experience measurable progress every session through precision fundamentals, creative songwriting guidance, and structured weekly goals.
                </p>
                <p>
                  <strong className="text-white">AI-Enhanced Learning:</strong> Between sessions, students receive AI-generated practice plans adapted to their pace, style, and learning preferencesâ€”keeping them accountable and motivated.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lesson Packages CTA */}
        <section className="theme-panel p-8 sm:p-12 text-center mb-8 border-l-4 border-l-cyan-500">
          <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase italic mb-4">Ready to Start?</h2>
          <p className="text-zinc-300 text-lg max-w-2xl mx-auto mb-6">
            All lesson packages start at $75 per session. View detailed pricing, book your first lesson, and start your guitar journey.
          </p>
          <TrackedCtaLink
            href="/music/lessons"
            conversionId="open_music_lessons"
            surface="music:packages"
            conversionContext={{ placement: "packages_section", variant: "view_all", audience: "all" }}
            className="theme-cta theme-cta--loud px-8 py-3 inline-flex items-center gap-2"
          >
            View Lesson Packages
            <ArrowRight className="w-4 h-4" />
          </TrackedCtaLink>
        </section>

        {/* Milestone Rewards Preview */}
        <section className="theme-panel p-6 sm:p-8 mb-8 border-l-4 border-l-amber-500">
          <div className="flex items-start gap-4 mb-6">
            <Medal className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white uppercase italic mb-2">Progress Milestones</h2>
              <p className="text-zinc-300 text-sm mb-4">
                Transparent milestones and achievement markers help students track progress, stay accountable, and move forward with confidence.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-emerald-500/20 rounded-lg p-4 bg-emerald-950/10">
              <p className="text-xs font-bold uppercase text-emerald-300 mb-2">Phase 1</p>
              <p className="text-sm text-white mb-1">First 4 lessons completed</p>
              <p className="text-xs text-zinc-400">Completion badge + referral review</p>
            </div>
            <div className="border border-cyan-500/20 rounded-lg p-4 bg-cyan-950/10">
              <p className="text-xs font-bold uppercase text-cyan-300 mb-2">Phase 2</p>
              <p className="text-sm text-white mb-1">First song performed cleanly</p>
              <p className="text-xs text-zinc-400">Certificate of progress + performance feedback</p>
            </div>
            <div className="border border-purple-500/20 rounded-lg p-4 bg-purple-950/10">
              <p className="text-xs font-bold uppercase text-purple-300 mb-2">Phase 3</p>
              <p className="text-sm text-white mb-1">12-lesson streak + review</p>
              <p className="text-xs text-zinc-400">Priority booking + follow-up plan</p>
            </div>
            <div className="border border-amber-500/20 rounded-lg p-4 bg-amber-950/10">
              <p className="text-xs font-bold uppercase text-amber-300 mb-2">Advanced</p>
              <p className="text-sm text-white mb-1">Original songwriting showcase</p>
              <p className="text-xs text-zinc-400">Performance spotlight + mentorship review</p>
            </div>
          </div>
        </section>

        {/* Additional Programs */}
        <section className="theme-panel p-6 sm:p-8 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase italic mb-6">Expand Your Journey</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <TrackedCtaLink
              href="/music/showcase"
              conversionId="open_music_showcase"
              surface="music:programs"
              conversionContext={{ placement: "programs_section", variant: "showcase", audience: "all" }}
              className="border border-purple-500/30 rounded-xl p-6 bg-gradient-to-br from-purple-950/20 to-black hover:border-purple-400/50 transition-all group flex flex-col"
            >
              <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-xl bg-purple-500/10">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                Artist Showcase
              </h3>
              <p className="text-zinc-300 mb-4 text-sm flex-grow">
                Discover featured artists, platform mechanics, and growth tools designed to expand audience reach and creative collaboration.
              </p>
              <span className="inline-flex items-center gap-2 text-purple-300 font-semibold text-sm">
                Explore Showcase
                <ArrowRight className="w-4 h-4" />
              </span>
            </TrackedCtaLink>

            <TrackedCtaLink
              href="/music/scholarships"
              conversionId="open_music_scholarships"
              surface="music:programs"
              conversionContext={{ placement: "programs_section", variant: "scholarships", audience: "all" }}
              className="border border-emerald-500/30 rounded-xl p-6 bg-gradient-to-br from-emerald-950/20 to-black hover:border-emerald-400/50 transition-all group flex flex-col"
            >
              <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-xl bg-emerald-500/10">
                <Medal className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                Scholarship & Token Roadmap
              </h3>
              <p className="text-zinc-300 mb-4 text-sm flex-grow">
                Follow the education funding roadmap, governance model, and launch phases for scholarship utility and community rewards.
              </p>
              <span className="inline-flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                View Roadmap
                <ArrowRight className="w-4 h-4" />
              </span>
            </TrackedCtaLink>
          </div>
        </section>

        {/* Call to Action */}
        <section className="theme-panel p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase italic mb-4">Ready to Start Your Musical Journey?</h2>
          <p className="text-zinc-300 mb-6 max-w-2xl mx-auto">
            Book your first lesson and experience expert instruction combined with AI-powered practice systems.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <TrackedCtaLink
              href="/music/lessons"
              conversionId="open_music_lessons"
              surface="music:footer_cta"
              conversionContext={{ placement: "footer_cta", variant: "book_lessons", audience: "all" }}
              className="theme-cta theme-cta--loud px-6 py-3"
            >
              Book Your First Lesson
              <ArrowRight className="w-4 h-4" />
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/music/lessons#studio"
              conversionId="open_lesson_studio"
              surface="music:footer_cta"
              conversionContext={{ placement: "footer_cta", variant: "studio", audience: "all" }}
              className="theme-cta theme-cta--secondary px-6 py-3"
            >
              Preview Studio
            </TrackedCtaLink>
          </div>
        </section>
      </main>
    </div>
  );
}

