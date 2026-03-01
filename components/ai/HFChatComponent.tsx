"use client";

import {
    Archive,
    ArrowUp,
    BarChart3,
    Bot,
    ChevronDown,
    Compass,
    Copy,
    FileJson,
    FileText,
    Flame,
    HelpCircle,
    Keyboard,
    Loader2,
    Lock,
    Mic,
    Newspaper,
    PanelLeft,
    Paperclip,
    Pencil,
    Pin,
    Plus,
    Search,
    Settings2,
    Smile,
    Sparkles,
    Trash2,
    Trophy,
    Unlock,
    Upload,
    UserRound,
    X
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
  meta?: {
    step: number;
    mode: ChatMode;
    timestamp: number;
    predictionDomain?: "stock" | "crypto" | "kalshi" | "general";
    predictionConfidence?: number;
  };
}

type ChatMode = "navigator" | "custom" | "chat";

type PipelineMemory = {
  objective: string;
  selectedStep: number;
  mode: ChatMode;
  responseStyle: ResponseStyle;
  autoFallback: boolean;
  freedomMode: FreedomMode;
  llmPreset: LlmPresetId;
};

type ResponseStyle = "concise" | "coach" | "operator";
type FreedomMode = "uncensored" | "standard";
type AssistantProfileId = "beginner" | "trader" | "creator" | "developer";
type LlmPresetId =
  | "navigator_fast"
  | "operator_exec"
  | "analyst_risk"
  | "creative_growth"
  | "deep_research"
  | "fallback_safe";
type PromptCategory = "onboarding" | "trading" | "content" | "ops";

type PinnedPrompt = {
  id: string;
  label: string;
  prompt: string;
  category: PromptCategory;
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  archived: boolean;
  messages: Message[];
  objective: string;
  selectedStep: number;
  mode: ChatMode;
  responseStyle: ResponseStyle;
  autoFallback: boolean;
  freedomMode: FreedomMode;
  llmPreset: LlmPresetId;
};

type NavTab = "chat" | "quant" | "settings" | "help";

type CommunityPost = {
  id: string;
  handle: string;
  channel: "Market Pulse" | "Community Thread" | "Strategy Board";
  content: string;
  timeAgo: string;
  likes: number;
  replies: number;
  tag: "crypto" | "stocks" | "macro" | "ops";
};

const PIPELINE_MEMORY_KEY = "tradehax-ai-pipeline-memory-v1";
const CHAT_SESSIONS_KEY = "tradehax-ai-chat-sessions-v1";
const PINNED_PROMPTS_KEY = "tradehax-ai-pinned-prompts-v1";
const OPEN_MODE_NOTICE_KEY = "tradehax-ai-open-mode-notice-v1";
const ASSISTANT_PROFILE_KEY = "tradehax-ai-assistant-profile-v1";
const FIRST_RUN_NUDGE_KEY = "tradehax-ai-first-run-nudge-v1";

const MODE_META: Record<
  ChatMode,
  {
    label: string;
    description: string;
    endpoint: string;
  }
> = {
  navigator: {
    label: "Navigator",
    description: "Find where to go on TradeHax with clear next steps.",
    endpoint: "/api/ai/navigator",
  },
  custom: {
    label: "TradeHax Expert",
    description: "Use the site-tuned assistant for platform and workflow guidance.",
    endpoint: "/api/ai/custom",
  },
  chat: {
    label: "General Chat",
    description: "Open chat with retrieval + command fallback.",
    endpoint: "/api/ai/chat",
  },
};

const LLM_PRESET_META: Record<
  LlmPresetId,
  {
    label: string;
    description: string;
  }
> = {
  navigator_fast: {
    label: "Quick Thinker",
    description: "Best for fast route guidance and practical next clicks.",
  },
  operator_exec: {
    label: "Execution Coach",
    description: "Best for step-by-step checklists and workflow execution.",
  },
  analyst_risk: {
    label: "Risk Analyst",
    description: "Best for conservative analysis with explicit risk controls.",
  },
  creative_growth: {
    label: "Growth Writer",
    description: "Best for content ideas, hooks, and campaign expansion.",
  },
  deep_research: {
    label: "Deep Researcher",
    description: "Best for long-form analysis, tradeoffs, and comparisons.",
  },
  fallback_safe: {
    label: "Safe Backup",
    description: "Stable fallback lane when external providers are degraded.",
  },
};

const LLM_PRESET_IDS: LlmPresetId[] = [
  "navigator_fast",
  "operator_exec",
  "analyst_risk",
  "creative_growth",
  "deep_research",
  "fallback_safe",
];

const ASSISTANT_PROFILE_META: Record<
  AssistantProfileId,
  {
    label: string;
    description: string;
    mode: ChatMode;
    responseStyle: ResponseStyle;
    preset: LlmPresetId;
    selectedStep: number;
    freedomMode: FreedomMode;
    objective: string;
    prompt: string;
  }
> = {
  beginner: {
    label: "Beginner",
    description: "Simple, guided setup and clear next actions.",
    mode: "navigator",
    responseStyle: "coach",
    preset: "navigator_fast",
    selectedStep: 0,
    freedomMode: "standard",
    objective: "Get a beginner-safe crypto + stocks plan with clear next steps",
    prompt: "I am new. Give me a simple 10-minute setup checklist and the first page I should open.",
  },
  trader: {
    label: "Trader",
    description: "Risk-aware planning and execution support.",
    mode: "custom",
    responseStyle: "operator",
    preset: "analyst_risk",
    selectedStep: 1,
    freedomMode: "standard",
    objective: "Build a risk-aware crypto + stocks execution plan",
    prompt: "Build a risk-aware trading plan with position sizing, invalidation, and exact next steps.",
  },
  creator: {
    label: "Creator",
    description: "Content and campaign outputs from one objective.",
    mode: "chat",
    responseStyle: "coach",
    preset: "creative_growth",
    selectedStep: 2,
    freedomMode: "standard",
    objective: "Create a weekly content engine for crypto and stocks",
    prompt: "Create a one-week content plan with 3 hooks, post drafts, and CTA variants for crypto + stocks.",
  },
  developer: {
    label: "Developer",
    description: "Deep analysis, integrations, and implementation flow.",
    mode: "chat",
    responseStyle: "operator",
    preset: "deep_research",
    selectedStep: 2,
    freedomMode: "uncensored",
    objective: "Implement an API/integration workflow with clear build steps",
    prompt: "Design an implementation plan for integrating TradeHax AI endpoints with retries, fallbacks, and monitoring.",
  },
};

function isLlmPresetId(value: unknown): value is LlmPresetId {
  return typeof value === "string" && LLM_PRESET_IDS.includes(value as LlmPresetId);
}

const PIPELINE_STEPS = [
  {
    title: "Define goal",
    lane: "onboarding",
    starterPrompt: "I am new. What should I do first on TradeHax based on my goals?",
  },
  {
    title: "Get route plan",
    lane: "navigation",
    starterPrompt: "Give me the exact pages to visit in order and why.",
  },
  {
    title: "Execute task",
    lane: "execution",
    starterPrompt: "Walk me step-by-step through this task and what to click next.",
  },
  {
    title: "Next action",
    lane: "conversion",
    starterPrompt: "What is the smartest next action for me now?",
  },
] as const;

const QUICK_START_PROMPTS = [
  {
    label: "New user setup",
    prompt: "I am brand new. Give me a simple 10-minute setup checklist and where to click first.",
  },
  {
    label: "First trade plan",
    prompt: "Build me a beginner-friendly trade plan with risk limits and exact next steps.",
  },
  {
    label: "Portfolio check",
    prompt: "Review my portfolio process and give me a safer weekly routine I can follow.",
  },
  {
    label: "Pricing help",
    prompt: "Explain the lowest-cost plan for me and when I should upgrade.",
  },
] as const;

const COMPOSER_QUICK_ACTIONS: Array<{
  label: string;
  prompt: string;
  mode?: ChatMode;
  preset?: LlmPresetId;
}> = [
  {
    label: "7-day plan",
    prompt: "Build me a 7-day execution plan with one high-impact task per day, estimated effort, and measurable outcome.",
    mode: "chat",
    preset: "operator_exec",
  },
  {
    label: "Risk check",
    prompt: "Audit my current strategy for downside risk. Give invalidation points, risk limits, and one safer alternative.",
    mode: "chat",
    preset: "analyst_risk",
  },
  {
    label: "Growth content",
    prompt: "Create 3 high-conviction content ideas with hooks, CTA, and platform-specific formatting.",
    mode: "chat",
    preset: "creative_growth",
  },
  {
    label: "Deep brief",
    prompt: "Give me a deep comparative brief: assumptions, tradeoffs, key risks, and recommended decision path.",
    mode: "chat",
    preset: "deep_research",
  },
];

const PREDICTIVE_QUERY_SNIPPETS = [
  "Forecast SOL trend for next 24h with bullish and bearish scenarios.",
  "Build a risk-managed BTC scalp checklist with invalidation rules.",
  "Compare portfolio drawdown risk if market drops 8% this week.",
  "Generate a concise macro watchlist with priority signals.",
  "Simulate a 3-asset rebalance using low-volatility allocation.",
  "Create entry, stop-loss, and take-profit ranges for ETH swing setup.",
  "Summarize social sentiment impact on top 5 Solana ecosystem tokens.",
  "Create a daily trading journal template with risk scoring.",
];

const COMMUNITY_FEED: CommunityPost[] = [
  {
    id: "feed-1",
    handle: "@quant_helix",
    channel: "Market Pulse",
    content: "SOL volume breakout forming. Watching 4H structure + funding divergence before entries.",
    timeAgo: "2m",
    likes: 41,
    replies: 9,
    tag: "crypto",
  },
  {
    id: "feed-2",
    handle: "@freemarket_alpha",
    channel: "Community Thread",
    content: "Debating whether today's CPI print is noise or regime shift. Post your risk map.",
    timeAgo: "8m",
    likes: 63,
    replies: 22,
    tag: "macro",
  },
  {
    id: "feed-3",
    handle: "@ops_dynasty",
    channel: "Strategy Board",
    content: "Shared a no-fluff execution stack: objective → setup score → trigger → post-trade review.",
    timeAgo: "14m",
    likes: 28,
    replies: 7,
    tag: "ops",
  },
  {
    id: "feed-4",
    handle: "@equity_signal_lab",
    channel: "Market Pulse",
    content: "Small-cap momentum improving; keeping strict position sizing after fakeout cluster.",
    timeAgo: "21m",
    likes: 19,
    replies: 4,
    tag: "stocks",
  },
];

