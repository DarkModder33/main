"use client";

import { Copy, ExternalLink, LayoutDashboard, Link as LinkIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ChartInterval = "1" | "5" | "15" | "60" | "240" | "1D";
type DeskLayout = "single" | "dual" | "quad";

type DeskPreset = {
  id: string;
  name: string;
  symbol: string;
  interval: ChartInterval;
  layout: DeskLayout;
  favorite: boolean;
  updatedAt: number;
};

type HubBloombergTerminalDeskProps = {
  defaultSymbol?: string;
};

const INTERVAL_OPTIONS: Array<{ value: ChartInterval; label: string }> = [
  { value: "1", label: "1m" },
  { value: "5", label: "5m" },
  { value: "15", label: "15m" },
  { value: "60", label: "1h" },
  { value: "240", label: "4h" },
  { value: "1D", label: "1D" },
];

const LAYOUT_OPTIONS: Array<{ value: DeskLayout; label: string }> = [
  { value: "single", label: "1-Up" },
  { value: "dual", label: "2-Up" },
  { value: "quad", label: "4-Up" },
];

const DESK_PRESET_STORAGE_KEY = "tradehax_bloomberg_desk_presets_v1";

function normalizeSymbol(value: string) {
  return value.replace(/[^A-Z0-9:_/-]/gi, "").toUpperCase().slice(0, 24);
}

function parseQuoteFromPair(symbol: string) {
  const pair = symbol.split(":").pop() || "BTCUSDT";
  const knownQuotes = ["USDT", "USDC", "USD", "BTC", "ETH"];
  return knownQuotes.find((quote) => pair.endsWith(quote)) || "USDT";
}

function buildLayoutSymbols(primarySymbol: string, layout: DeskLayout) {
  const primary = normalizeSymbol(primarySymbol) || "BINANCE:BTCUSDT";
  if (layout === "single") return [primary];

  const quote = parseQuoteFromPair(primary);
  const baselineCandidates = [
    "BINANCE:BTCUSDT",
    "BINANCE:ETHUSDT",
    "BINANCE:SOLUSDT",
    `BINANCE:BTC${quote}`,
    `BINANCE:ETH${quote}`,
    `BINANCE:SOL${quote}`,
  ];

  const symbols = [primary, ...baselineCandidates]
    .map((value) => normalizeSymbol(value))
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);

  if (layout === "dual") return symbols.slice(0, 2);
  return symbols.slice(0, 4);
}

function buildTradingViewEmbedUrl(symbol: string, interval: ChartInterval) {
  const params = new URLSearchParams({
    symbol: symbol || "BINANCE:BTCUSDT",
    interval,
    theme: "dark",
    style: "1",
    locale: "en",
    timezone: "Etc/UTC",
    withdateranges: "1",
    hide_top_toolbar: "0",
    hide_legend: "0",
    saveimage: "1",
    hideideas: "1",
  });
  return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
}

function sortPresets(items: DeskPreset[]) {
  return [...items].sort((a, b) => {
    if (a.favorite !== b.favorite) {
      return a.favorite ? -1 : 1;
    }
    return b.updatedAt - a.updatedAt;
  });
}

