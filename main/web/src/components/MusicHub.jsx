import React from 'react';
import { GUITAR_PRICING } from '../lib/pricing';

const MusicHub = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-4xl font-bold mb-8 tracking-tighter text-blue-500">MUSIC_SYSTEMS v2.0</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(GUITAR_PRICING).map(([level, data]) => (
          <div key={level} className="border border-zinc-800 p-6 bg-zinc-900/50 rounded-xl">
            <h2 className="text-xl font-bold uppercase mb-2 text-zinc-300">{data.label}</h2>
            <div className="flex items-baseline mb-4">
              <span className="text-4xl font-black text-green-400">${data.price}</span>
              <span className="text-xs text-zinc-500 ml-1">/HR</span>
            </div>
            <div className="mb-6 p-3 bg-black/40 rounded border border-zinc-800/50">
              <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Session_Block (4h)</p>
              <p className="text-xl font-bold text-white">${data.package}</p>
            </div>
            <ul className="text-xs text-zinc-500 mb-8 space-y-2 uppercase">
              <li>• Neural Pattern Mapping</li>
              <li>• Low-Latency Feedback</li>
              <li>• System Integration</li>
            </ul>
            <button className="w-full bg-blue-600/20 text-blue-400 border border-blue-500/30 py-3 rounded font-bold hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest text-xs">
              INITIALIZE_SESSION
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
        <div>PRICING_MODEL_VER: 2026.03.24</div>
        <div>ENCRYPT_TRANS_LIVE</div>
        <div className="text-blue-900/40">GHOST_CACHE_STATUS: BYPASSED</div>
      </div>
    </div>
  );
};

export default MusicHub;
