import React from 'react';
import PolyClawAssistant from '../polyclaw/PolyClawAssistant.jsx';
import { BarChart3, TrendingUp, ShieldCheck, Activity } from 'lucide-react';

export default function IntelligencePage() {
  return (
    <div className="intelligence-hub min-h-screen bg-[#09090B] text-white font-mono p-8">
      {/* Header */}
      <header className="mb-10 flex justify-between items-center border-b border-[#27272A] pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
            INTELLIGENCE HUB
          </h1>
          <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">
            Polymarket & Live Feed AI Analysis • tradehaxai.tech
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href="/"
            className="px-6 py-2 border border-[#3F3F46] rounded-full text-xs font-bold hover:bg-[#18181B] transition-all"
          >
            ← NEURAL HUB
          </a>
        </div>
      </header>

      {/* Primary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: PolyClaw Focus */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-[#111114] border border-[#27272A] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <Activity className="text-emerald-500 animate-pulse" size={20} />
            </div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-blue-400" size={24} />
              Polymarket Assistant (PolyClaw)
            </h2>
            <PolyClawAssistant />
          </section>

          <section className="bg-[#111114] border border-[#27272A] rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-purple-400" size={24} />
              AI Copilot Strategy Feed
            </h2>
            <div className="space-y-4">
              {[
                { time: '2 mins ago', msg: 'ARB DETECTED: 2.4% edge on Crypto 5m market [YES+NO < 1.00]', type: 'arb' },
                { time: '14 mins ago', msg: 'Whale 0x55a... COPY: $12k position in Weather Outcome (NY Temp)', type: 'whale' },
                { time: '1 hour ago', msg: 'LLM Sentiment Shift: Highly Bearish on Polygon Gas Prices', type: 'sentiment' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-[#18181B] border border-[#27272A] rounded-xl hover:border-emerald-500/50 transition-colors cursor-pointer group">
                   <div className="text-[10px] text-slate-500 font-bold whitespace-nowrap pt-1 uppercase">{item.time}</div>
                   <div className="text-sm group-hover:text-emerald-300 transition-colors">{item.msg}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Performance & Status */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-[#111114] border border-[#27272A] rounded-2xl p-6">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Master Metrics</h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-[#09090B] rounded-xl border border-[#27272A]">
                 <div className="text-[10px] text-slate-500 mb-1">WIN RATE</div>
                 <div className="text-2xl font-black text-emerald-400">76.4%</div>
               </div>
               <div className="p-4 bg-[#09090B] rounded-xl border border-[#27272A]">
                 <div className="text-[10px] text-slate-500 mb-1">TOTAL P/L</div>
                 <div className="text-2xl font-black text-blue-400">+14.2%</div>
               </div>
             </div>
          </section>

          <section className="bg-[#111114] border border-[#27272A] rounded-2xl p-6">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <BarChart3 size={16} /> 2026 Live Roadmap
             </h3>
             <ul className="text-xs space-y-4">
               <li className="flex gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                 <div><span className="text-white font-bold">PolyClaw 2.0:</span> Integrated CLOB execution with Kelly sizing. (LIVE)</div>
               </li>
               <li className="flex gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                 <div><span className="text-white font-bold">OpenClaw L2:</span> Low-latency sentiment routing. (BETA)</div>
               </li>
               <li className="flex gap-3">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#3F3F46] shrink-0 mt-1" />
                 <div><span className="text-white font-bold">Zk-Proof Trading:</span> Private wallet execution layers. (Q3 2026)</div>
               </li>
             </ul>
          </section>

          <div className="text-center">
            <p className="text-[10px] text-slate-600 italic">
              "institutional-grade AI execution in your pocket"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