export function HubBloombergTerminalDesk({ defaultSymbol = "BINANCE:BTCUSDT" }: HubBloombergTerminalDeskProps) {
  const [symbol, setSymbol] = useState(normalizeSymbol(defaultSymbol) || "BINANCE:BTCUSDT");
  const [interval, setInterval] = useState<ChartInterval>("60");
  const [layout, setLayout] = useState<DeskLayout>("single");
  const [presets, setPresets] = useState<DeskPreset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const symbolParam = normalizeSymbol(url.searchParams.get("tdSymbol") || "");
    const intervalParam = url.searchParams.get("tdInterval");
    const layoutParam = url.searchParams.get("tdLayout");

    if (symbolParam) {
      setSymbol(symbolParam);
    }
    if (intervalParam && INTERVAL_OPTIONS.some((option) => option.value === intervalParam)) {
      setInterval(intervalParam as ChartInterval);
    }
    if (layoutParam && LAYOUT_OPTIONS.some((option) => option.value === layoutParam)) {
      setLayout(layoutParam as DeskLayout);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DESK_PRESET_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Array<Partial<DeskPreset>>;
      if (!Array.isArray(parsed)) return;

      const hydrated = parsed
        .slice(0, 8)
        .map((item) => ({
          id: typeof item.id === "string" ? item.id : `desk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: String(item.name ?? "Desk Preset").slice(0, 24),
          symbol: normalizeSymbol(String(item.symbol ?? "BINANCE:BTCUSDT")) || "BINANCE:BTCUSDT",
          interval: INTERVAL_OPTIONS.some((option) => option.value === item.interval)
            ? (item.interval as ChartInterval)
            : "60",
          layout: LAYOUT_OPTIONS.some((option) => option.value === item.layout)
            ? (item.layout as DeskLayout)
            : "single",
          favorite: Boolean(item.favorite),
          updatedAt: typeof item.updatedAt === "number" ? item.updatedAt : Date.now(),
        }))
        .slice(0, 8);

      setPresets(sortPresets(hydrated));
    } catch {
      // ignore malformed local preset payload
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DESK_PRESET_STORAGE_KEY, JSON.stringify(presets.slice(0, 8)));
  }, [presets]);

  const tradingViewEmbedUrl = useMemo(
    () => buildTradingViewEmbedUrl(symbol || "BINANCE:BTCUSDT", interval),
    [symbol, interval],
  );

  const tradingViewShareUrl = useMemo(() => {
    const normalized = symbol || "BINANCE:BTCUSDT";
    return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(normalized)}`;
  }, [symbol]);

  const yahooShareUrl = useMemo(() => {
    const raw = (symbol || "BTCUSDT").split(":").pop() || "BTCUSDT";
    return `https://finance.yahoo.com/quote/${encodeURIComponent(raw)}`;
  }, [symbol]);

  const deskShareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.searchParams.set("tdSymbol", symbol || "BINANCE:BTCUSDT");
    url.searchParams.set("tdInterval", interval);
    url.searchParams.set("tdLayout", layout);
    return url.toString();
  }, [symbol, interval, layout]);

  const layoutSymbols = useMemo(() => buildLayoutSymbols(symbol, layout), [symbol, layout]);

  const chartHeightClass = layout === "quad" ? "h-[270px]" : "h-[420px]";
  const chartGridClass =
    layout === "single"
      ? "grid-cols-1"
      : layout === "dual"
        ? "grid-cols-1 lg:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2";

  async function copyShareLink(link: string) {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        setStatus("Share link copied.");
      } else {
        setStatus("Clipboard unavailable in this browser.");
      }
    } catch {
      setStatus("Could not copy link.");
    }
  }

  function saveCurrentPreset() {
    const safeName = presetName.trim().slice(0, 24) || `${symbol || "BINANCE:BTCUSDT"} • ${interval} • ${layout}`;
    const nextPreset: DeskPreset = {
      id: `desk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: safeName,
      symbol: symbol || "BINANCE:BTCUSDT",
      interval,
      layout,
      favorite: false,
      updatedAt: Date.now(),
    };

    setPresets((prev) => sortPresets([nextPreset, ...prev].slice(0, 8)));
    setPresetName("");
    setStatus(`Preset saved: ${safeName}`);
  }

  function applyPreset(preset: DeskPreset) {
    setSymbol(normalizeSymbol(preset.symbol) || "BINANCE:BTCUSDT");
    setInterval(preset.interval);
    setLayout(preset.layout);
    setPresets((prev) =>
      sortPresets(
        prev.map((item) => (item.id === preset.id ? { ...item, updatedAt: Date.now() } : item)),
      ),
    );
    setStatus(`Preset applied: ${preset.name}`);
  }

  function togglePresetFavorite(id: string) {
    setPresets((prev) =>
      sortPresets(
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                favorite: !item.favorite,
                updatedAt: Date.now(),
              }
            : item,
        ),
      ),
    );
    setStatus("Preset favorite updated.");
  }

  function removePreset(id: string) {
    setPresets((prev) => prev.filter((item) => item.id !== id));
    setStatus("Preset removed.");
  }

  return (
    <div className="rounded-xl border border-cyan-400/20 bg-[rgba(8,12,18,0.88)] p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-200">Bloomberg-Style Chart Desk</p>
        <span className="rounded-full border border-white/15 bg-black/40 px-2 py-0.5 text-[9px] uppercase text-zinc-300">
          Embeddable + Shareable
        </span>
      </div>

      <p className="mb-2 text-[10px] text-zinc-400">
        Terminal-inspired layout with commonly used embedded charts and one-click share links for collaboration.
      </p>

      <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <input
          value={symbol}
          onChange={(event) => setSymbol(normalizeSymbol(event.target.value))}
          className="rounded-md border border-white/15 bg-black/50 px-2 py-1 text-[11px] text-white outline-none focus:border-cyan-300/60"
          placeholder="e.g. BINANCE:BTCUSDT"
        />
        <select
          value={interval}
          onChange={(event) => setInterval(event.target.value as ChartInterval)}
          className="rounded-md border border-white/15 bg-black/50 px-2 py-1 text-[11px] text-white outline-none focus:border-cyan-300/60"
          title="Chart interval"
        >
          {INTERVAL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <a
          href={tradingViewShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 rounded-md border border-cyan-300/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase text-cyan-100"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open Full Chart
        </a>
      </div>

      <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap gap-1.5">
          {LAYOUT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLayout(option.value)}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${
                layout === option.value
                  ? "border-cyan-300/45 bg-cyan-500/15 text-cyan-100"
                  : "border-white/15 bg-black/40 text-zinc-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.set("tdSymbol", symbol || "BINANCE:BTCUSDT");
              url.searchParams.set("tdInterval", interval);
              url.searchParams.set("tdLayout", layout);
              window.history.replaceState({}, "", url.toString());
              setStatus("Desk state synced to URL.");
            }
          }}
          className="inline-flex items-center justify-center gap-1 rounded-md border border-cyan-300/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase text-cyan-100"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          Sync URL State
        </button>
      </div>

      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <button
          type="button"
          onClick={() => copyShareLink(tradingViewShareUrl)}
          className="inline-flex items-center justify-center gap-1 rounded-md border border-white/15 bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase text-zinc-200"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy TradingView Link
        </button>
        <button
          type="button"
          onClick={() => copyShareLink(yahooShareUrl)}
          className="inline-flex items-center justify-center gap-1 rounded-md border border-white/15 bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase text-zinc-200"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          Copy Yahoo Link
        </button>
      </div>

      <div className="mt-2 grid gap-2 md:grid-cols-1">
        <button
          type="button"
          onClick={() => copyShareLink(deskShareUrl || tradingViewShareUrl)}
          className="inline-flex items-center justify-center gap-1 rounded-md border border-fuchsia-300/25 bg-fuchsia-500/10 px-2 py-1 text-[10px] font-semibold uppercase text-fuchsia-100"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Desk Share URL
        </button>
      </div>

      <div className="mt-2 rounded-md border border-white/10 bg-black/35 p-2">
        <div className="mb-2 grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            value={presetName}
            onChange={(event) => setPresetName(event.target.value.slice(0, 24))}
            placeholder="Preset name (optional)"
            className="rounded-md border border-white/15 bg-black/50 px-2 py-1 text-[11px] text-white outline-none focus:border-cyan-300/60"
          />
          <button
            type="button"
            onClick={saveCurrentPreset}
            className="inline-flex items-center justify-center gap-1 rounded-md border border-emerald-300/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-100"
          >
            Save Preset
          </button>
        </div>

        {presets.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
                  preset.favorite
                    ? "border-amber-300/40 bg-amber-500/10"
                    : "border-white/15 bg-black/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => togglePresetFavorite(preset.id)}
                  className={`text-[10px] ${preset.favorite ? "text-amber-200" : "text-zinc-400"}`}
                  title={preset.favorite ? "Unpin favorite" : "Pin as favorite"}
                >
                  ★
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`text-[10px] font-semibold uppercase ${preset.favorite ? "text-amber-100" : "text-cyan-100"}`}
                  title={`${preset.symbol} • ${preset.interval} • ${preset.layout}`}
                >
                  {preset.name}
                </button>
                <button
                  type="button"
                  onClick={() => removePreset(preset.id)}
                  className="text-[9px] uppercase text-rose-200"
                  title="Remove preset"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-zinc-500">No desk presets yet. Save your favorite layouts for quick restore.</p>
        )}
      </div>

      <div className={`mt-2 grid gap-2 ${chartGridClass}`}>
        {layoutSymbols.map((item) => (
          <div key={`${item}-${interval}`} className="overflow-hidden rounded-lg border border-white/10 bg-black/35">
            <div className="border-b border-white/10 px-2 py-1 text-[10px] font-mono uppercase tracking-wide text-zinc-300">
              {item}
            </div>
            <iframe
              title={`TradingView ${item}`}
              src={item === symbol ? tradingViewEmbedUrl : buildTradingViewEmbedUrl(item, interval)}
              className={`${chartHeightClass} w-full`}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-white/10 bg-black/35 px-2 py-1.5 text-[10px] text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <LayoutDashboard className="h-3.5 w-3.5 text-cyan-300" />
          Chart source: TradingView widget embed
        </span>
        <span>{status || "Ready"}</span>
      </div>
    </div>
  );
}
