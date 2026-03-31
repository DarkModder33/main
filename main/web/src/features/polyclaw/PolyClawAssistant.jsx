import React, { useState, useEffect } from 'react';
import { generatePolymarketSignal } from '../../engine/polymarket-strategy.js';

export default function PolyClawAssistant() {
  const [marketData, setMarketData] = useState({
    yesPrice: 0.48,
    noPrice: 0.51,
    volume24h: 125000,
    liquidity: 45000,
  });

  const [llmAnalysis, setLlmAnalysis] = useState({
    sentiment: 'neutral',
  });

  const [signal, setSignal] = useState(null);

  useEffect(() => {
    // Simulated live feed connection via PolyClaw
    const currentSignal = generatePolymarketSignal(marketData, llmAnalysis);
    setSignal(currentSignal);
  }, [marketData, llmAnalysis]);

  return (
    <div className="poly-claw-assistant p-6 bg-slate-900 text-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        PolyClaw AI Assistant (Polymarket Skill)
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-slate-800 rounded border border-slate-700">
          <label className="text-sm text-slate-400">YES Price</label>
          <input
            type="number" step="0.01" value={marketData.yesPrice}
            onChange={e => setMarketData({...marketData, yesPrice: parseFloat(e.target.value)})}
            className="w-full bg-transparent border-b border-blue-500 focus:outline-none py-1"
          />
        </div>
        <div className="p-3 bg-slate-800 rounded border border-slate-700">
          <label className="text-sm text-slate-400">NO Price</label>
          <input
            type="number" step="0.01" value={marketData.noPrice}
            onChange={e => setMarketData({...marketData, noPrice: parseFloat(e.target.value)})}
            className="w-full bg-transparent border-b border-purple-500 focus:outline-none py-1"
          />
        </div>
      </div>

      {signal && (
        <div className={`p-4 rounded-lg border-l-4 ${signal.isArb ? 'bg-green-900/20 border-green-500' : 'bg-slate-800 border-blue-500'}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400">Recommendation</span>
              <h3 className={`text-xl font-black ${signal.isArb ? 'text-green-400' : 'text-blue-300'}`}>
                {signal.action.toUpperCase()}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider text-slate-400">Confidence</span>
              <div className="text-xl font-mono text-white">{signal.confidence}%</div>
            </div>
          </div>

          <div className="space-y-1 mt-4">
            {signal.reasons.map((reason, idx) => (
              <div key={idx} className="text-sm text-slate-300 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2" />
                {reason}
              </div>
            ))}
          </div>

          {signal.isArb && (
            <div className="mt-4 p-2 bg-green-500/20 text-green-400 text-xs rounded animate-pulse">
              Arb Opportunity Detected! Potential: {(signal.arbPotential * 100).toFixed(2)}%
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setLlmAnalysis({ sentiment: 'bullish' })}
          className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors"
        >
          Inject Bullish Sentiment
        </button>
        <button
          onClick={() => setLlmAnalysis({ sentiment: 'bearish' })}
          className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-500 rounded font-medium transition-colors"
        >
          Inject Bearish Sentiment
        </button>
      </div>

      <p className="mt-4 text-[10px] text-slate-500 text-center italic">
        OpenClaw Brain + PolyClaw Execution Skill | tradehaxai.tech Integration 2026
      </p>
    </div>
  );
}

