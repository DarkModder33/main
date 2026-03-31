import React, { useEffect, useState } from "react";
import { apiClient } from "../../lib/api-client";

const CARD_COLORS = {
  border: "#1C2333",
  panel: "#12161E",
  text: "#C8D8E8",
  dim: "#8EA2B8",
  accent: "#00D9FF",
  green: "#00E5A0",
  amber: "#F5A623",
};

export default function OpportunityScannerCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function refresh() {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.getUnusualSignals();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scanner request failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const top = data?.opportunities?.slice(0, 3) || [];

  // Accessibility: add ARIA roles and labels
  return (
    <div
      role="region"
      aria-label="Unusual Signal Scanner"
      style={{
        marginTop: 16,
        border: `1px solid ${CARD_COLORS.border}`,
        borderRadius: 12,
        background: CARD_COLORS.panel,
        padding: 12,
        WebkitBorderRadius: 12,
        WebkitBackgroundClip: 'padding-box',
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <div style={{ color: CARD_COLORS.text, fontWeight: 700, fontSize: 18 }} id="scanner-title">Unusual Signal Scanner</div>
          <div style={{ color: CARD_COLORS.dim, fontSize: 12 }}>
            Ranked crypto anomalies by flow + volatility pressure
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh Scanner"
          aria-busy={loading}
          aria-describedby="scanner-title"
          style={{
            border: `1px solid ${CARD_COLORS.accent}55`,
            background: "transparent",
            color: CARD_COLORS.accent,
            borderRadius: 8,
            WebkitBorderRadius: 8,
            padding: "12px 16px",
            minHeight: 48,
            minWidth: 48,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {loading ? <span aria-live="polite">Scanning...</span> : "Refresh"}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div role="alert" style={{ color: "#ff6b6b", marginTop: 10, fontSize: 13 }}>Scanner error: {error}</div>
      )}

      {/* Empty State */}
      {!error && !top.length && !loading && (
        <div style={{ color: CARD_COLORS.dim, marginTop: 10, fontSize: 13 }}>No elevated opportunities right now.</div>
      )}

      {/* Main Content */}
      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
        {data?.regime?.label && (
          <div style={{ color: CARD_COLORS.dim, fontSize: 12 }}>
            Regime: {data.regime.label} | Scanned: {data.totalScanned} | Flagged: {data.totalFlagged}
          </div>
        )}

        {top.map((item) => (
          <div
            key={item.symbol}
            tabIndex={0}
            role="listitem"
            aria-label={`Market ${item.symbol}, Signal ${item.signalLabel}, Score ${item.score}`}
            style={{
              border: `1px solid ${CARD_COLORS.border}`,
              borderRadius: 10,
              WebkitBorderRadius: 10,
              padding: 16,
              background: "#0E1117",
              WebkitBackgroundClip: 'padding-box',
              minHeight: 48,
              outline: 'none',
            }}
            onKeyDown={e => { if (e.key === 'Enter') { /* future: open details */ } }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ color: CARD_COLORS.text }}>{item.symbol}</strong>
              <span
                title={`Signal: ${item.signalLabel}\nScore: ${item.score}\nReliability: ${item.reliability}`}
                style={{
                  color: item.signalLabel === "HIGH" ? CARD_COLORS.green : CARD_COLORS.amber,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'help',
                }}
              >
                {item.signalLabel} | Score {item.score} | R {item.reliability}
              </span>
            </div>
            <div style={{ color: CARD_COLORS.dim, fontSize: 12, marginTop: 4 }}>
              {item.direction} | 24h {item.metrics.priceChangePct}% | Turnover {item.metrics.volumeToCapPct}%
            </div>
            <div style={{ color: CARD_COLORS.dim, fontSize: 12, marginTop: 4 }}>
              {item.strategyTag} | {item.horizon}
            </div>
            {item.reasons?.length ? (
              <div style={{ color: CARD_COLORS.text, fontSize: 12, marginTop: 6 }}>{item.reasons[0]}</div>
            ) : null}
            {/* Feedback button for analytics/AI improvement */}
            <button
              style={{ marginTop: 8, fontSize: 11, color: CARD_COLORS.accent, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              aria-label={`Give feedback on ${item.symbol}`}
              onClick={() => window.dispatchEvent(new CustomEvent('openFeedback', { detail: { symbol: item.symbol } }))}
            >
              Feedback
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
