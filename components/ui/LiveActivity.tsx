"use client";
import { useState, useEffect } from 'react';

const activities = [
  "SYSTEM_ALERT: AI Neural Hub v2 online.",
  "USER_ACTION: New leaderboard entry submitted.",
  "HYPERBOREA: New High Score (12,400) by Player_99.",
  "AI_EVENT: Content generation pipeline active.",
  "SYSTEM_LOG: Platform services heartbeat nominal.",
  "REWARD_DIST: Top 10 players recognized this week.",
];

export const LiveActivity = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % activities.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-zinc-950 border-t border-white/5 py-4 px-6 overflow-hidden">
      <div className="container mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2 min-w-max">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Live_Activity</span>
        </div>
        <div className="h-4 w-px bg-zinc-800" />
        <p className="text-[10px] font-mono text-cyan-500/80 truncate italic">
          {activities[index]}
        </p>
      </div>
    </div>
  );
};
