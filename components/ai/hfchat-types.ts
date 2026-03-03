export type ChatMode = "navigator" | "custom" | "chat";

export type ResponseStyle = "concise" | "coach" | "operator";
export type FreedomMode = "uncensored" | "standard";
export type AssistantProfileId = "beginner" | "trader" | "creator" | "developer";
export type LlmPresetId =
  | "navigator_fast"
  | "operator_exec"
  | "analyst_risk"
  | "creative_growth"
  | "deep_research"
  | "fallback_safe";
export type PromptCategory = "onboarding" | "trading" | "content" | "ops";

export interface Message {
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

export type PipelineMemory = {
  objective: string;
  selectedStep: number;
  mode: ChatMode;
  responseStyle: ResponseStyle;
  autoFallback: boolean;
  freedomMode: FreedomMode;
  llmPreset: LlmPresetId;
};

export type PinnedPrompt = {
  id: string;
  label: string;
  prompt: string;
  category: PromptCategory;
};

export type ChatSession = {
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

export type CommunityPost = {
  id: string;
  handle: string;
  channel: "Market Pulse" | "Community Thread" | "Strategy Board";
  content: string;
  timeAgo: string;
  likes: number;
  replies: number;
  tag: "crypto" | "stocks" | "macro" | "ops";
};