function resolveSlashShortcut(input: string) {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) {
    return trimmed;
  }

  const [command, ...rest] = trimmed.split(" ");
  const tail = rest.join(" ").trim();

  if (command === "/plan") {
    return `Create a step-by-step execution plan with milestones, owners, and due windows.${tail ? ` Context: ${tail}` : ""}`;
  }
  if (command === "/risk") {
    return `Run a risk analysis with probability, impact, mitigation, and invalidation criteria.${tail ? ` Context: ${tail}` : ""}`;
  }
  if (command === "/content") {
    return `Generate content assets: headline, hook, body draft, CTA, and 3 variants.${tail ? ` Context: ${tail}` : ""}`;
  }
  if (command === "/next") {
    return `Given current context, tell me the single highest-leverage next action and why.`;
  }

  return trimmed;
}

type DecisionSignals = {
  confidence: number;
  risk: number;
  priority: "High" | "Medium" | "Low";
  nextAction: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function buildSessionTitle(messages: Message[], fallback = "New session") {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content?.trim();
  if (!firstUserMessage) return fallback;
  return firstUserMessage.length > 48
    ? `${firstUserMessage.slice(0, 48).trim()}…`
    : firstUserMessage;
}

function createEmptySession(overrides?: Partial<ChatSession>): ChatSession {
  const now = Date.now();
  const generateSessionId = (timestamp: number): string => {
    // Prefer built-in crypto.randomUUID when available
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `session-${timestamp}-${crypto.randomUUID()}`;
    }

    // Fallback: use crypto.getRandomValues to generate a random hex string
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(8);
      crypto.getRandomValues(bytes);
      const randomHex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return `session-${timestamp}-${randomHex}`;
    }

    // Last-resort fallback (should rarely be hit, kept to avoid runtime errors)
    const fallbackRand = Math.random().toString(36).slice(2, 10);
    return `session-${timestamp}-${fallbackRand}`;
  };

  return {
    id: generateSessionId(now),
    title: "New session",
    updatedAt: now,
    archived: false,
    messages: [],
    objective: "",
    selectedStep: 0,
    mode: "navigator",
    responseStyle: "coach",
    autoFallback: true,
    freedomMode: "uncensored",
    llmPreset: "navigator_fast",
    ...overrides,
  };
}

function sanitizePinnedPrompt(raw: unknown): PinnedPrompt | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Partial<PinnedPrompt>;
  if (typeof item.id !== "string" || typeof item.label !== "string" || typeof item.prompt !== "string") {
    return null;
  }
  const category = item.category;
  if (category !== "onboarding" && category !== "trading" && category !== "content" && category !== "ops") {
    return null;
  }

  return {
    id: item.id,
    label: item.label.trim().slice(0, 40),
    prompt: item.prompt.trim().slice(0, 220),
    category,
  };
}

function scoreAssistantResponse(content: string, step: number, mode: ChatMode): DecisionSignals {
  const text = content.toLowerCase();
  const actionableMatches = (text.match(/\b(step|next|then|open|visit|click|start|do this|checklist)\b/g) || []).length;
  const uncertaintyMatches = (text.match(/\b(maybe|might|could|possibly|depends|uncertain|not sure)\b/g) || []).length;
  const riskMatches = (text.match(/\b(leverage|margin|all-in|borrow|high risk|volatile|liquidation)\b/g) || []).length;
  const safetyMatches = (text.match(/\b(risk|stop[- ]?loss|limit|safe|discipline|position size|conservative)\b/g) || []).length;
  const routeMatches = (text.match(/\/(ai|ai-hub|pricing|schedule|services|dashboard|trading)/g) || []).length;

  let confidence = 58 + actionableMatches * 6 + routeMatches * 5 + safetyMatches * 3 - uncertaintyMatches * 8;
  if (mode === "navigator") confidence += 5;
  if (step >= 2) confidence += 4;

  let risk = 34 + riskMatches * 9 + uncertaintyMatches * 5 - safetyMatches * 4;
  if (mode === "custom") risk -= 3;
  if (routeMatches > 0) risk -= 2;

  confidence = clamp(confidence, 25, 98);
  risk = clamp(risk, 5, 95);

  let priority: DecisionSignals["priority"] = "Medium";
  if (step >= 2 || routeMatches > 0 || actionableMatches >= 4) {
    priority = "High";
  }
  if (uncertaintyMatches >= 3 && actionableMatches <= 1) {
    priority = "Low";
  }

  let nextAction = "Confirm your objective, then ask for one concrete next click.";
  if (step === 0) nextAction = "Lock your objective in one sentence and request a 3-step start plan.";
  if (step === 1) nextAction = "Ask for exact page order and complete the first page now.";
  if (step === 2) nextAction = "Execute the top action now, then return with result feedback.";
  if (step >= 3) nextAction = "Choose one CTA (pricing, schedule, or service) and complete it.";

  return {
    confidence,
    risk,
    priority,
    nextAction,
  };
}

