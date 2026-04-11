"use client";
import { useState } from 'react';

export const NeuralVault = () => {
  const [projectedApy] = useState(12.5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

      {/* Left: AI Performance Stats */}
      <div className="lg:col-span-2 space-y-6">
        <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-[2rem] backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] group-hover:bg-cyan-500/10 transition-colors" />
          <div className="relative z-10">
            <h3 className="text-xs font-mono text-cyan-500 mb-6 tracking-[0.4em] uppercase">Intelligence_Portal</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Access AI-driven market analysis, trading signals, and smart guidance for builders, traders, and operators.
            </p>
          </div>
        </div>

        {/* Neural Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl">
            <p className="text-[10px] text-zinc-500 uppercase font-mono mb-4 italic">Neural_Yield_Index</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white italic">{projectedApy}%</span>
              <span className="text-xs text-green-500 font-mono">APY</span>
            </div>
            <div className="mt-4 h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 animate-pulse" style={{ width: `${projectedApy * 2}%` }} />
            </div>
          </div>
          <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl">
            <p className="text-[10px] text-zinc-500 uppercase font-mono mb-4 italic">Signals_Active</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white italic">Live</span>
              <span className="text-xs text-cyan-500 font-mono">Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Core Visualizer */}
      <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-cyber-grid opacity-20" />
        <div className="relative z-10">
          <div className="w-48 h-48 rounded-full border border-cyan-500/20 flex items-center justify-center relative mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 animate-ping" />
            <div className="absolute inset-4 rounded-full border border-purple-500/20 animate-spin" style={{ animationDuration: '8s' }} />
            <div className="text-5xl">⚡</div>
          </div>
          <h4 className="text-xl font-black text-white italic uppercase mb-2">Intelligence_Core</h4>
          <p className="text-xs text-zinc-500 font-mono mb-8 tracking-widest leading-relaxed">
            AI ANALYSIS:<br />
            <span className="text-cyan-500 font-bold">Active</span>
          </p>
        </div>
      </div>
    </div>
  );
};
