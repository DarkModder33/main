"use client";

import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const INTRO_MS = 8000;
const REDUCED_MOTION_MS = 2600;
const STORAGE_KEY = "tradehaxHyperboreaIntroSeen";
const AUDIO_PREF_KEY = "tradehaxHyperboreaIntroSound";

const OFFER_PILLARS = [
  "AI Neural Copilot + Trading Intelligence",
  "Website & App Building for Businesses",
  "Tech Repair + Emergency Service Intake",
  "Guitar Lessons + Artist Growth Systems",
  "Crypto Product Roadmaps + Utility Strategy",
];

export function HyperboreaIntroOverlay() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFinish = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, "true");
    }
    setVisible(false);
  }, []);

  const playBootChime = useCallback(async () => {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    try {
      const existingContext = audioContextRef.current;
      const ctx = existingContext ?? new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      gainNode.connect(ctx.destination);

      const oscA = ctx.createOscillator();
      oscA.type = "sine";
      oscA.frequency.setValueAtTime(220, now);
      oscA.frequency.exponentialRampToValueAtTime(330, now + 0.2);
      oscA.connect(gainNode);
      oscA.start(now);
      oscA.stop(now + 0.45);

      const oscB = ctx.createOscillator();
      oscB.type = "triangle";
      oscB.frequency.setValueAtTime(440, now + 0.05);
      oscB.frequency.exponentialRampToValueAtTime(660, now + 0.35);
      oscB.connect(gainNode);
      oscB.start(now + 0.05);
      oscB.stop(now + 0.45);
    } catch {
      // Ignore autoplay/audio context failures silently.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const hasSeen = window.sessionStorage.getItem(STORAGE_KEY) === "true";
    const savedAudioPref = window.localStorage.getItem(AUDIO_PREF_KEY) === "true";

    setReducedMotion(Boolean(prefersReducedMotion));
    setSoundEnabled(savedAudioPref);

    if (hasSeen) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const startedAt = performance.now();
    const duration = prefersReducedMotion ? REDUCED_MOTION_MS : INTRO_MS;
    let raf = 0;

    if (savedAudioPref && !prefersReducedMotion) {
      void playBootChime();
    }

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const next = Math.min(1, elapsed / duration);
      setProgress(next);
      if (next < 1) {
        raf = window.requestAnimationFrame(tick);
      } else {
        handleFinish();
      }
    };

    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      if (audioContextRef.current?.state !== "closed") {
        void audioContextRef.current?.close();
      }
      audioContextRef.current = null;
    };
  }, [handleFinish, playBootChime]);

  const activePillarIndex = useMemo(() => {
    if (!visible) return 0;
    const segment = 1 / OFFER_PILLARS.length;
    return Math.min(OFFER_PILLARS.length - 1, Math.floor(progress / segment));
  }, [progress, visible]);

  const progressStepClass = useMemo(() => {
    const step = Math.min(10, Math.max(0, Math.round(progress * 10)));
    return `hyperborea-intro-progress-fill--${step}`;
  }, [progress]);

  const handleToggleSound = () => {
    if (typeof window === "undefined") return;

    const next = !soundEnabled;
    setSoundEnabled(next);
    window.localStorage.setItem(AUDIO_PREF_KEY, String(next));

    if (next && visible && !reducedMotion) {
      void playBootChime();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-[10000] overflow-hidden bg-black/95 backdrop-blur-sm ${reducedMotion ? "hyperborea-intro--reduced" : ""}`}>
      <div className="hyperborea-intro-grid absolute inset-0" />
      <div className="hyperborea-intro-vignette absolute inset-0" />
      <div className="hyperborea-intro-particles absolute inset-0" />
      <div className="hyperborea-intro-noise absolute inset-0" />
      <div className="hyperborea-intro-streaks absolute inset-0" />

      <div className="hyperborea-intro-core absolute left-1/2 top-1/2 h-[68vmin] w-[68vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20" />
      <div className="hyperborea-portal-ring hyperborea-portal-ring--outer" />
      <div className="hyperborea-portal-ring hyperborea-portal-ring--inner" />
      <div className="hyperborea-portal-ring hyperborea-portal-ring--shock" />

      <button
        onClick={handleToggleSound}
        className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/85 hover:border-cyan-300 hover:text-cyan-200"
      >
        Sound: {soundEnabled ? "On" : "Off"}
      </button>

      <button
        onClick={handleFinish}
        className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/85 hover:border-cyan-300 hover:text-cyan-200"
      >
        Skip Intro
      </button>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-200">
          <Sparkles className="h-3.5 w-3.5" /> Hyperborea Neural Gate
        </div>

        <h1 className="hyperborea-intro-title mb-3 text-4xl font-black uppercase italic tracking-tight text-white sm:text-6xl">
          TRADEHAX
        </h1>
        <p className="max-w-3xl text-sm text-cyan-100/80 sm:text-base">
          Hyperborea-grade launch system for customers who need AI power, build execution, and elite real-world services in one platform.
        </p>

        <div className="mt-8 w-full max-w-xl rounded-2xl border border-cyan-500/20 bg-black/45 p-4">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">Primary Offer Stack</p>
          <ul className="grid gap-2 text-sm sm:text-base">
            {OFFER_PILLARS.map((pillar, index) => {
              const active = index === activePillarIndex;
              return (
                <li
                  key={pillar}
                  className={`rounded-lg px-3 py-2 transition-all ${
                    active
                      ? "bg-cyan-500/20 text-cyan-100 shadow-[0_0_24px_rgba(6,182,212,0.3)]"
                      : "bg-white/[0.03] text-zinc-300"
                  }`}
                >
                  {pillar}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-8 w-full max-w-xl">
          <div className="h-2 overflow-hidden rounded-full border border-cyan-500/25 bg-black/50">
            <div className={`hyperborea-intro-progress-fill ${progressStepClass}`} />
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-200/70">
            Booting experience… {reducedMotion ? Math.min(3, Math.max(0, Math.ceil(progress * 3))) : Math.min(8, Math.max(0, Math.ceil(progress * 8)))}/{reducedMotion ? 3 : 8}s
          </p>
        </div>
      </div>
    </div>
  );
}
