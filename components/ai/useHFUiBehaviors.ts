import { OPEN_MODE_NOTICE_KEY } from "@/components/ai/hfchat-config";
import type { FreedomMode } from "@/components/ai/hfchat-types";
import { useCallback, useEffect, useState } from "react";

type UseHFUiBehaviorsParams = {
  loading: boolean;
  freedomMode: FreedomMode;
};

export function useHFUiBehaviors({ loading, freedomMode }: UseHFUiBehaviorsParams) {
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [showOpenModeNotice, setShowOpenModeNotice] = useState(false);
  const [responseLoadProgress, setResponseLoadProgress] = useState(0);
  const [responseLoadSeconds, setResponseLoadSeconds] = useState(0);
  const [voiceSupport, setVoiceSupport] = useState(false);

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

  const dismissOpenModeNotice = useCallback(() => {
    setShowOpenModeNotice(false);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(OPEN_MODE_NOTICE_KEY, "1");
    } catch {
      // ignore storage failures
    }
  }, []);

  return {
    showControlPanel,
    setShowControlPanel,
    showOpenModeNotice,
    dismissOpenModeNotice,
    responseLoadProgress,
    responseLoadSeconds,
    voiceSupport,
  };
}
