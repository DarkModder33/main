import Link from 'next/link';
import { GlitchText } from '@/components/ui/GlitchText';

const services = [
  { label: "Web Development", value: "Custom Sites & Apps" },
  { label: "Device Repair", value: "Fast Turnaround" },
  { label: "Music Lessons", value: "All Skill Levels" },
  { label: "AI Consulting", value: "Tailored Solutions" },
];

const serviceAreas = [
  { group: "Web & App Development", percentage: 35, color: "bg-cyan-500" },
  { group: "AI & Automation Consulting", percentage: 25, color: "bg-purple-500" },
  { group: "Device Repair Services", percentage: 20, color: "bg-blue-500" },
  { group: "Music Lessons & Education", percentage: 15, color: "bg-emerald-500" },
  { group: "Creative & Design", percentage: 5, color: "bg-zinc-500" },
];

export default function ServicesOverviewPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-14 sm:px-6 sm:py-20 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-10 pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <Link href="/" className="text-xs sm:text-sm text-zinc-500 hover:text-white font-mono mb-10 sm:mb-12 inline-block transition-colors">
          &lt; RETURN_TO_SYSTEM
        </Link>

        {/* Header Section */}
        <header className="mb-14 sm:mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-7xl leading-tight font-black text-white tracking-tighter mb-5 sm:mb-6 uppercase italic break-words">
            <GlitchText text="SERVICES" />
          </h1>
          <p className="text-zinc-400 text-base sm:text-xl max-w-3xl leading-relaxed">
            TradeHax AI delivers professional digital services across web development, device repair, music education, and AI consulting for local and remote clients.
          </p>
        </header>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-14 sm:mb-20">
          {services.map((stat, i) => (
            <div key={i} className="p-6 bg-zinc-900/50 border border-white/5 rounded-xl neon-border-hover transition-all group">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-cyan-500 transition-colors">{stat.label}</p>
              <p className="text-xl font-mono text-white italic">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Service Area Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 mb-20 sm:mb-32 items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 sm:mb-8 tracking-tight italic uppercase">Service_Distribution</h2>
            <div className="space-y-6">
              {serviceAreas.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-300 font-medium italic">{item.group}</span>
                    <span className="text-white font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-10 glass-panel rounded-3xl sm:rounded-[2.5rem] border border-cyan-500/10">
            <h2 className="text-2xl font-black text-white mb-6 italic uppercase tracking-tighter text-cyan-500">Service_Model</h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 italic">
              TradeHax AI operates on a transparent service model. Clients pay for time, expertise, and results — no token gating, no hidden requirements. All pricing is listed upfront with clear deliverables.
            </p>
            <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex justify-between items-center">
               <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Client_First_Model</span>
               <span className="text-xl font-black text-white italic">Open</span>
            </div>
          </div>
        </div>

        {/* Core Services Section */}
        <div className="mb-20 sm:mb-32">
          <h2 className="text-2xl sm:text-3xl font-black mb-8 sm:mb-12 tracking-tight text-center italic uppercase">CORE_SERVICES</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 sm:p-10 bg-zinc-900/30 border border-white/5 rounded-3xl hover:border-cyan-500/50 transition-colors">
              <h3 className="text-xl font-bold mb-4 text-white uppercase italic">Web & App Dev</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Custom websites, web apps, and digital systems built for performance, conversion, and growth. From landing pages to full-stack applications.</p>
            </div>
            <div className="p-6 sm:p-10 bg-zinc-900/30 border border-white/5 rounded-3xl hover:border-purple-500/50 transition-colors">
              <h3 className="text-xl font-bold mb-4 text-white uppercase italic">Music Lessons</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Guitar and music instruction for all skill levels. One-on-one sessions, artist growth tools, and scholarship opportunities for dedicated students.</p>
            </div>
            <div className="p-6 sm:p-10 bg-zinc-900/30 border border-white/5 rounded-3xl hover:border-blue-500/50 transition-colors">
              <h3 className="text-xl font-bold mb-4 text-white uppercase italic">Device Repair</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Fast, reliable repair for phones, computers, and other devices. Serving Greater Philadelphia with emergency intake and competitive pricing.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
