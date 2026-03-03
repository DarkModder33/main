import { PINNED_PROMPTS_KEY } from "@/components/ai/hfchat-config";
import type { PinnedPrompt, PromptCategory } from "@/components/ai/hfchat-types";
import { sanitizePinnedPrompt } from "@/components/ai/hfchat-utils";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseHFPinnedPromptsParams = {
  setStorageWarning: React.Dispatch<React.SetStateAction<string>>;
};

export function useHFPinnedPrompts({ setStorageWarning }: UseHFPinnedPromptsParams) {
  const [pinnedPrompts, setPinnedPrompts] = useState<PinnedPrompt[]>([]);
  const [pinLabel, setPinLabel] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinCategory, setPinCategory] = useState<PromptCategory>("onboarding");

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawPinned = window.localStorage.getItem(PINNED_PROMPTS_KEY);
      if (!rawPinned) return;

      const parsedPinned = JSON.parse(rawPinned) as unknown[];
      if (!Array.isArray(parsedPinned)) return;

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
    } catch {
      setStorageWarning((prev) => prev || "Pinned prompts could not be loaded from local storage.");
    }
  }, [setStorageWarning]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PINNED_PROMPTS_KEY, JSON.stringify(pinnedPrompts));
    } catch {
      setStorageWarning((prev) => prev || "Pinned prompts could not be saved.");
    }
  }, [pinnedPrompts, setStorageWarning]);

  const addPinnedPrompt = useCallback(() => {
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
  }, [pinInput, pinLabel, pinCategory, setStorageWarning]);

  const removePinnedPrompt = useCallback((promptId: string) => {
    setPinnedPrompts((prev) => prev.filter((item) => item.id !== promptId));
  }, []);

  const filteredPinnedPrompts = useMemo(
    () => pinnedPrompts.filter((item) => item.category === pinCategory),
    [pinnedPrompts, pinCategory],
  );

  return {
    pinLabel,
    setPinLabel,
    pinInput,
    setPinInput,
    pinCategory,
    setPinCategory,
    addPinnedPrompt,
    removePinnedPrompt,
    filteredPinnedPrompts,
  };
}
