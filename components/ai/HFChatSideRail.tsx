import type { CommunityPost } from "@/components/ai/hfchat-types";
import { BarChart3, Lock, Mic, Newspaper, Settings2, Trophy, Upload } from "lucide-react";

type HFChatSideRailProps = {
  dynastyMode: boolean;
  onToggleDynastyMode: () => void;
  setInput: (value: string) => void;
  rewardPoints: number;
  privacyShieldEnabled: boolean;
  onTogglePrivacyShield: () => void;
  filteredCommunityFeed: CommunityPost[];
};

export function HFChatSideRail({
  dynastyMode,
  onToggleDynastyMode,
  setInput,
  rewardPoints,
  privacyShieldEnabled,
  onTogglePrivacyShield,
  filteredCommunityFeed,
}: HFChatSideRailProps) {
  return (
    <aside className="hidden lg:flex flex-col border-l border-blue-500/20 bg-gradient-to-b from-blue-950/20 via-black/35 to-rose-950/15 p-3 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
      <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 mb-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-zinc-100 inline-flex items-center gap-1">
            <Newspaper className="w-3.5 h-3.5 text-cyan-300" />
            Social Signal Feed
          </p>
          <span className="rounded-full border border-rose-300/30 bg-rose-500/15 px-2 py-0.5 text-[10px] text-rose-100 font-semibold">
            Unfiltered vibe
          </span>
        </div>
        <p className="mt-1 text-[11px] text-zinc-400">Related X-like posts and community threads for context.</p>
      </div>

      <div className="rounded-lg border border-fuchsia-400/20 bg-fuchsia-500/10 p-3 mb-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-fuchsia-100">Dynasty Mode</p>
          <button
            onClick={onToggleDynastyMode}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              dynastyMode
                ? "border-amber-300/45 bg-amber-500/20 text-amber-100"
                : "border-white/20 bg-white/5 text-zinc-200"
            }`}
            title="Toggle dynasty integrations"
          >
            {dynastyMode ? "ON" : "OFF"}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-fuchsia-100/80">
          Integrates trading, repairs, and music workflow intents from one command surface.
        </p>
        {dynastyMode && (
          <div className="mt-3 space-y-2">
            {[
              {
                icon: <BarChart3 className="w-3.5 h-3.5" />,
                label: "Trading Intelligence",
                desc: "Market signals, position sizing, and quant predictions",
                hint: "Open /intelligence for live market suite",
                color: "border-cyan-400/35 bg-cyan-500/15 text-cyan-100",
                prompt: "Give me the top 3 trading setups right now with entry, stop, and target levels.",
              },
              {
                icon: <Settings2 className="w-3.5 h-3.5" />,
                label: "Repair Services",
                desc: "Book device repair, diagnostics, and tech support",
                hint: "Route to /services for booking",
                color: "border-amber-400/30 bg-amber-500/12 text-amber-100",
                prompt: "I need to book a device repair. What's the fastest way to get scheduled?",
              },
              {
                icon: <Mic className="w-3.5 h-3.5" />,
                label: "Music Lessons",
                desc: "Guitar studio, beginner lessons, and scholarship programs",
                hint: "View /music for all programs",
                color: "border-fuchsia-400/30 bg-fuchsia-500/12 text-fuchsia-100",
                prompt: "Tell me about music lesson options and how to get started with guitar sessions.",
              },
            ].map(({ icon, label, desc, hint, color, prompt }) => (
              <button
                key={label}
                onClick={() => {
                  setInput(prompt);
                }}
                className={`w-full rounded-lg border text-left px-2.5 py-2 transition hover:brightness-110 ${color}`}
                title={hint}
              >
                <p className="text-[11px] font-semibold inline-flex items-center gap-1">{icon}{label}</p>
                <p className="text-[10px] opacity-75 mt-0.5">{desc}</p>
                <p className="text-[10px] opacity-55 mt-0.5 italic">{hint}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-3 mb-3">
        <p className="text-xs font-semibold text-emerald-100 inline-flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" />
          Rewards
        </p>
        <p className="mt-1 text-2xl font-black text-emerald-50">{rewardPoints} XP</p>
        <p className="text-[11px] text-emerald-100/75">Earned from interactions and completed action loops.</p>
      </div>

      <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-3 mb-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-cyan-100 inline-flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Privacy Shield
          </p>
          <button
            onClick={onTogglePrivacyShield}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              privacyShieldEnabled
                ? "border-cyan-300/45 bg-cyan-500/20 text-cyan-100"
                : "border-white/20 bg-white/5 text-zinc-200"
            }`}
          >
            {privacyShieldEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-cyan-100/75">Local session controls, export options, and user-managed history.</p>
      </div>

      <div className="space-y-2">
        {filteredCommunityFeed.map((post) => (
          <article key={post.id} className="rounded-lg border border-white/10 bg-black/25 p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-zinc-100">{post.handle}</p>
              <span className="text-[10px] text-zinc-400">{post.timeAgo}</span>
            </div>
            <p className="text-[10px] uppercase tracking-wide text-cyan-300/80">{post.channel}</p>
            <p className="mt-1 text-xs text-zinc-200/90 leading-relaxed">{post.content}</p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
              <span>#{post.tag}</span>
              <span>{post.likes} likes • {post.replies} replies</span>
            </div>
          </article>
        ))}
      </div>

      <button
        className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-blue-300/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-100 hover:bg-blue-500/20"
        title="Simulated action"
      >
        <Upload className="w-3.5 h-3.5" />
        Load More Threads
      </button>
    </aside>
  );
}
