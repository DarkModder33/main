import type {
  AssistantProfileId,
  ChatMode,
  CommunityPost,
  FreedomMode,
  LlmPresetId,
  ResponseStyle,
} from "@/components/ai/hfchat-types";

export const PIPELINE_MEMORY_KEY = "tradehax-ai-pipeline-memory-v1";
export const CHAT_SESSIONS_KEY = "tradehax-ai-chat-sessions-v1";
export const PINNED_PROMPTS_KEY = "tradehax-ai-pinned-prompts-v1";
export const OPEN_MODE_NOTICE_KEY = "tradehax-ai-open-mode-notice-v1";
export const ASSISTANT_PROFILE_KEY = "tradehax-ai-assistant-profile-v1";
export const FIRST_RUN_NUDGE_KEY = "tradehax-ai-first-run-nudge-v1";

export const MODE_META: Record<
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

export const LLM_PRESET_META: Record<
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

export const LLM_PRESET_IDS: LlmPresetId[] = [
  "navigator_fast",
  "operator_exec",
  "analyst_risk",
  "creative_growth",
  "deep_research",
  "fallback_safe",
];

export const ASSISTANT_PROFILE_META: Record<
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

export function isLlmPresetId(value: unknown): value is LlmPresetId {
  return typeof value === "string" && LLM_PRESET_IDS.includes(value as LlmPresetId);
}

export const PIPELINE_STEPS = [
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

export const QUICK_START_PROMPTS = [
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

export const COMPOSER_QUICK_ACTIONS: Array<{
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

export const PREDICTIVE_QUERY_SNIPPETS = [
  "Forecast core L1 trend for next 24h with bullish and bearish scenarios.",
  "Build a risk-managed BTC scalp checklist with invalidation rules.",
  "Compare portfolio drawdown risk if market drops 8% this week.",
  "Generate a concise macro watchlist with priority signals.",
  "Simulate a 3-asset rebalance using low-volatility allocation.",
  "Create entry, stop-loss, and take-profit ranges for ETH swing setup.",
  "Summarize social sentiment impact on top 5 ecosystem tokens.",
  "Create a daily trading journal template with risk scoring.",
];

export const COMMUNITY_FEED: CommunityPost[] = [
  {
    id: "feed-1",
    handle: "@quant_helix",
    channel: "Market Pulse",
    content: "L1 volume breakout forming. Watching 4H structure + funding divergence before entries.",
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
