import {
  ASSISTANT_PROFILE_KEY,
  ASSISTANT_PROFILE_META,
  FIRST_RUN_NUDGE_KEY,
} from "@/components/ai/hfchat-config";
import type {
  AssistantProfileId,
  ChatMode,
  FreedomMode,
  LlmPresetId,
  ResponseStyle,
} from "@/components/ai/hfchat-types";
import { useCallback, useEffect, useState } from "react";

type SearchParamsLike = {
  get: (name: string) => string | null;
};

type UseHFProfileBootstrapParams = {
  searchParams: SearchParamsLike;
  setMode: React.Dispatch<React.SetStateAction<ChatMode>>;
  setResponseStyle: React.Dispatch<React.SetStateAction<ResponseStyle>>;
  setLlmPreset: React.Dispatch<React.SetStateAction<LlmPresetId>>;
  setSelectedStep: React.Dispatch<React.SetStateAction<number>>;
  setFreedomMode: React.Dispatch<React.SetStateAction<FreedomMode>>;
  setObjective: React.Dispatch<React.SetStateAction<string>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
};

export function useHFProfileBootstrap({
  searchParams,
  setMode,
  setResponseStyle,
  setLlmPreset,
  setSelectedStep,
  setFreedomMode,
  setObjective,
  setInput,
}: UseHFProfileBootstrapParams) {
  const [activeProfile, setActiveProfile] = useState<AssistantProfileId>("beginner");
  const [showFirstRunNudge, setShowFirstRunNudge] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  const markFirstRunSeen = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(FIRST_RUN_NUDGE_KEY, "1");
    } catch {
      // no-op
    }
  }, []);

  const dismissFirstRunNudge = useCallback(() => {
    setShowFirstRunNudge(false);
    markFirstRunSeen();
  }, [markFirstRunSeen]);

  const applyProfile = useCallback(
    (profileId: AssistantProfileId, seedInput = true) => {
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
      markFirstRunSeen();
    },
    [
      setMode,
      setResponseStyle,
      setLlmPreset,
      setSelectedStep,
      setFreedomMode,
      setObjective,
      setInput,
      markFirstRunSeen,
    ],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

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
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ASSISTANT_PROFILE_KEY, activeProfile);
    } catch {
      // ignore profile persistence failure
    }
  }, [activeProfile]);

  useEffect(() => {
    const starter = searchParams.get("starter");
    const profileParam = searchParams.get("profile");

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
  }, [searchParams, applyProfile]);

  return {
    activeProfile,
    showFirstRunNudge,
    dismissFirstRunNudge,
    showAdvancedControls,
    setShowAdvancedControls,
    applyProfile,
  };
}
