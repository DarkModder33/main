import React, { useEffect, useMemo, useState } from "react";
import GamifiedOnboarding from "./components/GamifiedOnboarding";
import OpportunityScannerCard from "./features/scanner/OpportunityScannerCard.jsx";
import { apiClient, userProfileStorage } from "./lib/api-client";

const COLORS = {
  bg: "#06111B",
  bgAlt: "#0A1725",
  panel: "#0F1D2E",
  panelSoft: "#112338",
  border: "#1C3350",
  accent: "#22C8FF",
  accentSoft: "rgba(34, 200, 255, 0.14)",
  success: "#00D68F",
  warning: "#FFB020",
  danger: "#FF5C7A",
  text: "#E7F1FD",
  textDim: "#90A6C0",
};

const STARTER_PROMPTS = [
  "Give me a BTC execution plan for the next 24 hours.",
  "Summarize ETH risk, momentum, and invalidation levels.",
  "How should I size a swing trade with moderate risk tolerance?",
];

function createWelcomeMessage(profile) {
  const firstName = profile?.firstName || "Trader";
  const assetFocus = profile?.preferredAssets?.length ? profile.preferredAssets.join(", ") : "BTC, ETH, and SOL";

  return {
    id: `welcome-${Date.now()}`,
    role: "assistant",
    content: `Workspace ready. I will prioritize ${assetFocus} and tailor risk framing to your ${profile?.riskTolerance || "moderate"} profile.`,
    meta: {
      title: `Welcome, ${firstName}`,
      body: "Ask for a setup, risk plan, or market read and the console will return a structured execution brief.",
      bullets: [
        "Customer-safe public mode is active",
        "Session context is persisted for follow-up analysis",
        "Live market widgets use the same backend API surface as chat",
      ],
    },
  };
}