export function HFChatComponent() {
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [showArchivedSessions, setShowArchivedSessions] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");
  const [isRenamingSession, setIsRenamingSession] = useState(false);
  const [sessionDraftName, setSessionDraftName] = useState("");
  const [pinnedPrompts, setPinnedPrompts] = useState<PinnedPrompt[]>([]);
  const [pinLabel, setPinLabel] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinCategory, setPinCategory] = useState<PromptCategory>("onboarding");
  const [storageWarning, setStorageWarning] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<ChatMode>("navigator");
  const [selectedStep, setSelectedStep] = useState(0);
  const [objective, setObjective] = useState("");
  const [autoAdvanceMessage, setAutoAdvanceMessage] = useState("");
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>("coach");
  const [llmPreset, setLlmPreset] = useState<LlmPresetId>("navigator_fast");
  const [autoFallback, setAutoFallback] = useState(true);
  const [freedomMode, setFreedomMode] = useState<FreedomMode>("uncensored");
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [activeProfile, setActiveProfile] = useState<AssistantProfileId>("beginner");
  const [showFirstRunNudge, setShowFirstRunNudge] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [showOpenModeNotice, setShowOpenModeNotice] = useState(false);
  const [responseLoadProgress, setResponseLoadProgress] = useState(0);
  const [responseLoadSeconds, setResponseLoadSeconds] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("chat");
  const [showMobileTabs, setShowMobileTabs] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceSupport, setVoiceSupport] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(true);
  const [dynastyMode, setDynastyMode] = useState(false);
  const [privacyShieldEnabled, setPrivacyShieldEnabled] = useState(true);
  const [rewardPoints, setRewardPoints] = useState(120);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceRecognitionRef = useRef<{
    start: () => void;
    stop: () => void;
    onresult: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
  } | null>(null);

  const navTabs: Array<{ id: NavTab; label: string; icon: React.ReactNode; hint: string }> = [
    {
      id: "chat",
      label: "Chat",
      icon: <Sparkles className="w-3.5 h-3.5" />,
      hint: "General AI workflow",
    },
    {
      id: "quant",
      label: "Predictive Quant Assistant",
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      hint: "Market scenarios and tables",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings2 className="w-3.5 h-3.5" />,
      hint: "Profiles, lanes, and controls",
    },
    {
      id: "help",
      label: "Help",
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      hint: "Beginner tour and guidance",
    },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setShowControlPanel(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const speechAvailable = Boolean(
      (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as Window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
    );
    setVoiceSupport(speechAvailable);
  }, []);

  const applySession = useCallback((session: ChatSession) => {
    setMessages(session.messages);
    setObjective(session.objective);
    setSelectedStep(session.selectedStep);
    setMode(session.mode);
    setResponseStyle(session.responseStyle);
    setLlmPreset(session.llmPreset);
    setAutoFallback(session.autoFallback);
    setFreedomMode(session.freedomMode);
    setAutoAdvanceMessage("");
    setError("");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUserId = window.localStorage.getItem("tradehax_user_id") || "";
    if (storedUserId.trim().length > 0) {
      setUserId(storedUserId.trim());
    }

    try {
      const rawSessions = window.localStorage.getItem(CHAT_SESSIONS_KEY);
      if (rawSessions) {
        const parsedSessions = JSON.parse(rawSessions) as ChatSession[];
        if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
          const sortedSessions = [...parsedSessions]
            .filter((session) => typeof session?.id === "string" && session.id.length > 0)
            .sort((a, b) => b.updatedAt - a.updatedAt);

          if (sortedSessions.length > 0) {
            setSessions(sortedSessions);
            setActiveSessionId(sortedSessions[0].id);
            applySession(sortedSessions[0]);
          }
        }
      }
    } catch {
      setStorageWarning("Session history could not be loaded. Starting with a clean workspace.");
    }

    try {
      const rawPinned = window.localStorage.getItem(PINNED_PROMPTS_KEY);
      if (rawPinned) {
        const parsedPinned = JSON.parse(rawPinned) as unknown[];
        if (Array.isArray(parsedPinned)) {
          // Backward compatibility with previous string-only format
          const normalized = parsedPinned
            .map((item, index) => {
              if (typeof item === "string" && item.trim().length > 0) {
                return {
                  id: `legacy-${index}-${item.slice(0, 8)}`,
                  label: item.trim().slice(0, 40),
                  prompt: item.trim().slice(0, 220),
                  category: "onboarding" as PromptCategory,
                };
              }
              return sanitizePinnedPrompt(item);
            })
            .filter((item): item is PinnedPrompt => Boolean(item));

          if (normalized.length > 0) {
            setPinnedPrompts(normalized.slice(0, 24));
          }
        }
      }
    } catch {
      setStorageWarning((prev) => prev || "Pinned prompts could not be loaded from local storage.");
    }

    try {
      const rawMemory = window.localStorage.getItem(PIPELINE_MEMORY_KEY);
      if (!rawMemory) return;

      const parsed = JSON.parse(rawMemory) as Partial<PipelineMemory>;
      if (typeof parsed.objective === "string") {
        setObjective(parsed.objective.slice(0, 200));
      }
      if (typeof parsed.selectedStep === "number") {
        setSelectedStep(Math.min(PIPELINE_STEPS.length - 1, Math.max(0, Math.floor(parsed.selectedStep))));
      }
      if (parsed.mode === "navigator" || parsed.mode === "custom" || parsed.mode === "chat") {
        setMode(parsed.mode);
      }
      if (parsed.responseStyle === "concise" || parsed.responseStyle === "coach" || parsed.responseStyle === "operator") {
        setResponseStyle(parsed.responseStyle);
      }
      if (typeof parsed.autoFallback === "boolean") {
        setAutoFallback(parsed.autoFallback);
      }
      if (parsed.freedomMode === "uncensored" || parsed.freedomMode === "standard") {
        setFreedomMode(parsed.freedomMode);
      }
      if (isLlmPresetId(parsed.llmPreset)) {
        setLlmPreset(parsed.llmPreset);
      }
    } catch {
      // Ignore malformed memory payloads
    }

    try {
      const savedProfile = window.localStorage.getItem(ASSISTANT_PROFILE_KEY);
      if (
        savedProfile === "beginner" ||
        savedProfile === "trader" ||
        savedProfile === "creator" ||
        savedProfile === "developer"
      ) {
        setActiveProfile(savedProfile);
      }
    } catch {
      // ignore malformed profile state
    }

    try {
      const firstRunSeen = window.localStorage.getItem(FIRST_RUN_NUDGE_KEY) === "1";
      setShowFirstRunNudge(!firstRunSeen);
    } catch {
      setShowFirstRunNudge(true);
    }

  }, [applySession]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ASSISTANT_PROFILE_KEY, activeProfile);
    } catch {
      // ignore profile persistence failure
    }
  }, [activeProfile]);

  useEffect(() => {
    if (!loading) {
      setResponseLoadProgress(0);
      setResponseLoadSeconds(0);
      return;
    }

    const start = Date.now();
    const timer = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - start) / 1000);
      setResponseLoadSeconds(elapsedSeconds);
      setResponseLoadProgress((prev) => {
        const next = prev + 9;
        return next >= 92 ? 92 : next;
      });
    }, 350);

    return () => {
      window.clearInterval(timer);
    };
  }, [loading]);

  useEffect(() => {
    if (freedomMode !== "uncensored") {
      setShowOpenModeNotice(false);
      return;
    }
    if (typeof window === "undefined") {
      setShowOpenModeNotice(true);
      return;
    }
    try {
      const acknowledged = window.localStorage.getItem(OPEN_MODE_NOTICE_KEY) === "1";
      setShowOpenModeNotice(!acknowledged);
    } catch {
      setShowOpenModeNotice(true);
    }
  }, [freedomMode]);

  useEffect(() => {
    if (sessions.length > 0 || activeSessionId) return;

    const initialSession = createEmptySession({
      mode,
      responseStyle,
      autoFallback,
      freedomMode,
      llmPreset,
      selectedStep,
      objective,
      messages,
      title: buildSessionTitle(messages),
    });

    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
  }, [sessions.length, activeSessionId, mode, responseStyle, autoFallback, freedomMode, llmPreset, selectedStep, objective, messages]);

  useEffect(() => {
    const starter = searchParams.get("starter");
    const profileParam = searchParams.get("profile");

    const applyProfile = (profileId: AssistantProfileId, seedInput = true) => {
      const profile = ASSISTANT_PROFILE_META[profileId];
      setActiveProfile(profileId);
      setMode(profile.mode);
      setResponseStyle(profile.responseStyle);
      setLlmPreset(profile.preset);
      setSelectedStep(profile.selectedStep);
      setFreedomMode(profile.freedomMode);
      setObjective(profile.objective);
      if (seedInput) {
        setInput(profile.prompt);
      }
      setShowAdvancedControls(profileId === "developer");
      setShowFirstRunNudge(false);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(FIRST_RUN_NUDGE_KEY, "1");
        } catch {
          // no-op
        }
      }
    };

    if (
      profileParam === "beginner" ||
      profileParam === "trader" ||
      profileParam === "creator" ||
      profileParam === "developer"
    ) {
      applyProfile(profileParam, true);
      return;
    }

    if (!starter) return;

    if (starter === "new-user-setup") {
      applyProfile("beginner", true);
      return;
    }

    if (starter === "first-trade-plan") {
      applyProfile("trader", true);
      return;
    }

    if (starter === "content-engine") {
      applyProfile("creator", true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const memory: PipelineMemory = {
      objective: objective.trim().slice(0, 200),
      selectedStep,
      mode,
      responseStyle,
      autoFallback,
      freedomMode,
      llmPreset,
    };

    try {
      window.localStorage.setItem(PIPELINE_MEMORY_KEY, JSON.stringify(memory));
    } catch {
      setStorageWarning((prev) => prev || "Pipeline memory could not be saved locally.");
    }
  }, [objective, selectedStep, mode, responseStyle, autoFallback, freedomMode, llmPreset]);

  useEffect(() => {
    if (!activeSessionId) return;

    setSessions((prev) =>
      prev
        .map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                title: buildSessionTitle(messages, session.title),
                updatedAt: Date.now(),
                messages,
                objective: objective.trim().slice(0, 200),
                selectedStep,
                mode,
                responseStyle,
                autoFallback,
                freedomMode,
                llmPreset,
              }
            : session,
        )
        .sort((a, b) => b.updatedAt - a.updatedAt),
    );
  }, [activeSessionId, messages, objective, selectedStep, mode, responseStyle, autoFallback, freedomMode, llmPreset]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessions.length === 0) return;

    try {
      window.localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    } catch {
      setStorageWarning((prev) => prev || "Session history could not be saved due to local storage limits.");
    }
  }, [sessions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PINNED_PROMPTS_KEY, JSON.stringify(pinnedPrompts));
    } catch {
      setStorageWarning((prev) => prev || "Pinned prompts could not be saved.");
    }
  }, [pinnedPrompts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const trimmedInput = resolveSlashShortcut(input.trim());
    if (!trimmedInput) return;

    const objectiveForRequest = (objective.trim() || trimmedInput).slice(0, 200);
    if (!objective.trim()) {
      setObjective(objectiveForRequest);
    }

    setAutoAdvanceMessage("");

    const userMessage: Message = {
      role: "user",
      content: trimmedInput,
      id: `msg-${Date.now()}`,
      meta: {
        step: selectedStep,
        mode,
        timestamp: Date.now(),
      },
    };

    setMessages((prev) => [...prev, userMessage]);
    setRewardPoints((prev) => prev + 2);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const endpoint = MODE_META[mode].endpoint;
      const routeContext = typeof window !== "undefined" ? window.location.pathname : "/ai";

      const payload =
        mode === "chat"
          ? {
              message: trimmedInput,
              tier: freedomMode === "uncensored" ? "UNCENSORED" : "STANDARD",
              messages: messages.map((m) => ({ role: m.role, content: m.content })).concat([
                { role: "user", content: trimmedInput },
              ]),
              context: {
                pipelineStep: PIPELINE_STEPS[selectedStep]?.title,
                objective: objectiveForRequest,
                responseStyle,
              },
              preset: llmPreset,
              userId,
            }
          : mode === "custom"
            ? {
                message: trimmedInput,
                lane: PIPELINE_STEPS[selectedStep]?.lane,
                context: {
                  pipelineStep: PIPELINE_STEPS[selectedStep]?.title,
                  path: routeContext,
                  objective: objectiveForRequest,
                  responseStyle,
                },
                preset: llmPreset,
                userId,
              }
            : {
                message: trimmedInput,
                currentPath: routeContext,
                sessionId: `session-${Date.now()}`,
                objective: objectiveForRequest,
                responseStyle,
                preset: llmPreset,
                userId,
              };

      const callEndpoint = async (targetEndpoint: string, targetPayload: unknown) => {
        const response = await fetch(targetEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(targetPayload),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (data?.error === "INSUFFICIENT_CREDITS") {
            const balance =
              typeof data?.credits?.balance === "number" ? Math.max(0, Math.floor(data.credits.balance)) : null;
            const suffix = balance !== null ? ` Current balance: ${balance} credits.` : "";
            throw new Error(`Insufficient AI credits.${suffix} Top up from the Billing page.`);
          }
          throw new Error(data?.error || data?.message || `API error: ${response.statusText}`);
        }
        return data;
      };

      let data: any;
      try {
        data = await callEndpoint(endpoint, payload);
      } catch (primaryError) {
        if (!autoFallback || mode === "chat") {
          throw primaryError;
        }

        data = await callEndpoint("/api/ai/chat", {
          message: trimmedInput,
          tier: freedomMode === "uncensored" ? "UNCENSORED" : "STANDARD",
          messages: messages.map((m) => ({ role: m.role, content: m.content })).concat([
            { role: "user", content: trimmedInput },
          ]),
          context: {
            pipelineStep: PIPELINE_STEPS[selectedStep]?.title,
            objective: objectiveForRequest,
            responseStyle,
            fallbackFromMode: mode,
          },
          preset: llmPreset,
          userId,
        });
      }

      if (!data.ok) {
        throw new Error(data.error || "Generation failed");
      }

      const coreResponse =
        typeof data?.message?.content === "string"
          ? data.message.content
          : typeof data?.response === "string"
            ? data.response
            : "No response received.";

      const suggestionText =
        Array.isArray(data?.suggestions) && data.suggestions.length > 0
          ? `\n\nSuggested routes:\n${data.suggestions
              .slice(0, 3)
              .map(
                (item: { title?: string; path?: string }) =>
                  `• ${item?.title || "Recommended"} ${item?.path ? `(${item.path})` : ""}`,
              )
              .join("\n")}`
          : "";

      const assistantMessage: Message = {
        role: "assistant",
        content: `${coreResponse}${suggestionText}`,
        id: `msg-${Date.now()}-ai`,
        meta: {
          step: selectedStep,
          mode,
          timestamp: Date.now(),
          predictionDomain:
            data?.prediction?.domain === "stock" ||
            data?.prediction?.domain === "crypto" ||
            data?.prediction?.domain === "kalshi" ||
            data?.prediction?.domain === "general"
              ? data.prediction.domain
              : "general",
          predictionConfidence:
            typeof data?.prediction?.confidence === "number"
              ? Math.max(0, Math.min(100, Math.round(data.prediction.confidence)))
              : undefined,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setRewardPoints((prev) => prev + 6);

      if (isLlmPresetId(data?.preset?.id) && data.preset.id !== llmPreset) {
        setLlmPreset(data.preset.id);
      }

      if (selectedStep < PIPELINE_STEPS.length - 1) {
        const nextStep = selectedStep + 1;
        setSelectedStep(nextStep);
        setAutoAdvanceMessage(`Advanced to Step ${nextStep + 1}: ${PIPELINE_STEPS[nextStep].title}`);
      } else {
        setAutoAdvanceMessage("Pipeline complete. You can refine objective or continue in current stage.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
    } finally {
      setLoading(false);
    }
  }, [input, messages, mode, objective, selectedStep, responseStyle, autoFallback, freedomMode, llmPreset, userId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
    setAutoAdvanceMessage("");
  };

  const applyComposerQuickAction = (action: (typeof COMPOSER_QUICK_ACTIONS)[number]) => {
    setInput(action.prompt);
    if (action.mode) {
      setMode(action.mode);
    }
    if (action.preset) {
      setLlmPreset(action.preset);
    }
    if (!objective.trim()) {
      setObjective(action.label);
    }
  };

  const appendEmoji = (emoji: string) => {
    setInput((prev) => `${prev}${emoji}`);
    setShowEmojiPicker(false);
  };

  const handleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const speechCtor = (
      window as Window & {
        SpeechRecognition?: new () => {
          start: () => void;
          stop: () => void;
          onresult: ((event: any) => void) | null;
          onerror: ((event: any) => void) | null;
          onend: (() => void) | null;
          continuous: boolean;
          interimResults: boolean;
          lang: string;
        };
        webkitSpeechRecognition?: new () => {
          start: () => void;
          stop: () => void;
          onresult: ((event: any) => void) | null;
          onerror: ((event: any) => void) | null;
          onend: (() => void) | null;
          continuous: boolean;
          interimResults: boolean;
          lang: string;
        };
      }
    ).SpeechRecognition ||
      (
        window as Window & {
          SpeechRecognition?: new () => {
            start: () => void;
            stop: () => void;
            onresult: ((event: any) => void) | null;
            onerror: ((event: any) => void) | null;
            onend: (() => void) | null;
            continuous: boolean;
            interimResults: boolean;
            lang: string;
          };
          webkitSpeechRecognition?: new () => {
            start: () => void;
            stop: () => void;
            onresult: ((event: any) => void) | null;
            onerror: ((event: any) => void) | null;
            onend: (() => void) | null;
            continuous: boolean;
            interimResults: boolean;
            lang: string;
          };
        }
      ).webkitSpeechRecognition;

    if (!speechCtor) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    if (isVoiceRecording && voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop();
      setIsVoiceRecording(false);
      return;
    }

    try {
      const recognition = new speechCtor();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript;
        if (typeof transcript === "string" && transcript.trim()) {
          setInput((prev) => `${prev}${prev.trim().length > 0 ? " " : ""}${transcript.trim()}`);
        }
      };
      recognition.onerror = () => {
        setError("Voice capture failed. Please try again.");
      };
      recognition.onend = () => {
        setIsVoiceRecording(false);
      };
      voiceRecognitionRef.current = recognition;
      setIsVoiceRecording(true);
      recognition.start();
    } catch {
      setIsVoiceRecording(false);
      setError("Could not start voice capture.");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2_000_000) {
      setError("File is too large. Keep uploads under 2MB for quick analysis.");
      event.target.value = "";
      return;
    }

    try {
      const content = await file.text();
      const compact = content.replace(/\s+/g, " ").trim().slice(0, 900);
      const enrichedPrompt = `Analyze uploaded file \"${file.name}\" and extract trading-relevant insights.\n\nExcerpt:\n${compact}`;
      setInput(enrichedPrompt);
    } catch {
      setError("Unable to read this file. Try a text, CSV, or JSON file.");
    } finally {
      event.target.value = "";
    }
  };

  const createSession = () => {
    const newSession = createEmptySession({
      mode,
      responseStyle,
      autoFallback,
      freedomMode,
      llmPreset,
    });
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    applySession(newSession);
  };

  const archiveActiveSession = () => {
    if (!activeSessionId) return;

    const archivedSession = sessions.find((session) => session.id === activeSessionId);
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? { ...session, archived: true, updatedAt: Date.now() }
          : session,
      ),
    );

    const fallbackSession = sessions.find((session) => session.id !== activeSessionId && !session.archived);
    if (fallbackSession) {
      setActiveSessionId(fallbackSession.id);
      applySession(fallbackSession);
      return;
    }

    const freshSession = createEmptySession({
      mode,
      responseStyle,
      autoFallback,
      freedomMode,
      llmPreset,
    });
    setSessions((prev) => [freshSession, ...prev]);
    setActiveSessionId(freshSession.id);
    applySession(freshSession);
    if (archivedSession) {
      setStorageWarning(`Archived session: ${archivedSession.title}`);
    }
  };

  const deleteActiveSession = () => {
    if (!activeSessionId) return;
    const remaining = sessions.filter((session) => session.id !== activeSessionId);
    setSessions(remaining);

    const fallback = remaining.find((session) => !session.archived) ?? remaining[0];
    if (fallback) {
      setActiveSessionId(fallback.id);
      applySession(fallback);
    } else {
      const fresh = createEmptySession({
        mode,
        responseStyle,
        autoFallback,
        freedomMode,
        llmPreset,
      });
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      applySession(fresh);
    }
  };

  const toggleArchivedSession = (sessionId: string) => {
    const target = sessions.find((session) => session.id === sessionId);
    if (!target) return;

    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, archived: !session.archived, updatedAt: Date.now() }
          : session,
      ),
    );
  };

  const switchSession = (sessionId: string) => {
    const targetSession = sessions.find((session) => session.id === sessionId);
    if (!targetSession) return;
    setActiveSessionId(targetSession.id);
    setIsRenamingSession(false);
    setSessionDraftName("");
    applySession(targetSession);
  };

  const startRenameSession = () => {
    const activeSession = sessions.find((session) => session.id === activeSessionId);
    if (!activeSession) return;
    setSessionDraftName(activeSession.title);
    setIsRenamingSession(true);
  };

  const saveRenameSession = () => {
    const trimmed = sessionDraftName.trim().slice(0, 60);
    if (!trimmed) {
      setIsRenamingSession(false);
      setSessionDraftName("");
      return;
    }

    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? {
              ...session,
              title: trimmed,
              updatedAt: Date.now(),
            }
          : session,
      ),
    );

    setIsRenamingSession(false);
    setSessionDraftName("");
  };

  const addPinnedPrompt = () => {
    const trimmed = pinInput.trim().replace(/\s+/g, " ");
    const trimmedLabel = (pinLabel.trim() || trimmed).replace(/\s+/g, " ").slice(0, 40);
    if (!trimmed) return;
    if (trimmed.length > 220) {
      setStorageWarning("Pinned prompt is too long. Keep it under 220 characters.");
      return;
    }

    setPinnedPrompts((prev) => {
      if (prev.some((item) => item.prompt.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      const entry: PinnedPrompt = {
        id: `pin-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: trimmedLabel,
        prompt: trimmed,
        category: pinCategory,
      };
      return [entry, ...prev].slice(0, 24);
    });

    setStorageWarning("");
    setPinLabel("");
    setPinInput("");
  };

  const removePinnedPrompt = (promptId: string) => {
    setPinnedPrompts((prev) => prev.filter((item) => item.id !== promptId));
  };

  const exportActiveSession = (format: "json" | "md") => {
    const active = sessions.find((session) => session.id === activeSessionId);
    if (!active || typeof window === "undefined") return;

    try {
      const timestamp = new Date(active.updatedAt).toISOString().replace(/[:.]/g, "-");
      const filenameBase = `tradehax-session-${active.id}-${timestamp}`;

      const payload =
        format === "json"
          ? JSON.stringify(active, null, 2)
          : [
              `# ${active.title}`,
              "",
              `- Updated: ${new Date(active.updatedAt).toLocaleString()}`,
              `- Mode: ${active.mode}`,
              `- Objective: ${active.objective || "(none)"}`,
              "",
              ...active.messages.map((message) => `## ${message.role === "assistant" ? "Assistant" : "User"}\n\n${message.content}\n`),
            ].join("\n");

      const blob = new Blob([payload], { type: format === "json" ? "application/json" : "text/markdown" });
      const url = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `${filenameBase}.${format === "json" ? "json" : "md"}`;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setStorageWarning("Export failed. Please try again.");
    }
  };

  const promptQualityScore = (() => {
    const text = input.trim();
    if (!text) return 0;
    let score = 28;
    if (text.length >= 45) score += 18;
    if (text.length >= 120) score += 12;
    if (/\b(goal|objective|risk|timeline|step|budget|constraint)\b/i.test(text)) score += 22;
    if (/\?|\bhow\b|\bwhat\b|\bwhy\b/i.test(text)) score += 12;
    if (objective.trim().length > 0) score += 10;
    return clamp(score, 0, 100);
  })();

  const lastAssistantMessage = [...messages].reverse().find((msg) => msg.role === "assistant");
  const nextActionSignals = lastAssistantMessage
    ? scoreAssistantResponse(lastAssistantMessage.content, selectedStep, mode)
    : null;

  const dismissOpenModeNotice = () => {
    setShowOpenModeNotice(false);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(OPEN_MODE_NOTICE_KEY, "1");
    } catch {
      // ignore storage failures
    }
  };

  const copyLastAssistant = async () => {
    if (!lastAssistantMessage?.content || typeof window === "undefined") return;
    try {
      await window.navigator.clipboard.writeText(lastAssistantMessage.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // no-op fallback
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (session.archived !== showArchivedSessions) return false;
    if (!sessionSearch.trim()) return true;
    const query = sessionSearch.trim().toLowerCase();
    return (
      session.title.toLowerCase().includes(query) ||
      session.messages.some((message) => message.content.toLowerCase().includes(query))
    );
  });

  const filteredPinnedPrompts = pinnedPrompts.filter((item) => item.category === pinCategory);
  const filteredCommunityFeed = COMMUNITY_FEED.filter((item) => {
    if (activeTab === "quant") {
      return item.tag === "crypto" || item.tag === "stocks" || item.tag === "macro";
    }
    return true;
  });

  const predictiveSuggestions = (() => {
    const query = input.trim().toLowerCase();
    if (query.length < 3) return PREDICTIVE_QUERY_SNIPPETS.slice(0, 4);
    const matching = PREDICTIVE_QUERY_SNIPPETS.filter((item) => item.toLowerCase().includes(query));
    return matching.length > 0 ? matching.slice(0, 4) : PREDICTIVE_QUERY_SNIPPETS.slice(0, 4);
  })();

  const gridTemplateClass = showControlPanel ? "lg:grid-cols-[320px_1fr_320px]" : "lg:grid-cols-[1fr_320px]";

  return (
    <div className="theme-panel w-full h-[78dvh] sm:h-[82dvh] min-h-[560px] sm:min-h-[640px] [@media(max-height:820px)]:min-h-[520px] [@media(max-height:700px)]:min-h-[460px] max-h-[980px] overflow-hidden rounded-2xl border border-blue-400/30 bg-gradient-to-b from-[#05070f]/90 via-black/85 to-[#08101a]/90 shadow-[0_25px_80px_rgba(0,0,0,0.65),0_0_60px_rgba(6,182,212,0.06)]">
      <div className={`grid h-full ${gridTemplateClass}`}>
        {showControlPanel && (
          <aside className="border-b lg:border-b-0 lg:border-r border-blue-500/20 bg-[#050a14]/60 p-4 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
            <div className="mb-3 rounded border border-white/10 bg-white/[0.03] px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] uppercase tracking-wide text-emerald-200/80">Sessions</p>
                <button
                  onClick={createSession}
                  className="rounded border border-emerald-500/30 bg-emerald-600/10 px-2 py-1 text-[11px] text-emerald-100 hover:border-emerald-300/50"
                  title="Create session"
                >
                  <Plus className="w-3 h-3 inline mr-1" />New
                </button>
              </div>
              <div className="mb-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3 h-3 absolute left-2 top-1.5 text-emerald-200/60" />
                  <input
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                    placeholder="Search sessions"
                    className="w-full rounded border border-white/15 bg-black/30 py-1 pl-6 pr-2 text-[11px] text-emerald-100 outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowArchivedSessions((prev) => !prev)}
                  className="rounded border border-white/15 bg-black/25 px-2 py-1 text-[11px] text-emerald-100/80"
                >
                  {showArchivedSessions ? "Active" : "Archived"}
                </button>
              </div>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {filteredSessions.map((session) => {
                  const active = session.id === activeSessionId;
                  return (
                    <div
                      key={session.id}
                      className={`rounded px-2 py-1.5 text-[11px] border transition ${
                        active
                          ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100"
                          : "border-white/10 bg-black/25 text-emerald-100/80"
                      }`}
                    >
                      <button
                        onClick={() => switchSession(session.id)}
                        className="w-full text-left"
                      >
                        <div className="font-semibold truncate">{session.title}</div>
                        <div className="opacity-70">{new Date(session.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </button>
                      <div className="mt-1 flex gap-1">
                        <button
                          onClick={() => toggleArchivedSession(session.id)}
                          className="rounded border border-white/15 px-1.5 py-0.5 text-[10px]"
                          title={session.archived ? "Restore session" : "Archive session"}
                        >
                          <Archive className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center gap-1">
                <button
                  onClick={() => exportActiveSession("json")}
                  className="rounded border border-white/15 bg-black/20 px-2 py-1 text-[11px] text-emerald-100/85"
                  title="Export active session as JSON"
                >
                  <FileJson className="w-3 h-3 inline mr-1" />JSON
                </button>
                <button
                  onClick={() => exportActiveSession("md")}
                  className="rounded border border-white/15 bg-black/20 px-2 py-1 text-[11px] text-emerald-100/85"
                  title="Export active session as Markdown"
                >
                  <FileText className="w-3 h-3 inline mr-1" />MD
                </button>
                <button
                  onClick={archiveActiveSession}
                  className="rounded border border-white/15 bg-black/20 px-2 py-1 text-[11px] text-emerald-100/85"
                  title="Archive active session"
                >
                  <Archive className="w-3 h-3 inline mr-1" />Archive
                </button>
                <button
                  onClick={deleteActiveSession}
                  className="rounded border border-rose-400/25 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-100"
                  title="Delete active session"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" />Delete
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {isRenamingSession ? (
                  <>
                    <input
                      value={sessionDraftName}
                      onChange={(e) => setSessionDraftName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRenameSession();
                        if (e.key === "Escape") {
                          setIsRenamingSession(false);
                          setSessionDraftName("");
                        }
                      }}
                      className="flex-1 rounded border border-cyan-500/30 bg-black/40 px-2 py-1 text-[11px] text-cyan-100 outline-none"
                      placeholder="Rename session"
                    />
                    <button
                      onClick={saveRenameSession}
                      className="rounded border border-cyan-400/40 bg-cyan-500/15 px-2 py-1 text-[11px] text-cyan-100"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startRenameSession}
                    disabled={!activeSessionId}
                    className="rounded border border-white/15 bg-black/20 px-2 py-1 text-[11px] text-emerald-100/85 disabled:opacity-50"
                  >
                    <Pencil className="w-3 h-3 inline mr-1" />Rename active
                  </button>
                )}
              </div>
            </div>

            <div className="mb-3 rounded border border-cyan-500/20 bg-cyan-600/10 px-3 py-2 text-xs text-cyan-100/90">
              <p className="font-semibold">Start here if you&apos;re new</p>
              <p className="mt-1 text-cyan-100/75">Pick a quick prompt, send it, then follow the 4-step flow.</p>
            </div>

            <div className="mb-3 rounded border border-emerald-500/20 bg-emerald-600/10 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-emerald-200/80">Assistant profile</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(Object.keys(ASSISTANT_PROFILE_META) as AssistantProfileId[]).map((profileId) => {
                  const active = activeProfile === profileId;
                  const profile = ASSISTANT_PROFILE_META[profileId];
                  return (
                    <button
                      key={profileId}
                      onClick={() => {
                        setActiveProfile(profileId);
                        setMode(profile.mode);
                        setResponseStyle(profile.responseStyle);
                        setLlmPreset(profile.preset);
                        setSelectedStep(profile.selectedStep);
                        setFreedomMode(profile.freedomMode);
                        setObjective(profile.objective);
                        setInput(profile.prompt);
                        setShowAdvancedControls(profileId === "developer");
                        setShowFirstRunNudge(false);
                        if (typeof window !== "undefined") {
                          try {
                            window.localStorage.setItem(FIRST_RUN_NUDGE_KEY, "1");
                          } catch {
                            // no-op
                          }
                        }
                      }}
                      title={profile.description}
                      className={`rounded border px-2 py-2 text-left text-[11px] transition ${
                        active
                          ? "border-emerald-300/50 bg-emerald-500/20 text-emerald-50"
                          : "border-emerald-500/20 bg-black/30 text-emerald-100/85 hover:border-emerald-300/40"
                      }`}
                    >
                      <p className="font-semibold">{profile.label}</p>
                      <p className="mt-0.5 opacity-80 line-clamp-2">{profile.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-[11px] uppercase tracking-wide text-emerald-200/70 mb-1">
                Objective memory
              </label>
              <input
                value={objective}
                onChange={(e) => setObjective(e.target.value.slice(0, 200))}
                placeholder="e.g. Build a safe first trade plan"
                className="w-full rounded border border-emerald-500/30 bg-black/40 px-3 py-2 text-sm text-emerald-100 placeholder-emerald-200/40 outline-none"
              />
            </div>

            <div className="mb-3 space-y-2">
              {(Object.keys(MODE_META) as ChatMode[]).map((modeKey) => {
                const active = mode === modeKey;
                return (
                  <button
                    key={modeKey}
                    onClick={() => setMode(modeKey)}
                    className={`w-full text-left rounded border px-3 py-2 transition ${
                      active
                        ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100"
                        : "border-emerald-500/20 bg-black/30 text-emerald-200/70 hover:border-emerald-400/40"
                    }`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide">{MODE_META[modeKey].label}</div>
                    <div className="text-[11px] mt-1 opacity-80 leading-relaxed">{MODE_META[modeKey].description}</div>
                  </button>
                );
              })}
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2">
              {PIPELINE_STEPS.map((step, index) => {
                const active = selectedStep === index;
                return (
                  <button
                    key={step.title}
                    onClick={() => {
                      setSelectedStep(index);
                      setInput(step.starterPrompt);
                      setAutoAdvanceMessage("");
                    }}
                    className={`rounded border px-2 py-2 text-xs transition ${
                      active
                        ? "border-emerald-300/50 bg-emerald-500/20 text-emerald-100"
                        : "border-emerald-500/20 bg-black/30 text-emerald-200/70 hover:border-emerald-400/40"
                    }`}
                  >
                    <div className="font-semibold">{index + 1}. {step.title}</div>
                  </button>
                );
              })}
            </div>

            <div className="mb-3">
              <label className="block text-[11px] uppercase tracking-wide text-emerald-200/70 mb-1">
                Quick prompts
              </label>
              <div className="space-y-2">
                {QUICK_START_PROMPTS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setInput(item.prompt);
                      if (!objective.trim()) {
                        setObjective(item.label);
                      }
                    }}
                    className="w-full rounded border border-emerald-500/20 bg-black/30 px-2 py-2 text-left text-[11px] text-emerald-100/85 hover:border-emerald-400/40"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <details
              className="rounded border border-white/10 bg-white/[0.03] p-2"
              open={showAdvancedControls}
              onToggle={(e) => setShowAdvancedControls((e.currentTarget as HTMLDetailsElement).open)}
            >
              <summary className="cursor-pointer list-none text-[11px] uppercase tracking-wide text-emerald-200/80">
                Customize assistant (advanced)
              </summary>

              <div className="mt-2 mb-3 rounded border border-fuchsia-500/20 bg-fuchsia-600/10 p-2">
                <label className="block text-[11px] uppercase tracking-wide text-fuchsia-100/80 mb-1">
                  Pinned prompts
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    value={pinLabel}
                    onChange={(e) => setPinLabel(e.target.value)}
                    placeholder="Label (optional)"
                    className="rounded border border-fuchsia-500/30 bg-black/35 px-2 py-1 text-[11px] text-fuchsia-100 outline-none"
                  />
                  <select
                    title="Pinned prompt category"
                    aria-label="Pinned prompt category"
                    value={pinCategory}
                    onChange={(e) => setPinCategory(e.target.value as PromptCategory)}
                    className="rounded border border-fuchsia-500/30 bg-black/35 px-2 py-1 text-[11px] text-fuchsia-100 outline-none"
                  >
                    <option value="onboarding">Onboarding</option>
                    <option value="trading">Trading</option>
                    <option value="content">Content</option>
                    <option value="ops">Ops</option>
                  </select>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addPinnedPrompt();
                      }
                    }}
                    placeholder="Add reusable prompt"
                    className="flex-1 rounded border border-fuchsia-500/30 bg-black/35 px-2 py-1 text-[11px] text-fuchsia-100 outline-none"
                  />
                  <button
                    onClick={addPinnedPrompt}
                    title="Pin prompt"
                    aria-label="Pin prompt"
                    className="rounded border border-fuchsia-400/40 bg-fuchsia-500/20 px-2 py-1 text-[11px] text-fuchsia-100"
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {filteredPinnedPrompts.length === 0 && (
                    <p className="text-[11px] text-fuchsia-100/60">No pinned prompts yet.</p>
                  )}
                  {filteredPinnedPrompts.map((prompt) => (
                    <div key={prompt.id} className="flex items-start gap-1 rounded border border-fuchsia-500/20 bg-black/25 px-2 py-1">
                      <button
                        onClick={() => setInput(prompt.prompt)}
                        className="flex-1 text-left text-[11px] text-fuchsia-100/90 hover:text-fuchsia-50"
                      >
                        <span className="font-semibold">{prompt.label}</span>
                        <span className="block opacity-80">{prompt.prompt}</span>
                      </button>
                      <button
                        onClick={() => removePinnedPrompt(prompt.id)}
                        className="text-fuchsia-100/70 hover:text-fuchsia-50"
                        title="Remove pinned prompt"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="rounded border border-cyan-500/20 bg-cyan-600/10 p-2">
                  <label htmlFor="llm-preset" className="block text-[11px] font-semibold text-cyan-100/90 mb-1">
                    Assistant preset
                  </label>
                  <select
                    id="llm-preset"
                    value={llmPreset}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isLlmPresetId(value)) {
                        setLlmPreset(value);
                      }
                    }}
                    className="w-full rounded border border-cyan-500/30 bg-black/40 px-2 py-1 text-xs text-cyan-100 outline-none"
                  >
                    {LLM_PRESET_IDS.map((presetId) => (
                      <option key={presetId} value={presetId}>
                        {LLM_PRESET_META[presetId].label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-cyan-100/70">{LLM_PRESET_META[llmPreset].description}</p>
                </div>

                <div className="rounded border border-emerald-500/20 bg-black/30 p-2">
                  <label htmlFor="response-style" className="block text-[11px] font-semibold text-emerald-100/80 mb-1">
                    Response style
                  </label>
                  <select
                    id="response-style"
                    value={responseStyle}
                    onChange={(e) => setResponseStyle((e.target.value as ResponseStyle) || "coach")}
                    className="w-full rounded border border-emerald-500/30 bg-black/40 px-2 py-1 text-xs text-emerald-100 outline-none"
                  >
                    <option value="concise">Concise</option>
                    <option value="coach">Coach</option>
                    <option value="operator">Operator</option>
                  </select>
                </div>

                <label className="rounded border border-emerald-500/20 bg-black/30 p-2 flex items-center gap-2 text-xs text-emerald-100/85">
                  <input
                    type="checkbox"
                    checked={autoFallback}
                    onChange={(e) => setAutoFallback(e.target.checked)}
                    className="accent-emerald-400"
                  />
                  Auto-fallback to General Chat
                </label>

                <div className="rounded border border-fuchsia-500/20 bg-fuchsia-600/10 p-2">
                  <label htmlFor="freedom-mode" className="block text-[11px] font-semibold text-fuchsia-100/90 mb-1">
                    Freedom mode
                  </label>
                  <select
                    id="freedom-mode"
                    value={freedomMode}
                    onChange={(e) => setFreedomMode((e.target.value as FreedomMode) || "uncensored")}
                    className="w-full rounded border border-fuchsia-500/30 bg-black/40 px-2 py-1 text-xs text-fuchsia-100 outline-none"
                  >
                    <option value="uncensored">Uncensored</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>
              </div>
            </details>
          </aside>
        )}

        <section className="flex flex-col min-h-0">
          <div className="flex items-center justify-between border-b border-blue-500/20 px-4 py-3 bg-[#050a14]/70 backdrop-blur-sm">
            <div>
              <h3 className="font-bold text-white tracking-tight">AI Assistant Console</h3>
              <p className="text-xs text-blue-200/70">
                {sessions.find((session) => session.id === activeSessionId)?.title || "Session"} • Mode: {MODE_META[mode].label} • Preset: {LLM_PRESET_META[llmPreset].label} • Step {selectedStep + 1}/4
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowControlPanel((prev) => !prev)}
                className="theme-cta theme-cta--muted theme-cta--compact px-2 py-2"
                title="Toggle controls"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
              <button
                onClick={copyLastAssistant}
                disabled={!lastAssistantMessage}
                className="theme-cta theme-cta--muted theme-cta--compact px-2 py-2 disabled:opacity-50"
                title="Copy last assistant response"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={clearChat}
                className="theme-cta theme-cta--muted theme-cta--compact px-2 py-2"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="border-b border-blue-500/20 px-4 py-2 bg-gradient-to-r from-blue-950/30 via-black/30 to-rose-950/30">
            <div className="flex items-center justify-between gap-2">
              <div className="hidden sm:flex flex-wrap items-center gap-2">
                {navTabs.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      title={tab.hint}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                        active
                          ? "border-cyan-300/50 bg-cyan-500/20 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.2)]"
                          : "border-white/15 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08]"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowMobileTabs((prev) => !prev)}
                className="sm:hidden inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold text-zinc-100"
              >
                Tabs
                <ChevronDown className={`w-3 h-3 transition ${showMobileTabs ? "rotate-180" : ""}`} />
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-300/50 bg-fuchsia-500/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-fuchsia-100 shadow-[0_0_10px_rgba(217,70,239,0.25)]">
                  <Unlock className="w-3 h-3" />
                  No Filters
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/35 bg-amber-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
                  <Flame className="w-3 h-3" />
                  Dynasty Mode
                </span>
              </div>
            </div>

            {showMobileTabs && (
              <div className="sm:hidden mt-2 flex flex-wrap gap-2">
                {navTabs.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowMobileTabs(false);
                      }}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        active
                          ? "border-cyan-300/50 bg-cyan-500/20 text-cyan-100"
                          : "border-white/15 bg-white/[0.03] text-zinc-200"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-b border-emerald-500/20 px-4 py-2 text-[11px] text-emerald-200/75 flex flex-wrap gap-2 bg-black/20">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1"><Sparkles className="w-3 h-3" />Prompt quality: {promptQualityScore}%</span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">Style: {responseStyle}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">Preset: {LLM_PRESET_META[llmPreset].label}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">{freedomMode === "uncensored" ? "Uncensored lane" : "Standard lane"}</span>
            <button
              onClick={() => setFreedomMode((prev) => (prev === "uncensored" ? "standard" : "uncensored"))}
              className="rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-2 py-1 text-fuchsia-100 hover:border-fuchsia-200/50"
              title="Toggle assistant lane"
            >
              Switch lane
            </button>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1"><Keyboard className="w-3 h-3" />Enter send • Shift+Enter newline</span>
            {copied && <span className="text-cyan-200 rounded-full border border-cyan-300/25 bg-cyan-500/10 px-2 py-1">Copied last response.</span>}
            {storageWarning && <span className="text-amber-200 rounded-full border border-amber-300/25 bg-amber-500/10 px-2 py-1">{storageWarning}</span>}
          </div>

          {showGuidedTour && (
            <div className="mx-4 mt-2 rounded border border-blue-400/30 bg-blue-600/10 px-3 py-2 text-[11px] text-blue-100 flex items-center justify-between gap-3">
              <p>
                <strong>Quick tour:</strong> 1) Pick a tab, 2) choose a profile/step, 3) use predictive suggestions, 4) send and iterate.
              </p>
              <button
                onClick={() => setShowGuidedTour(false)}
                className="rounded border border-blue-300/40 bg-black/25 px-2 py-1 text-[10px] uppercase tracking-wide"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeTab === "quant" && (
            <div className="mx-4 mt-2 rounded-lg border border-cyan-400/25 bg-cyan-600/10 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-cyan-100 uppercase tracking-wide">Quant snapshot</p>
                <span className="text-[11px] text-cyan-100/75">Scenario table</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-cyan-100/90">
                  <thead>
                    <tr className="text-cyan-200/80">
                      <th className="pb-1 pr-3">Asset</th>
                      <th className="pb-1 pr-3">Bias</th>
                      <th className="pb-1 pr-3">Confidence</th>
                      <th className="pb-1">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-cyan-500/15">
                      <td className="py-1 pr-3">SOL</td>
                      <td className="py-1 pr-3">Bullish continuation</td>
                      <td className="py-1 pr-3">72%</td>
                      <td className="py-1">Medium</td>
                    </tr>
                    <tr className="border-t border-cyan-500/15">
                      <td className="py-1 pr-3">BTC</td>
                      <td className="py-1 pr-3">Range-bound</td>
                      <td className="py-1 pr-3">61%</td>
                      <td className="py-1">Low</td>
                    </tr>
                    <tr className="border-t border-cyan-500/15">
                      <td className="py-1 pr-3">ETH</td>
                      <td className="py-1 pr-3">Volatility expansion</td>
                      <td className="py-1 pr-3">57%</td>
                      <td className="py-1">High</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {showOpenModeNotice && (
            <div className="mx-4 mt-2 rounded border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100 flex items-center justify-between gap-3">
              <p>
                Open lane is active. Responses are less filtered — verify facts and risk-sensitive details before action.
              </p>
              <button
                onClick={dismissOpenModeNotice}
                className="rounded border border-amber-200/40 bg-amber-500/10 px-2 py-1 text-[10px] uppercase tracking-wide"
              >
                Got it
              </button>
            </div>
          )}

          {activeTab === "settings" ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain [scrollbar-width:thin]">
              <div className="mb-1">
                <h4 className="text-sm font-bold text-white mb-0.5">Settings</h4>
                <p className="text-[11px] text-blue-200/60">Customize your AI session, profile, and behavior controls.</p>
              </div>
              <div className="rounded-lg border border-blue-500/25 bg-blue-600/10 p-3">
                <p className="text-xs font-semibold text-blue-100 mb-2 uppercase tracking-wide">Assistant Profile</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(ASSISTANT_PROFILE_META) as AssistantProfileId[]).map((pid) => {
                    const p = ASSISTANT_PROFILE_META[pid];
                    const isActive = activeProfile === pid;
                    return (
                      <button
                        key={pid}
                        onClick={() => {
                          setActiveProfile(pid);
                          setMode(p.mode);
                          setResponseStyle(p.responseStyle);
                          setLlmPreset(p.preset);
                          setSelectedStep(p.selectedStep);
                          setFreedomMode(p.freedomMode);
                          setObjective(p.objective);
                        }}
                        className={`rounded border px-2 py-2 text-left text-[11px] transition ${
                          isActive
                            ? "border-blue-300/60 bg-blue-500/25 text-blue-50"
                            : "border-blue-500/20 bg-black/30 text-blue-200/80 hover:border-blue-400/40"
                        }`}
                      >
                        <p className="font-semibold">{p.label}</p>
                        <p className="opacity-75 mt-0.5 line-clamp-2">{p.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-600/10 p-3">
                <p className="text-xs font-semibold text-cyan-100 mb-2 uppercase tracking-wide">Chat Mode</p>
                <div className="space-y-1.5">
                  {(Object.keys(MODE_META) as ChatMode[]).map((mk) => {
                    const isActive = mode === mk;
                    return (
                      <button
                        key={mk}
                        onClick={() => setMode(mk)}
                        className={`w-full text-left rounded border px-3 py-2 text-xs transition ${
                          isActive
                            ? "border-cyan-300/55 bg-cyan-500/20 text-cyan-50"
                            : "border-cyan-500/20 bg-black/30 text-cyan-200/70 hover:border-cyan-400/40"
                        }`}
                      >
                        <p className="font-semibold uppercase tracking-wide">{MODE_META[mk].label}</p>
                        <p className="mt-0.5 opacity-75">{MODE_META[mk].description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <label htmlFor="settings-preset" className="block text-[11px] font-semibold text-white/80 mb-1 uppercase tracking-wide">LLM Preset</label>
                  <select
                    id="settings-preset"
                    value={llmPreset}
                    onChange={(e) => { const v = e.target.value; if (isLlmPresetId(v)) setLlmPreset(v); }}
                    className="w-full rounded border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-white outline-none"
                  >
                    {LLM_PRESET_IDS.map((pid) => (<option key={pid} value={pid}>{LLM_PRESET_META[pid].label}</option>))}
                  </select>
                  <p className="mt-1 text-[10px] text-white/55">{LLM_PRESET_META[llmPreset].description}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <label htmlFor="settings-style" className="block text-[11px] font-semibold text-white/80 mb-1 uppercase tracking-wide">Response Style</label>
                  <select
                    id="settings-style"
                    value={responseStyle}
                    onChange={(e) => setResponseStyle(e.target.value as ResponseStyle)}
                    className="w-full rounded border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="concise">Concise</option>
                    <option value="coach">Coach</option>
                    <option value="operator">Operator</option>
                  </select>
                </div>
              </div>
              <div className="rounded-lg border border-fuchsia-500/25 bg-fuchsia-600/10 p-3">
                <p className="text-xs font-semibold text-fuchsia-100 mb-2 uppercase tracking-wide">Freedom &amp; Fallback</p>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="settings-freedom" className="block text-[11px] text-fuchsia-100/80 mb-1">Freedom Mode</label>
                    <select
                      id="settings-freedom"
                      value={freedomMode}
                      onChange={(e) => setFreedomMode(e.target.value as FreedomMode)}
                      className="w-full rounded border border-fuchsia-500/30 bg-black/40 px-2 py-1.5 text-xs text-fuchsia-100 outline-none"
                    >
                      <option value="uncensored">Uncensored — full open lane</option>
                      <option value="standard">Standard — filtered lane</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-fuchsia-100/80">
                    <input type="checkbox" checked={autoFallback} onChange={(e) => setAutoFallback(e.target.checked)} className="accent-fuchsia-400" />
                    Auto-fallback to General Chat on primary failure
                  </label>
                </div>
              </div>
              <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-3">
                <p className="text-xs font-semibold text-cyan-100 mb-2 uppercase tracking-wide inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Privacy &amp; Data Controls
                </p>
                <label className="flex items-center gap-2 text-xs text-cyan-100/80 mb-2">
                  <input type="checkbox" checked={privacyShieldEnabled} onChange={(e) => setPrivacyShieldEnabled(e.target.checked)} className="accent-cyan-400" />
                  Privacy Shield — local session controls active
                </label>
                <div className="flex gap-2">
                  <button onClick={() => exportActiveSession("json")} className="rounded border border-cyan-300/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] text-cyan-100 hover:bg-cyan-500/20 inline-flex items-center gap-1">
                    <FileJson className="w-3 h-3" /> Export JSON
                  </button>
                  <button onClick={() => exportActiveSession("md")} className="rounded border border-cyan-300/30 bg-cyan-500/10 px-3 py-1.5 text-[11px] text-cyan-100 hover:bg-cyan-500/20 inline-flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Export MD
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === "help" ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain [scrollbar-width:thin]">
              <div className="mb-1">
                <h4 className="text-sm font-bold text-white mb-0.5">Help &amp; Guided Tour</h4>
                <p className="text-[11px] text-blue-200/60">Get up and running in minutes — built for all expertise levels.</p>
              </div>
              <div className="rounded-lg border border-blue-400/25 bg-blue-600/10 p-3">
                <p className="text-xs font-semibold text-blue-100 mb-2 uppercase tracking-wide">Quick Start — 4 Steps</p>
                <ol className="space-y-2">
                  {[
                    { n: 1, title: "Pick a Profile", desc: "Tap Beginner, Trader, Creator, or Developer in the left panel to auto-configure your session." },
                    { n: 2, title: "Set an Objective", desc: "Type your goal in the Objective Memory field — the AI keeps this as context throughout the session." },
                    { n: 3, title: "Send a Message", desc: "Use the input bar, a quick prompt chip, or a predictive suggestion. Hit Enter or tap the arrow." },
                    { n: 4, title: "Follow Pipeline Steps", desc: "The AI auto-advances you through Define → Route → Execute → Next Action." },
                  ].map(({ n, title, desc }) => (
                    <li key={n} className="flex gap-2 text-xs text-blue-100/90">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-50 text-[10px] font-bold inline-flex items-center justify-center">{n}</span>
                      <div><p className="font-semibold">{title}</p><p className="text-blue-200/65 mt-0.5">{desc}</p></div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-3">
                <p className="text-xs font-semibold text-cyan-100 mb-2 uppercase tracking-wide inline-flex items-center gap-1">
                  <Keyboard className="w-3 h-3" /> Slash Commands
                </p>
                <div className="space-y-1.5">
                  {[
                    { cmd: "/plan", desc: "Generates a step-by-step execution plan with milestones." },
                    { cmd: "/risk", desc: "Runs a risk analysis with probability, impact, and invalidation criteria." },
                    { cmd: "/content", desc: "Creates content assets — headline, hook, body draft, CTA, and variants." },
                    { cmd: "/next", desc: "Identifies the single highest-leverage next action right now." },
                  ].map(({ cmd, desc }) => (
                    <div key={cmd} className="flex gap-2 items-start text-xs">
                      <code className="flex-shrink-0 rounded border border-cyan-400/30 bg-black/40 px-1.5 py-0.5 text-[11px] text-cyan-200 font-mono">{cmd}</code>
                      <span className="text-cyan-100/75">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs font-semibold text-white mb-2 uppercase tracking-wide">Tab Guide</p>
                <div className="space-y-2">
                  {([
                    { icon: <Sparkles className="w-3 h-3" />, name: "Chat", desc: "General AI workflow — conversations, plans, content, and execution guidance." },
                    { icon: <BarChart3 className="w-3 h-3" />, name: "Predictive Quant Assistant", desc: "Market scenario tables, asset bias summaries, and quantitative signal snapshots." },
                    { icon: <Settings2 className="w-3 h-3" />, name: "Settings", desc: "Configure profile, mode, preset, freedom mode, and data export." },
                    { icon: <HelpCircle className="w-3 h-3" />, name: "Help", desc: "Guided tour, slash commands, keyboard shortcuts, and feature explanations — this panel." },
                  ] as Array<{ icon: React.ReactNode; name: string; desc: string }>).map(({ icon, name, desc }) => (
                    <div key={name} className="flex gap-2 items-start text-xs text-white/80">
                      <span className="flex-shrink-0 mt-0.5 text-cyan-300">{icon}</span>
                      <div><p className="font-semibold text-white">{name}</p><p className="text-white/55">{desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs font-semibold text-white mb-2 uppercase tracking-wide">Keyboard Shortcuts</p>
                <div className="space-y-1.5 text-xs">
                  {[
                    { key: "Enter", action: "Send message" },
                    { key: "Shift + Enter", action: "New line in input" },
                    { key: "Esc (in rename)", action: "Cancel session rename" },
                  ].map(({ key, action }) => (
                    <div key={key} className="flex items-center gap-2 text-white/75">
                      <code className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-[11px] font-mono text-white/85">{key}</code>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-fuchsia-400/20 bg-fuchsia-500/10 p-3 text-xs text-fuchsia-100/85">
                <p className="font-semibold text-fuchsia-100 mb-0.5 inline-flex items-center gap-1"><Unlock className="w-3 h-3" /> Open Lane Active</p>
                <p>This assistant runs in uncensored mode by default — no content filters, full freedom. Verify risk-sensitive information before acting on it.</p>
              </div>
            </div>
          ) : (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 overscroll-contain [scrollbar-gutter:stable] [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
            {showFirstRunNudge && messages.length === 0 && (
              <div className="rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                <p className="font-semibold">Welcome — choose your lane in one click</p>
                <p className="mt-1 text-emerald-100/80 text-xs">
                  Pick a profile in the left panel to auto-configure chat mode, style, and prompt starter.
                </p>
                <button
                  onClick={() => {
                    setShowFirstRunNudge(false);
                    if (typeof window !== "undefined") {
                      try {
                        window.localStorage.setItem(FIRST_RUN_NUDGE_KEY, "1");
                      } catch {
                        // no-op
                      }
                    }
                  }}
                  className="mt-2 rounded border border-emerald-300/40 bg-black/25 px-2 py-1 text-[11px] font-semibold text-emerald-100"
                >
                  Dismiss
                </button>
              </div>
            )}

            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-emerald-200/50 text-center">
                <div>
                  <p className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                    <Compass className="w-4 h-4" />
                    Start with Step {selectedStep + 1}: {PIPELINE_STEPS[selectedStep]?.title}
                  </p>
                  <p className="text-sm">Use quick actions below, then iterate with focused prompts like top-tier AI products.</p>
                  <p className="mt-2 text-[11px] text-emerald-200/60">Tip: slash shortcuts supported — <span className="font-mono">/plan</span>, <span className="font-mono">/risk</span>, <span className="font-mono">/content</span>, <span className="font-mono">/next</span></p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[95%] sm:max-w-[88%] lg:max-w-2xl px-4 py-2 rounded-xl ${
                    msg.role === "user"
                      ? "bg-indigo-600/30 text-indigo-100 border border-indigo-400/40 shadow-[0_8px_24px_rgba(99,102,241,0.14)]"
                      : "bg-blue-600/12 text-blue-50 border border-blue-400/35 shadow-[0_0_28px_rgba(59,130,246,0.20),0_8px_24px_rgba(6,182,212,0.12)]"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wide opacity-75">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      {msg.role === "user" ? <UserRound className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      {msg.role === "user" ? "You" : "TradeHax AI"}
                    </span>
                    <span>
                      {new Date(msg.meta?.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.content}</p>
                  {msg.role === "assistant" && (
                    <div className="mt-3 rounded border border-cyan-400/25 bg-black/30 p-2 text-[11px]">
                      {(() => {
                        const signals = scoreAssistantResponse(
                          msg.content,
                          msg.meta?.step ?? selectedStep,
                          msg.meta?.mode ?? mode,
                        );

                        return (
                          <>
                            <div className="mb-2 font-semibold text-cyan-200">Decision Signals</div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {msg.meta?.predictionDomain && msg.meta.predictionDomain !== "general" ? (
                                <SignalPill
                                  label={`Domain ${msg.meta.predictionDomain.toUpperCase()}`}
                                  tone="mid"
                                />
                              ) : null}
                              {typeof msg.meta?.predictionConfidence === "number" ? (
                                <SignalPill
                                  label={`Domain conf ${msg.meta.predictionConfidence}%`}
                                  tone={msg.meta.predictionConfidence >= 70 ? "good" : "mid"}
                                />
                              ) : null}
                              <SignalPill
                                label={`Confidence ${signals.confidence}%`}
                                tone={signals.confidence >= 75 ? "good" : signals.confidence >= 55 ? "mid" : "warn"}
                              />
                              <SignalPill
                                label={`Risk ${signals.risk}%`}
                                tone={signals.risk <= 30 ? "good" : signals.risk <= 55 ? "mid" : "warn"}
                              />
                              <SignalPill
                                label={`Priority ${signals.priority}`}
                                tone={signals.priority === "High" ? "good" : signals.priority === "Medium" ? "mid" : "warn"}
                              />
                            </div>
                            <p className="text-cyan-100/75">
                              <span className="font-semibold text-cyan-200">Next action:</span> {signals.nextAction}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-full max-w-xl bg-cyan-600/20 border border-cyan-500/20 rounded-lg px-4 py-3 text-cyan-100">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-medium">Generating response</span>
                    <span className="inline-flex items-center gap-1 ml-1 text-cyan-100/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 animate-pulse" />
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 animate-pulse [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 animate-pulse [animation-delay:240ms]" />
                    </span>
                  </div>
                  <progress
                    className="mt-2 h-1.5 w-full overflow-hidden rounded bg-cyan-950/50 [&::-webkit-progress-bar]:bg-cyan-950/50 [&::-webkit-progress-value]:bg-cyan-300/80 [&::-moz-progress-bar]:bg-cyan-300/80"
                    value={loading ? responseLoadProgress : 100}
                    max={100}
                  />
                  <p className="mt-1 text-[11px] text-cyan-100/80">{Math.min(responseLoadProgress, 99)}% • {responseLoadSeconds}s elapsed</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex gap-3 justify-start">
                <div className="bg-red-600/20 border border-red-500/30 rounded-lg px-4 py-2 text-red-200 text-sm">
                  {error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
          )}

          <div className="border-t border-blue-500/20 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#050a14]/60 backdrop-blur-sm">
            {objective && (
              <div className="mb-2 text-[11px] text-cyan-200/70">Objective memory: {objective}</div>
            )}
            {autoAdvanceMessage && (
              <div className="mb-2 text-[11px] text-emerald-200/80">{autoAdvanceMessage}</div>
            )}
            {nextActionSignals && (
              <div className="mb-2 rounded-lg border border-cyan-400/25 bg-cyan-600/10 p-2.5">
                <p className="text-[11px] text-cyan-100/75 uppercase tracking-wide">Next best action</p>
                <p className="mt-1 text-sm text-cyan-50">{nextActionSignals.nextAction}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => setInput(`Expand this into a 3-step execution plan:\n\n${nextActionSignals.nextAction}`)}
                    className="rounded border border-cyan-300/30 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-100"
                  >
                    Build plan
                  </button>
                  <button
                    onClick={() => setInput(`Risk-check this recommendation before I execute:\n\n${nextActionSignals.nextAction}`)}
                    className="rounded border border-cyan-300/30 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-100"
                  >
                    Risk-check
                  </button>
                  <button
                    onClick={() => setInput(`Give me a concise message template based on this action:\n\n${nextActionSignals.nextAction}`)}
                    className="rounded border border-cyan-300/30 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-100"
                  >
                    Draft message
                  </button>
                </div>
              </div>
            )}
            <div className="mb-2 flex flex-wrap gap-2">
              {COMPOSER_QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => applyComposerQuickAction(action)}
                  className="rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-200 hover:bg-white/[0.08] motion-safe:hover:-translate-y-0.5 transition"
                  title={action.prompt}
                >
                  {action.label}
                </button>
              ))}
            </div>
            <div className="mb-2 flex flex-wrap gap-2">
              {predictiveSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-lg border border-blue-300/25 bg-blue-500/10 px-2.5 py-1 text-[11px] text-blue-100 hover:border-blue-200/40"
                  title="Apply predictive query"
                >
                  {suggestion.length > 68 ? `${suggestion.slice(0, 68)}…` : suggestion}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <div className="relative flex flex-col gap-2">
                <button
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className="rounded-xl border border-white/20 bg-white/5 p-2 text-zinc-200 hover:bg-white/10"
                  title="Emoji picker"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  onClick={handleVoiceInput}
                  disabled={!voiceSupport}
                  className={`rounded-xl border p-2 text-zinc-200 disabled:opacity-40 ${
                    isVoiceRecording
                      ? "border-rose-300/50 bg-rose-500/20 text-rose-100"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                  title={voiceSupport ? "Voice input" : "Voice input unavailable"}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-white/20 bg-white/5 p-2 text-zinc-200 hover:bg-white/10"
                  title="Upload file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv,.json,.md"
                  aria-label="Upload file for AI analysis"
                  title="Upload file"
                  className="hidden"
                  onChange={(e) => {
                    void handleFileUpload(e);
                  }}
                />

                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 rounded-lg border border-white/15 bg-black/90 p-2 shadow-xl">
                    <div className="grid grid-cols-5 gap-1">
                      {["🚀", "📈", "📉", "🧠", "⚡", "💎", "🔥", "🎯", "🛡️", "🧪"].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => appendEmoji(emoji)}
                          className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-sm hover:bg-white/[0.12]"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask naturally (or use /plan, /risk, /content, /next)…"
                rows={3}
                disabled={loading}
                className="flex-1 rounded-xl border border-blue-500/30 bg-black/50 px-3 py-2 text-blue-50 placeholder-blue-200/35 outline-none resize-none disabled:opacity-50 focus:border-blue-300/60 focus:shadow-[0_0_16px_rgba(59,130,246,0.15)]"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="theme-cta theme-cta--loud px-4 py-2 h-14 disabled:opacity-50 flex items-center justify-center"
                title="Send message"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Use concise prompts with constraints for best output quality.</span>
              <span>{input.trim().length}/2000</span>
            </div>
          </div>
        </section>

        <aside className="hidden lg:flex flex-col border-l border-blue-500/20 bg-gradient-to-b from-blue-950/20 via-black/35 to-rose-950/15 p-3 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 mb-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-100 inline-flex items-center gap-1">
                <Newspaper className="w-3.5 h-3.5 text-cyan-300" />
                Social Signal Feed
              </p>
              <span className="rounded-full border border-rose-300/30 bg-rose-500/15 px-2 py-0.5 text-[10px] text-rose-100 font-semibold">
                Unfiltered vibe
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">Related X-like posts and community threads for context.</p>
          </div>

          <div className="rounded-lg border border-fuchsia-400/20 bg-fuchsia-500/10 p-3 mb-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-fuchsia-100">Dynasty Mode</p>
              <button
                onClick={() => setDynastyMode((prev) => !prev)}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  dynastyMode
                    ? "border-amber-300/45 bg-amber-500/20 text-amber-100"
                    : "border-white/20 bg-white/5 text-zinc-200"
                }`}
                title="Toggle dynasty integrations"
              >
                {dynastyMode ? "ON" : "OFF"}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-fuchsia-100/80">
              Integrates trading, repairs, and music workflow intents from one command surface.
            </p>
            {dynastyMode && (
              <div className="mt-3 space-y-2">
                {[
                  {
                    icon: <BarChart3 className="w-3.5 h-3.5" />,
                    label: "Trading Intelligence",
                    desc: "Market signals, position sizing, and quant predictions",
                    hint: "Open /intelligence for live market suite",
                    color: "border-cyan-400/35 bg-cyan-500/15 text-cyan-100",
                    prompt: "Give me the top 3 trading setups right now with entry, stop, and target levels.",
                  },
                  {
                    icon: <Settings2 className="w-3.5 h-3.5" />,
                    label: "Repair Services",
                    desc: "Book device repair, diagnostics, and tech support",
                    hint: "Route to /services for booking",
                    color: "border-amber-400/30 bg-amber-500/12 text-amber-100",
                    prompt: "I need to book a device repair. What's the fastest way to get scheduled?",
                  },
                  {
                    icon: <Mic className="w-3.5 h-3.5" />,
                    label: "Music Lessons",
                    desc: "Guitar studio, beginner lessons, and scholarship programs",
                    hint: "View /music for all programs",
                    color: "border-fuchsia-400/30 bg-fuchsia-500/12 text-fuchsia-100",
                    prompt: "Tell me about music lesson options and how to get started with guitar sessions.",
                  },
                ].map(({ icon, label, desc, hint, color, prompt }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setInput(prompt);
                      setActiveTab("chat");
                    }}
                    className={`w-full rounded-lg border text-left px-2.5 py-2 transition hover:brightness-110 ${color}`}
                    title={hint}
                  >
                    <p className="text-[11px] font-semibold inline-flex items-center gap-1">{icon}{label}</p>
                    <p className="text-[10px] opacity-75 mt-0.5">{desc}</p>
                    <p className="text-[10px] opacity-55 mt-0.5 italic">{hint}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-3 mb-3">
            <p className="text-xs font-semibold text-emerald-100 inline-flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              Rewards
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-50">{rewardPoints} XP</p>
            <p className="text-[11px] text-emerald-100/75">Earned from interactions and completed action loops.</p>
          </div>

          <div className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-3 mb-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-cyan-100 inline-flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Privacy Shield
              </p>
              <button
                onClick={() => setPrivacyShieldEnabled((prev) => !prev)}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  privacyShieldEnabled
                    ? "border-cyan-300/45 bg-cyan-500/20 text-cyan-100"
                    : "border-white/20 bg-white/5 text-zinc-200"
                }`}
              >
                {privacyShieldEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-cyan-100/75">Local session controls, export options, and user-managed history.</p>
          </div>

          <div className="space-y-2">
            {filteredCommunityFeed.map((post) => (
              <article key={post.id} className="rounded-lg border border-white/10 bg-black/25 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-zinc-100">{post.handle}</p>
                  <span className="text-[10px] text-zinc-400">{post.timeAgo}</span>
                </div>
                <p className="text-[10px] uppercase tracking-wide text-cyan-300/80">{post.channel}</p>
                <p className="mt-1 text-xs text-zinc-200/90 leading-relaxed">{post.content}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>#{post.tag}</span>
                  <span>{post.likes} likes • {post.replies} replies</span>
                </div>
              </article>
            ))}
          </div>

          <button
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-blue-300/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-100 hover:bg-blue-500/20"
            title="Simulated action"
          >
            <Upload className="w-3.5 h-3.5" />
            Load More Threads
          </button>
        </aside>
      </div>
    </div>
  );
}

function SignalPill({
  label,
  tone,
}: {
  label: string;
  tone: "good" | "mid" | "warn";
}) {
  const toneClasses =
    tone === "good"
      ? "border-emerald-400/30 bg-emerald-500/20 text-emerald-100"
      : tone === "mid"
        ? "border-amber-400/30 bg-amber-500/20 text-amber-100"
        : "border-rose-400/30 bg-rose-500/20 text-rose-100";

  return <span className={`rounded px-2 py-1 border ${toneClasses}`}>{label}</span>;
}
