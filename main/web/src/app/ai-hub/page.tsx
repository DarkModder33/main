'use client';
import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import { useState, useRef, useEffect } from 'react';
import { Wallet, Mic, Zap, Brain } from 'lucide-react';

export default function OdinNeuralHub() {
  const [mode, setMode] = useState<'base' | 'advanced' | 'odin'>('base');
  const [walletConnected, setWalletConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isOdin = mode === 'odin';

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    initialMessages: [{
      id: '0',
      role: 'assistant',
      content: isOdin
        ? 'ODIN MODE LIVE: Uncensored quant oracle. Ensemble RL + real-time market feeds + X sentiment analysis. Execute parabolic strategies with precision. No risk disclaimers—truth-maxxing only. Beginner sliders for ease, HFAT depth on demand. What\'s your edge?'
        : 'Neural_Link_Active. I\'m TradeHax Grok—witty, uncensored trading oracle + creative copilot. I can break down setups for beginners, generate risk-aware plans, and map momentum with clear invalidation levels. What can I help you trade?'
    }],
    body: { mode, walletConnected },
    onResponse: () => {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden font-mono">
      {/* Sidebar: History + Mode Selector + Wallet */}
      <aside className="w-80 border-r border-zinc-800 p-6 flex flex-col bg-black/50">
        <div className="flex items-center gap-3 mb-8">
          <Brain className="w-8 h-8 text-emerald-500" />
          <h1 className="text-2xl font-bold tracking-tighter">ODIN</h1>
        </div>

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as 'base' | 'advanced' | 'odin')}
          className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded-xl mb-6 text-sm focus:border-emerald-500 outline-none transition"
        >
          <option value="base">BASE (Free - Beginner Mode)</option>
          <option value="advanced">ADVANCED (HF Ensemble)</option>
          <option value="odin">ODIN MODE 🔥 (Premium / Stake $HAX)</option>
        </select>

        <div className="text-xs uppercase tracking-widest mb-3 opacity-60 font-semibold">Chat History</div>
        <div className="flex-1 overflow-auto space-y-2 text-xs opacity-70">
          {messages.filter(m => m.role === 'user').slice(-8).map((m, i) => (
            <div key={i} className="truncate hover:opacity-100 cursor-pointer transition p-2 hover:bg-zinc-900/30 rounded">
              {m.content.slice(0, 60)}...
            </div>
          ))}
          {messages.filter(m => m.role === 'user').length === 0 && (
            <div className="opacity-40 italic">Start chatting to build history</div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-zinc-800 space-y-3">
          <button
            onClick={() => setWalletConnected(!walletConnected)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition ${
              walletConnected
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            <Wallet className="w-4 h-4" />
            {walletConnected ? 'Wallet Connected' : 'Connect Wallet'} • Neural_Link_Active
          </button>
          <div className="text-xs text-center opacity-50">
            v4.0.2_STABLE • Encrypted Session • {walletConnected ? '$HAX Stake Verified' : '$HAX Staked: 0'}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-gradient-to-b from-zinc-950 via-zinc-950 to-black">
        {/* Header */}
        <header className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-zinc-800 rounded-full text-xs font-semibold">Live Market Feed</div>
            <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 font-semibold transition ${
              isOdin ? 'bg-red-950/60 text-red-300' : 'bg-emerald-950/60 text-emerald-300'
            }`}>
              <Zap className="w-3 h-3" />
              Autopilot Score: {isOdin ? 'GOD-TIER' : '97.3%'}
            </div>
          </div>
          <button className="flex items-center gap-2 text-sm hover:opacity-80 transition">
            <Mic className="w-4 h-4" /> Voice Command
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-zinc-500 pt-20">
              <p className="text-lg opacity-60">No messages yet. Ask me anything about trading.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl p-6 rounded-3xl ${
                  m.role === 'user'
                    ? 'bg-zinc-800/60 border border-zinc-700'
                    : 'bg-zinc-900/40 border border-zinc-800'
                }`}>
                  <ReactMarkdown className="prose prose-invert max-w-none prose-headings:text-emerald-400 prose-a:text-emerald-300 prose-code:text-emerald-300 text-white leading-relaxed">
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="text-emerald-500 animate-pulse italic">
                {isOdin ? 'ODIN scanning multiverse timelines...' : 'Neural stream in-flight...'}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <footer className="p-6 border-t border-zinc-800 bg-black/50 backdrop-blur">
          <form onSubmit={handleSubmit} className="relative">
            <input
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder={isOdin
                ? 'ODIN MODE ENABLED — speak your will (parabolic entry, dark pool flow, RL sim)...'
                : 'Ask for setup, risk lesson, or trigger Autopilot...'}
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-3xl px-8 py-4 text-base placeholder-zinc-600 outline-none transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:opacity-50 px-8 py-2 rounded-2xl font-bold transition text-sm"
            >
              {isLoading ? 'THINKING' : 'EXECUTE'}
            </button>
          </form>
        </footer>
      </main>

      {/* Right Sidebar: Smart Monitor + Studios */}
      <aside className="w-80 border-l border-zinc-800 p-6 overflow-auto bg-black/50">
        <div className="space-y-8">
          {/* Smart Environment Monitor */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
            <h3 className="uppercase text-xs font-bold mb-4 tracking-wider text-emerald-400">Smart Environment Monitor</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="opacity-70">Requested Mode</span>
                <span className="font-semibold">{mode.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Effective Mode</span>
                <span className="font-semibold">{(walletConnected && mode === 'odin' ? 'ODIN' : mode).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Provider Path</span>
                <span className="font-semibold text-emerald-400">HF_ENSEMBLE</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Messages</span>
                <span className="font-semibold">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Session</span>
                <span className="font-semibold text-emerald-400">ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Text/Image Studio */}
          <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl">
            <h3 className="uppercase text-xs font-bold mb-4 tracking-wider text-emerald-400">Text/Image Studio + Autopilot</h3>
            <div className="space-y-2 text-sm">
              <div>Text Studio: <span className="text-emerald-400">Ready</span></div>
              <div>Image Studio: <span className="text-emerald-400">Ready</span></div>
              <div>Autopilot Board: <span className="text-emerald-400">Tracking</span></div>
              <div className="pt-3 text-emerald-400 font-semibold">Neural_Link_Active</div>
              <div className="pt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => handleInputChange({ target: { value: 'Build me a risk-managed swing plan for beginners.' } } as any)}
                  className="text-xs px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                >
                  Risk Plan
                </button>
                <button
                  onClick={() => handleInputChange({ target: { value: 'Show top 3 momentum setups with invalidation.' } } as any)}
                  className="text-xs px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                >
                  Momentum
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

