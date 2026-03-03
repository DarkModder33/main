import { CHAT_SESSIONS_KEY } from "@/components/ai/hfchat-config";
import type {
  ChatMode,
  ChatSession,
  FreedomMode,
  LlmPresetId,
  Message,
  ResponseStyle,
} from "@/components/ai/hfchat-types";
import { buildSessionTitle, createEmptySession } from "@/components/ai/hfchat-utils";
import { useCallback, useEffect, useMemo, useState } from "react";

type SessionHookParams = {
  mode: ChatMode;
  responseStyle: ResponseStyle;
  autoFallback: boolean;
  freedomMode: FreedomMode;
  llmPreset: LlmPresetId;
  selectedStep: number;
  objective: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setObjective: React.Dispatch<React.SetStateAction<string>>;
  setSelectedStep: React.Dispatch<React.SetStateAction<number>>;
  setMode: React.Dispatch<React.SetStateAction<ChatMode>>;
  setResponseStyle: React.Dispatch<React.SetStateAction<ResponseStyle>>;
  setLlmPreset: React.Dispatch<React.SetStateAction<LlmPresetId>>;
  setAutoFallback: React.Dispatch<React.SetStateAction<boolean>>;
  setFreedomMode: React.Dispatch<React.SetStateAction<FreedomMode>>;
  setAutoAdvanceMessage: React.Dispatch<React.SetStateAction<string>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  setStorageWarning: React.Dispatch<React.SetStateAction<string>>;
};

export function useHFChatSessions({
  mode,
  responseStyle,
  autoFallback,
  freedomMode,
  llmPreset,
  selectedStep,
  objective,
  messages,
  setMessages,
  setObjective,
  setSelectedStep,
  setMode,
  setResponseStyle,
  setLlmPreset,
  setAutoFallback,
  setFreedomMode,
  setAutoAdvanceMessage,
  setError,
  setStorageWarning,
}: SessionHookParams) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [showArchivedSessions, setShowArchivedSessions] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");
  const [isRenamingSession, setIsRenamingSession] = useState(false);
  const [sessionDraftName, setSessionDraftName] = useState("");

  const applySession = useCallback(
    (session: ChatSession) => {
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
    },
    [
      setMessages,
      setObjective,
      setSelectedStep,
      setMode,
      setResponseStyle,
      setLlmPreset,
      setAutoFallback,
      setFreedomMode,
      setAutoAdvanceMessage,
      setError,
    ],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawSessions = window.localStorage.getItem(CHAT_SESSIONS_KEY);
      if (!rawSessions) return;

      const parsedSessions = JSON.parse(rawSessions) as ChatSession[];
      if (!Array.isArray(parsedSessions) || parsedSessions.length === 0) return;

      const sortedSessions = [...parsedSessions]
        .filter((session) => typeof session?.id === "string" && session.id.length > 0)
        .sort((a, b) => b.updatedAt - a.updatedAt);

      if (sortedSessions.length === 0) return;

      setSessions(sortedSessions);
      setActiveSessionId(sortedSessions[0].id);
      applySession(sortedSessions[0]);
    } catch {
      setStorageWarning("Session history could not be loaded. Starting with a clean workspace.");
    }
  }, [applySession, setStorageWarning]);

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
  }, [
    sessions.length,
    activeSessionId,
    mode,
    responseStyle,
    autoFallback,
    freedomMode,
    llmPreset,
    selectedStep,
    objective,
    messages,
  ]);

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
  }, [
    activeSessionId,
    messages,
    objective,
    selectedStep,
    mode,
    responseStyle,
    autoFallback,
    freedomMode,
    llmPreset,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessions.length === 0) return;

    try {
      window.localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    } catch {
      setStorageWarning((prev) => prev || "Session history could not be saved due to local storage limits.");
    }
  }, [sessions, setStorageWarning]);

  const createSession = useCallback(() => {
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
  }, [mode, responseStyle, autoFallback, freedomMode, llmPreset, applySession]);

  const archiveActiveSession = useCallback(() => {
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
  }, [
    activeSessionId,
    sessions,
    mode,
    responseStyle,
    autoFallback,
    freedomMode,
    llmPreset,
    applySession,
    setStorageWarning,
  ]);

  const deleteActiveSession = useCallback(() => {
    if (!activeSessionId) return;
    const remaining = sessions.filter((session) => session.id !== activeSessionId);
    setSessions(remaining);

    const fallback = remaining.find((session) => !session.archived) ?? remaining[0];
    if (fallback) {
      setActiveSessionId(fallback.id);
      applySession(fallback);
      return;
    }

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
  }, [activeSessionId, sessions, mode, responseStyle, autoFallback, freedomMode, llmPreset, applySession]);

  const toggleArchivedSession = useCallback(
    (sessionId: string) => {
      const target = sessions.find((session) => session.id === sessionId);
      if (!target) return;

      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, archived: !session.archived, updatedAt: Date.now() }
            : session,
        ),
      );
    },
    [sessions],
  );

  const switchSession = useCallback(
    (sessionId: string) => {
      const targetSession = sessions.find((session) => session.id === sessionId);
      if (!targetSession) return;
      setActiveSessionId(targetSession.id);
      setIsRenamingSession(false);
      setSessionDraftName("");
      applySession(targetSession);
    },
    [sessions, applySession],
  );

  const startRenameSession = useCallback(() => {
    const activeSession = sessions.find((session) => session.id === activeSessionId);
    if (!activeSession) return;
    setSessionDraftName(activeSession.title);
    setIsRenamingSession(true);
  }, [sessions, activeSessionId]);

  const cancelRenameSession = useCallback(() => {
    setIsRenamingSession(false);
    setSessionDraftName("");
  }, []);

  const saveRenameSession = useCallback(() => {
    const trimmed = sessionDraftName.trim().slice(0, 60);
    if (!trimmed) {
      cancelRenameSession();
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

    cancelRenameSession();
  }, [sessionDraftName, activeSessionId, cancelRenameSession]);

  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) => {
        if (session.archived !== showArchivedSessions) return false;
        if (!sessionSearch.trim()) return true;
        const query = sessionSearch.trim().toLowerCase();
        return (
          session.title.toLowerCase().includes(query) ||
          session.messages.some((message) => message.content.toLowerCase().includes(query))
        );
      }),
    [sessions, showArchivedSessions, sessionSearch],
  );

  return {
    sessions,
    activeSessionId,
    showArchivedSessions,
    setShowArchivedSessions,
    sessionSearch,
    setSessionSearch,
    isRenamingSession,
    setIsRenamingSession,
    sessionDraftName,
    setSessionDraftName,
    filteredSessions,
    createSession,
    archiveActiveSession,
    deleteActiveSession,
    toggleArchivedSession,
    switchSession,
    startRenameSession,
    saveRenameSession,
    cancelRenameSession,
  };
}
