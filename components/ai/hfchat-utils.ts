import type { ChatMode, ChatSession, Message, PinnedPrompt } from "@/components/ai/hfchat-types";

export function resolveSlashShortcut(input: string) {
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
    return "Given current context, tell me the single highest-leverage next action and why.";
  }

  return trimmed;
}

export type DecisionSignals = {
  confidence: number;
  risk: number;
  priority: "High" | "Medium" | "Low";
  nextAction: string;
};

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function buildSessionTitle(messages: Message[], fallback = "New session") {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content?.trim();
  if (!firstUserMessage) return fallback;
  return firstUserMessage.length > 48 ? `${firstUserMessage.slice(0, 48).trim()}…` : firstUserMessage;
}

export function createEmptySession(overrides?: Partial<ChatSession>): ChatSession {
  const now = Date.now();
  const generateSessionId = (timestamp: number): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `session-${timestamp}-${crypto.randomUUID()}`;
    }

    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(8);
      crypto.getRandomValues(bytes);
      const randomHex = Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
      return `session-${timestamp}-${randomHex}`;
    }

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

export function sanitizePinnedPrompt(raw: unknown): PinnedPrompt | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Partial<PinnedPrompt>;
  if (typeof item.id !== "string" || typeof item.label !== "string" || typeof item.prompt !== "string") {
    return null;
  }

  const { category } = item;
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

export function scoreAssistantResponse(content: string, step: number, mode: ChatMode): DecisionSignals {
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
