"use client";

import { HFChatComponent } from "@/components/ai/HFChatComponent";
import { HFGeneratorComponent } from "@/components/ai/HFGeneratorComponent";
import { ImageGeneratorComponent } from "@/components/ai/ImageGeneratorComponent";
import { ModelScoreboardPanel } from "@/components/ai/ModelScoreboardPanel";
import { SmartEnvironmentMonitor } from "@/components/ai/SmartEnvironmentMonitor";
import { Activity, Bot, Image as ImageIcon, SlidersHorizontal, Type } from "lucide-react";
import { Suspense, useMemo, useState } from "react";

type WorkspaceTab = "chat" | "text" | "image" | "autopilot" | "monitor";

interface TabConfig {
  id: WorkspaceTab;
  label: string;
  icon: React.ReactNode;
  hint: string;
}

const tabs: TabConfig[] = [
  {
    id: "chat",
    label: "AI Chat",
    icon: <Bot className="h-4 w-4" />,
    hint: "Primary conversation workspace",
  },
  {
    id: "text",
    label: "Text",
    icon: <Type className="h-4 w-4" />,
    hint: "Generate long-form and short-form copy",
  },
  {
    id: "image",
    label: "Image",
    icon: <ImageIcon className="h-4 w-4" />,
    hint: "Generate visual assets",
  },
  {
    id: "autopilot",
    label: "Autopilot",
    icon: <SlidersHorizontal className="h-4 w-4" />,
    hint: "Model and strategy controls",
  },
  {
    id: "monitor",
    label: "Monitor",
    icon: <Activity className="h-4 w-4" />,
    hint: "Environment and health signals",
  },
];

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-600/10 px-4 py-3 text-xs text-cyan-100/80">
      {label}...
    </div>
  );
}

export function UnifiedAIWorkspace() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("chat");

  const panel = useMemo(() => {
    if (activeTab === "text") {
      return (
        <Suspense fallback={<LoadingPanel label="Loading text tools" />}>
          <HFGeneratorComponent />
        </Suspense>
      );
    }

    if (activeTab === "image") {
      return (
        <Suspense fallback={<LoadingPanel label="Loading image tools" />}>
          <ImageGeneratorComponent />
        </Suspense>
      );
    }

    if (activeTab === "autopilot") {
      return (
        <Suspense fallback={<LoadingPanel label="Loading autopilot" />}>
          <ModelScoreboardPanel />
        </Suspense>
      );
    }

    if (activeTab === "monitor") {
      return (
        <Suspense fallback={<LoadingPanel label="Loading monitor" />}>
          <SmartEnvironmentMonitor />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<LoadingPanel label="Loading AI chat" />}>
        <HFChatComponent />
      </Suspense>
    );
  }, [activeTab]);

  return (
    <section className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              title={tab.hint}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "border-emerald-300/50 bg-emerald-500/20 text-emerald-100"
                  : "border-white/15 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>{panel}</div>
    </section>
  );
}