function MessageCard({ message }) {
  const isAssistant = message.role === "assistant";
  const meta = message.meta;

  return (
    <article
      style={{
        border: `1px solid ${isAssistant ? COLORS.border : "rgba(34, 200, 255, 0.3)"}`,
        background: isAssistant ? COLORS.panel : COLORS.accentSoft,
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <strong style={{ color: isAssistant ? COLORS.text : COLORS.accent }}>{isAssistant ? "TradeHax Copilot" : "You"}</strong>
        <span style={{ color: COLORS.textDim, fontSize: 12 }}>{message.timestampLabel}</span>
      </div>
      {meta?.title ? <div style={{ color: COLORS.accent, fontWeight: 700, marginBottom: 8 }}>{meta.title}</div> : null}
      <div style={{ color: COLORS.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{meta?.body || message.content}</div>
      {meta?.marketContext ? <div style={{ color: COLORS.textDim, fontSize: 13, marginTop: 10 }}>Market context: {meta.marketContext}</div> : null}
      {meta?.bullets?.length ? (
        <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: COLORS.textDim, display: "grid", gap: 8 }}>
          {meta.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
      {meta?.executionPlaybook?.length ? (
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {meta.executionPlaybook.map((item) => (
            <div key={item} style={{ borderRadius: 12, background: COLORS.bgAlt, border: `1px solid ${COLORS.border}`, padding: 12, color: COLORS.text }}>
              {item}
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function MarketCard({ symbol, data }) {
  const change = data?.priceChangePercent24h ?? 0;
  const positive = change >= 0;

  return (
    <div
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 18,
        padding: 16,
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{symbol}</strong>
        <span style={{ color: positive ? COLORS.success : COLORS.danger, fontWeight: 700 }}>
          {positive ? "+" : ""}
          {change.toFixed(2)}%
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{data ? apiClient.formatPrice(data.price) : "--"}</div>
      <div style={{ color: COLORS.textDim, fontSize: 13 }}>
        Volume {data?.volume24h ? `$${Math.round(data.volume24h).toLocaleString("en-US")}` : "loading"} | High {data?.high24h ? apiClient.formatPrice(data.high24h) : "--"}
      </div>
    </div>
  );
}

  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("onboardingComplete"));
  const [messages, setMessages] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState("");
  const [marketData, setMarketData] = useState({});
  const [providerStatus, setProviderStatus] = useState(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");

  const focusAssets = useMemo(() => profile?.preferredAssets?.slice(0, 3) || ["BTC", "ETH", "SOL"], [profile]);

  // Load profile on mount
  useEffect(() => {
    let active = true;
    async function fetchProfile() {
      const loaded = await userProfileStorage.load();
      if (active) {
        setProfile(loaded);
        setMessages([withTimestamp(createWelcomeMessage(loaded))]);
      }
    }
    fetchProfile();
    return () => {
      active = false;
    };
  }, []);

  // Reload market data when focusAssets changes
  useEffect(() => {
    let active = true;
    async function loadMarketData() {
      setMarketLoading(true);
      setMarketError("");
      try {
        const response = await apiClient.getMultipleCrypto(focusAssets);
        if (!active) return;
        setMarketData(response);
      } catch (error) {
        if (!active) return;
        setMarketError(error instanceof Error ? error.message : "Failed to load market data");
      } finally {
        if (active) {
          setMarketLoading(false);
        }
      }
    }
    loadMarketData();
    return () => {
      active = false;
    };
  }, [focusAssets]);

  async function handleOnboardingComplete(nextProfile) {
    // Always reload profile from storage (in case backend updated fields)
    const loaded = await userProfileStorage.load();
    setProfile(loaded);
    setShowOnboarding(false);
    setMessages([withTimestamp(createWelcomeMessage(loaded))]);
  }

  // Profile modal handlers
  function handleOpenProfile() {
    setShowProfileModal(true);
  }
  function handleCloseProfile() {
    setShowProfileModal(false);
  }
  async function handleProfileSave(editedProfile) {
    await userProfileStorage.save(editedProfile);
    const loaded = await userProfileStorage.load();
    setProfile(loaded);
    setShowProfileModal(false);
  }

  async function submitMessage(rawPrompt) {
    const prompt = (rawPrompt ?? input).trim();
    if (!prompt || loading) return;

    const userMessage = withTimestamp({
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
    });

    const priorMessages = messages.slice(-6).map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await apiClient.chat([...priorMessages, { role: "user", content: prompt }], {
        userProfile: profile || undefined,
      });

      const parsed = apiClient.parseAIResponse(response.response);
      const bullets = [...(parsed.reasoning || []), ...(parsed.riskManagement || [])].filter(Boolean);

      setProviderStatus(response.providerStatus || null);
      setFallbackMode(Boolean(response.fallbackMode));
      setErrorDetail(response.errorDetail || "");
      setMessages((prev) => [
        ...prev,
        withTimestamp({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.response,
          meta: {
            title: parsed.signal || "Execution Brief",
            body: response.response,
            bullets,
            executionPlaybook: parsed.executionPlaybook || [],
            marketContext: parsed.marketContext || "",
          },
        }),
      ]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown AI service error";
      setFallbackMode(true);
      setErrorDetail(detail);
      setMessages((prev) => [
        ...prev,
        withTimestamp({
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: detail,
          meta: {
            title: "Request failed",
            body: "The backend rejected the request. The UI stayed online, but the AI response could not be generated.",
            bullets: [detail],
          },
        }),
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (showOnboarding) {
    return <GamifiedOnboarding onComplete={handleOnboardingComplete} />;
  }

  // Wait for profile to load before rendering main UI
  if (!profile) {
    return <div style={{ color: COLORS.text, padding: 40 }}>Loading profile...</div>;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(34, 200, 255, 0.16), transparent 28%), linear-gradient(180deg, #06111B 0%, #040A12 100%)",
        color: COLORS.text,
        fontFamily: '"Segoe UI", system-ui, sans-serif',
      }}
    >
      <section style={{ maxWidth: 1260, margin: "0 auto", padding: "28px 20px 56px" }}>
        <header
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(320px, 0.75fr)",
            gap: 18,
            marginBottom: 22,
          }}
        >
          <div style={{ background: "rgba(15, 29, 46, 0.88)", border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 28 }}>
            <div style={{ color: COLORS.accent, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" }}>TradeHax Neural Console</div>
            <h1 style={{ margin: "14px 0 10px", fontSize: 42, lineHeight: 1.05 }}>
              Professional-grade market intelligence, onboarding, and execution guidance.
            </h1>
            <p style={{ margin: 0, maxWidth: 720, color: COLORS.textDim, lineHeight: 1.7 }}>
              The frontend is now wired to live backend routes for sessions, chat, crypto data, and unusual-signal scanning. Customer onboarding persists a usable profile,
              and the main workspace remains online even when providers degrade.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitMessage(prompt)}
                  style={{
                    background: COLORS.accentSoft,
                    color: COLORS.accent,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 999,
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

           <aside style={{ background: "rgba(15, 29, 46, 0.88)", border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 24, display: "grid", gap: 14 }}>
             <div>
               <div style={{ color: COLORS.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em" }}>Customer profile</div>
               <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{profile?.firstName || "Trader"}</div>
             </div>
             <StatRow label="Risk mode" value={profile?.riskTolerance || "moderate"} />
             <StatRow label="Trading style" value={profile?.tradingStyle || "swing"} />
             <StatRow label="Goal" value={profile?.goal || "Execution-ready market planning"} />
             <StatRow label="Asset focus" value={focusAssets.join(", ")} />
             <button
               type="button"
               onClick={handleOpenProfile}
               style={{ marginTop: 18, borderRadius: 10, border: `1px solid ${COLORS.accent}`, background: COLORS.bgAlt, color: COLORS.accent, padding: "10px 16px", fontWeight: 600, cursor: "pointer" }}
             >
               Profile
             </button>
           </aside>
                      {showProfileModal && (
                        <ProfileModal
                          profile={profile}
                          onClose={handleCloseProfile}
                          onSave={handleProfileSave}
                        />
                      )}
                // Simple profile review/edit modal
                function ProfileModal({ profile, onClose, onSave }) {
                  const [form, setForm] = useState({ ...profile });
                  function handleChange(e) {
                    const { name, value } = e.target;
                    setForm((prev) => ({ ...prev, [name]: value }));
                  }
                  function handleAssetChange(e) {
                    setForm((prev) => ({ ...prev, preferredAssets: e.target.value.split(",").map((a) => a.trim()).filter(Boolean) }));
                  }
                  function handleSubmit(e) {
                    e.preventDefault();
                    onSave(form);
                  }
                  return (
                    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <form onSubmit={handleSubmit} style={{ background: "#101D31", color: "#E6F1FF", borderRadius: 18, padding: 36, minWidth: 340, boxShadow: "0 8px 40px #000a" }}>
                        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 18 }}>Edit Profile</h2>
                        <label style={{ display: "block", marginBottom: 10 }}>
                          First Name
                          <input name="firstName" value={form.firstName || ""} onChange={handleChange} style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #1C3350", background: "#12161E", color: "#E6F1FF" }} />
                        </label>
                        <label style={{ display: "block", marginBottom: 10 }}>
                          Risk Tolerance
                          <select name="riskTolerance" value={form.riskTolerance || "moderate"} onChange={handleChange} style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #1C3350", background: "#12161E", color: "#E6F1FF" }}>
                            <option value="conservative">Conservative</option>
                            <option value="moderate">Moderate</option>
                            <option value="aggressive">Aggressive</option>
                          </select>
                        </label>
                        <label style={{ display: "block", marginBottom: 10 }}>
                          Trading Style
                          <select name="tradingStyle" value={form.tradingStyle || "swing"} onChange={handleChange} style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #1C3350", background: "#12161E", color: "#E6F1FF" }}>
                            <option value="scalp">Scalp</option>
                            <option value="swing">Swing</option>
                            <option value="position">Position</option>
                          </select>
                        </label>
                        <label style={{ display: "block", marginBottom: 10 }}>
                          Portfolio Value
                          <input name="portfolioValue" type="number" value={form.portfolioValue || ""} onChange={handleChange} style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #1C3350", background: "#12161E", color: "#E6F1FF" }} />
                        </label>
                        <label style={{ display: "block", marginBottom: 10 }}>
                          Preferred Assets (comma separated)
                          <input name="preferredAssets" value={form.preferredAssets?.join(", ") || ""} onChange={handleAssetChange} style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #1C3350", background: "#12161E", color: "#E6F1FF" }} />
                        </label>
                        <label style={{ display: "block", marginBottom: 10 }}>
                          Goal
                          <input name="goal" value={form.goal || ""} onChange={handleChange} style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #1C3350", background: "#12161E", color: "#E6F1FF" }} />
                        </label>
                        <label style={{ display: "block", marginBottom: 18 }}>
                          Persona
                          <input name="persona" value={form.persona || ""} onChange={handleChange} style={{ width: "100%", marginTop: 4, padding: 8, borderRadius: 6, border: "1px solid #1C3350", background: "#12161E", color: "#E6F1FF" }} />
                        </label>
                        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                          <button type="submit" style={{ background: '#00D9FF', color: '#090B10', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Save</button>
                          <button type="button" onClick={onClose} style={{ background: 'transparent', color: '#E6F1FF', border: '1px solid #1C3350', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  );
                }
        </header>

        {(providerStatus || fallbackMode || errorDetail) && (
          <section
            style={{
              background: fallbackMode ? "rgba(255, 92, 122, 0.12)" : COLORS.panel,
              border: `1px solid ${fallbackMode ? "rgba(255, 92, 122, 0.34)" : COLORS.border}`,
              borderRadius: 20,
              padding: 16,
              display: "grid",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <strong style={{ color: fallbackMode ? COLORS.danger : COLORS.accent }}>Provider health</strong>
            <span style={{ color: COLORS.textDim }}>
              HuggingFace: {providerStatus?.huggingface ? "Healthy" : "Degraded"} | OpenAI: {providerStatus?.openai ? "Healthy" : "Degraded"} | Fallback mode:{" "}
              {fallbackMode ? "On" : "Off"}
            </span>
            {errorDetail ? <span style={{ color: COLORS.textDim }}>Latest backend detail: {errorDetail}</span> : null}
          </section>
        )}

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginBottom: 20 }}>
          {focusAssets.map((symbol) => (
            <MarketCard key={symbol} symbol={symbol} data={marketData[symbol]} />
          ))}
        </section>

        {marketLoading ? <div style={{ color: COLORS.textDim, marginBottom: 20 }}>Loading live market data...</div> : null}
        {marketError ? <div style={{ color: COLORS.danger, marginBottom: 20 }}>Market widget error: {marketError}</div> : null}

        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)", gap: 20 }}>
          <div style={{ background: "rgba(15, 29, 46, 0.88)", border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 22, display: "grid", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 26 }}>Execution Console</h2>
                <p style={{ margin: "8px 0 0", color: COLORS.textDim }}>Ask for trade plans, risk sizing, or concise market reads. Responses are normalized into a structured format.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                style={{ borderRadius: 12, border: `1px solid ${COLORS.border}`, background: COLORS.panelSoft, color: COLORS.text, padding: "12px 14px", cursor: "pointer" }}
              >
                Edit onboarding
              </button>
            </div>

            <div style={{ display: "grid", gap: 14, maxHeight: 680, overflowY: "auto", paddingRight: 4 }}>
              {messages.map((message) => (
                <MessageCard key={message.id} message={message} />
              ))}
            </div>

            <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 16, background: COLORS.bgAlt }}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask for a BTC trade plan, ETH risk map, portfolio sizing guidance, or a session recap."
                style={{
                  width: "100%",
                  minHeight: 120,
                  resize: "vertical",
                  background: "transparent",
                  border: "none",
                  color: COLORS.text,
                  fontSize: 15,
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 12 }}>
                <span style={{ color: COLORS.textDim, fontSize: 13 }}>Public-safe frontend mode. Backend session context is attached automatically.</span>
                <button
                  type="button"
                  onClick={() => submitMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    border: "none",
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #22C8FF 0%, #0A84FF 100%)",
                    color: "#04111F",
                    padding: "12px 18px",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading || !input.trim() ? 0.5 : 1,
                  }}
                >
                  {loading ? "Generating..." : "Generate brief"}
                </button>
              </div>
            </div>
          </div>

          <aside style={{ display: "grid", gap: 18 }}>
            <div style={{ background: "rgba(15, 29, 46, 0.88)", border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 22 }}>
              <h3 style={{ marginTop: 0, fontSize: 22 }}>Operating checklist</h3>
              <div style={{ display: "grid", gap: 14 }}>
                <ChecklistItem title="Frontend onboarding persisted" status="Complete" color={COLORS.success} />
                <ChecklistItem title="Chat wired to session API" status="Live" color={COLORS.accent} />
                <ChecklistItem title="Public production auth flow" status="Updated" color={COLORS.warning} />
              </div>
            </div>
            <OpportunityScannerCard />
          </aside>
        </section>
      </section>
    </main>
  );
}

function withTimestamp(message) {
  return {
    ...message,
    timestampLabel: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  };
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: "grid", gap: 6, padding: "12px 14px", borderRadius: 16, border: `1px solid ${COLORS.border}`, background: COLORS.panelSoft }}>
      <span style={{ color: COLORS.textDim, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</span>
      <strong style={{ lineHeight: 1.4 }}>{value}</strong>
    </div>
  );
}

function ChecklistItem({ title, status, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, background: COLORS.panelSoft, border: `1px solid ${COLORS.border}` }}>
      <span>{title}</span>
      <span style={{ color, fontWeight: 700 }}>{status}</span>
    </div>
  );
}
