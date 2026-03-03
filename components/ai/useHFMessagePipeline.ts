import { isLlmPresetId, MODE_META, PIPELINE_STEPS } from "@/components/ai/hfchat-config";
import type {
  ChatMode,
  FreedomMode,
  LlmPresetId,
  Message,
  ResponseStyle,
} from "@/components/ai/hfchat-types";
import { resolveSlashShortcut } from "@/components/ai/hfchat-utils";
import { useCallback } from "react";

type UseHFMessagePipelineParams = {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  mode: ChatMode;
  objective: string;
  setObjective: React.Dispatch<React.SetStateAction<string>>;
  selectedStep: number;
  setSelectedStep: React.Dispatch<React.SetStateAction<number>>;
  responseStyle: ResponseStyle;
  autoFallback: boolean;
  freedomMode: FreedomMode;
  llmPreset: LlmPresetId;
  setLlmPreset: React.Dispatch<React.SetStateAction<LlmPresetId>>;
  userId: string;
  setAutoAdvanceMessage: React.Dispatch<React.SetStateAction<string>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setRewardPoints: React.Dispatch<React.SetStateAction<number>>;
};

export function useHFMessagePipeline({
  input,
  setInput,
  messages,
  setMessages,
  mode,
  objective,
  setObjective,
  selectedStep,
  setSelectedStep,
  responseStyle,
  autoFallback,
  freedomMode,
  llmPreset,
  setLlmPreset,
  userId,
  setAutoAdvanceMessage,
  setError,
  setLoading,
  setRewardPoints,
}: UseHFMessagePipelineParams) {
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
      const { endpoint } = MODE_META[mode];
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
  }, [
    input,
    objective,
    selectedStep,
    mode,
    freedomMode,
    messages,
    responseStyle,
    llmPreset,
    userId,
    autoFallback,
    setObjective,
    setAutoAdvanceMessage,
    setMessages,
    setRewardPoints,
    setInput,
    setLoading,
    setError,
    setLlmPreset,
    setSelectedStep,
  ]);

  return {
    sendMessage,
  };
}
