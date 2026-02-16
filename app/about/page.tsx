"use client";
import React from 'react';
import Link from 'next/link';
import { DiscoveryPortal } from '@/components/education/DiscoveryPortal';

export default function AboutPage() {
  const influences = [
    "System of a Down", "Phish", "Jimi Hendrix", "Sublime", 
    "Steely Dan", "Avenged Sevenfold", "Pink Floyd", "Yes"
  ];

  const specialties = [
    { name: "Blues", desc: "Classic bends, soulful phrasing, and authentic vibe" },
    { name: "Rock", desc: "Classic to alternative and hard rock riffs" },
    { name: "R&B / Funk", desc: "Smooth grooves, chord voicings, and pocket playing" },
    { name: "Reggae", desc: "Off-beat rhythms, skanking, and island flavor" },
    { name: "Jazz", desc: "Improvisation, chord-melody, standards, and theory" },
    { name: "Metal", desc: "Shred techniques, sweep picking, and heavy riffing" }
  ];

  return (
    <main className="min-h-screen bg-black py-24 px-6 relative overflow-hidden">
      {/* Background Cyber-Aesthetic */}
      <div className="absolute top-0 left-0 w-full h-full bg-cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <Link href="/" className="text-zinc-500 hover:text-white font-mono mb-12 inline-block transition-colors">
          &lt; RETURN_TO_SYSTEM
        </Link>

        {/* Hero: Identity Block */}
        <header className="mb-24">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-cyan-500" />
            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.5em]">System_Architect_Profile</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none mb-8">
            MICHAEL S.<br/><span className="text-cyan-500">FLAHERTY</span>
          </h1>
          <p className="text-zinc-400 text-xl md:text-2xl max-w-3xl leading-relaxed italic font-light">
            "Great guitar playing isn't about sticking to one box—it's about blending raw emotion, technical precision, and creative exploration."
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Column 1: The Bio */}
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6">01_Background</h2>
              <div className="text-zinc-400 space-y-6 leading-relaxed">
                <p>
                  Welcome to <span className="text-white font-bold italic">TradeHax Music</span> – where passion for the guitar meets personalized, results-driven instruction.
                </p>
                <p>
                  I'm Michael S. Flaherty, a lifelong guitarist with over 25 years of playing, performing, and teaching experience. My musical foundation was shaped by some of the most innovative and genre-defying artists in history.
                </p>
                <div className="flex flex-wrap gap-2 pt-4">
                  {influences.map((inf, i) => (
                    <span key={i} className="px-3 py-1 bg-zinc-900 border border-white/5 text-zinc-500 text-[10px] font-mono rounded-full hover:border-cyan-500/50 hover:text-white transition-all">
                      {inf}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6">02_Specializations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specialties.map((spec, i) => (
                  <div key={i} className="p-6 bg-zinc-900/30 border border-white/5 rounded-2xl hover:bg-zinc-800/50 transition-all group">
                    <h4 className="text-cyan-500 font-bold mb-1 group-hover:text-white transition-colors uppercase italic">{spec.name}</h4>
                    <p className="text-zinc-500 text-xs leading-relaxed">{spec.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Column 2: Discovery Portal */}
          <div className="lg:col-span-5">
            <DiscoveryPortal />
            
            <div className="p-8 bg-zinc-950 border border-white/5 rounded-[2.5rem] mt-8">
              <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 italic">Neural_Philosophy</h4>
              <p className="text-zinc-400 text-sm leading-relaxed italic">
                "At TradeHax, music instruction is part of a bigger picture: helping people build skills, express themselves, and level up in whatever they pursue."
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
