"use client";

import {
    Archive,
    ArrowUp,
    BarChart3,
    Bot,
    Compass,
    Copy,
    FileJson,
    FileText,
    Flame,
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
import {
  ASSISTANT_PROFILE_META,
  COMMUNITY_FEED,
  COMPOSER_QUICK_ACTIONS,
  isLlmPresetId,
  LLM_PRESET_IDS,
  LLM_PRESET_META,
  MODE_META,
  PIPELINE_MEMORY_KEY,
  PIPELINE_STEPS,
  PREDICTIVE_QUERY_SNIPPETS,
  QUICK_START_PROMPTS,
} from "@/components/ai/hfchat-config";
import type {
  AssistantProfileId,
  ChatMode,
  ChatSession,
  FreedomMode,
  LlmPresetId,
  Message,
  PipelineMemory,
  ResponseStyle,
} from "@/components/ai/hfchat-types";
import {
  clamp,
  scoreAssistantResponse,
} from "@/components/ai/hfchat-utils";
import { useHFMessagePipeline } from "@/components/ai/useHFMessagePipeline";
import { HFChatSideRail } from "@/components/ai/HFChatSideRail";
import { useHFPinnedPrompts } from "@/components/ai/useHFPinnedPrompts";
import { useHFProfileBootstrap } from "@/components/ai/useHFProfileBootstrap";
import { useHFChatSessions } from "@/components/ai/useHFChatSessions";
import { useHFUiBehaviors } from "@/components/ai/useHFUiBehaviors";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function HFChatComponent() {
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState("");
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
  const [copied, setCopied] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
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

  const {
    sessions,
    activeSessionId,
    showArchivedSessions,
    setShowArchivedSessions,
    sessionSearch,
    setSessionSearch,
    isRenamingSession,
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
  } = useHFChatSessions({
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
  });

  const {
    showControlPanel,
    setShowControlPanel,
    showOpenModeNotice,
    dismissOpenModeNotice,
    responseLoadProgress,
    responseLoadSeconds,
    voiceSupport,
  } = useHFUiBehaviors({ loading, freedomMode });

  const {
    pinLabel,
    setPinLabel,
    pinInput,
    setPinInput,
    pinCategory,
    setPinCategory,
    addPinnedPrompt,
    removePinnedPrompt,
    filteredPinnedPrompts,
  } = useHFPinnedPrompts({ setStorageWarning });

  const { sendMessage } = useHFMessagePipeline({
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
  });

  const {
    activeProfile,
    showFirstRunNudge,
    dismissFirstRunNudge,
    showAdvancedControls,
    setShowAdvancedControls,
    applyProfile,
  } = useHFProfileBootstrap({
    searchParams,
    setMode,
    setResponseStyle,
    setLlmPreset,
    setSelectedStep,
    setFreedomMode,
    setObjective,
    setInput,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUserId = window.localStorage.getItem("tradehax_user_id") || "";
    if (storedUserId.trim().length > 0) {
      setUserId(storedUserId.trim());
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

  }, []);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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

  const filteredCommunityFeed = COMMUNITY_FEED;

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
                          cancelRenameSession();
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
                      onClick={() => applyProfile(profileId, true)}
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
                      const { value } = e.target;
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
              <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-100/85">Single Workspace Mode</p>
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

          <div className="mx-4 mt-2 rounded border border-blue-400/25 bg-blue-600/10 px-3 py-2 text-[11px] text-blue-100">
            <strong>Quick flow:</strong> choose profile, set objective, send prompt, execute next action.
          </div>

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

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 overscroll-contain [scrollbar-gutter:stable] [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
            {showFirstRunNudge && messages.length === 0 && (
              <div className="rounded-lg border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                <p className="font-semibold">Welcome — choose your lane in one click</p>
                <p className="mt-1 text-emerald-100/80 text-xs">
                  Pick a profile in the left panel to auto-configure chat mode, style, and prompt starter.
                </p>
                <button
                  onClick={dismissFirstRunNudge}
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

        <HFChatSideRail
          dynastyMode={dynastyMode}
          onToggleDynastyMode={() => setDynastyMode((prev) => !prev)}
          setInput={setInput}
          rewardPoints={rewardPoints}
          privacyShieldEnabled={privacyShieldEnabled}
          onTogglePrivacyShield={() => setPrivacyShieldEnabled((prev) => !prev)}
          filteredCommunityFeed={filteredCommunityFeed}
        />
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
