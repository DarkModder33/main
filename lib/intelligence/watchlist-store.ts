import { getIntelligenceSnapshot } from "@/lib/intelligence/provider";
import {
  IntelligenceAlert,
  WatchlistAssetType,
  WatchlistItem,
} from "@/lib/intelligence/types";

type WatchlistStore = {
  watchlists: Map<string, WatchlistItem[]>;
  alerts: Map<string, IntelligenceAlert[]>;
  dedupeKeys: Map<string, Map<string, number>>;
};

type UpsertWatchlistInput = {
  symbol: string;
  assetType?: WatchlistAssetType;
  minFlowPremiumUsd?: number;
  minDarkPoolNotionalUsd?: number;
  minCryptoNotionalUsd?: number;
  minUnusualScore?: number;
  minConfidence?: number;
  notes?: string;
  active?: boolean;
};

type EvaluateAlertsResult = {
  generatedAt: string;
  newAlerts: IntelligenceAlert[];
  alerts: IntelligenceAlert[];
};

function getStore(): WatchlistStore {
  const globalRef = globalThis as typeof globalThis & {
    __TRADEHAX_INTELLIGENCE_WATCHLIST__?: WatchlistStore;
  };

  if (!globalRef.__TRADEHAX_INTELLIGENCE_WATCHLIST__) {
    globalRef.__TRADEHAX_INTELLIGENCE_WATCHLIST__ = {
      watchlists: new Map(),
      alerts: new Map(),
      dedupeKeys: new Map(),
    };
  }

  return globalRef.__TRADEHAX_INTELLIGENCE_WATCHLIST__;
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeUserId(userId: string) {
  return userId.trim().toLowerCase().slice(0, 64);
}

function normalizeSymbol(symbol: string) {
  return symbol
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9/_.\-]/g, "")
    .slice(0, 24);
}

function normalizeNotes(notes: string | undefined) {
  if (!notes) return "";
  return notes.trim().slice(0, 180);
}

function normalizePositiveNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }
  return value;
}

function normalizeConfidence(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  if (value <= 0 || value > 1) return undefined;
  return value;
}

function getUserWatchlist(userId: string) {
  const key = normalizeUserId(userId);
  const store = getStore();
  if (!store.watchlists.has(key)) {
    store.watchlists.set(key, []);
  }
  return store.watchlists.get(key) ?? [];
}

function getUserAlerts(userId: string) {
  const key = normalizeUserId(userId);
  const store = getStore();
  if (!store.alerts.has(key)) {
    store.alerts.set(key, []);
  }
  return store.alerts.get(key) ?? [];
}

function getUserDedupeMap(userId: string) {
  const key = normalizeUserId(userId);
  const store = getStore();
  if (!store.dedupeKeys.has(key)) {
    store.dedupeKeys.set(key, new Map());
  }
  return store.dedupeKeys.get(key) ?? new Map<string, number>();
}

function createAlertId(prefix = "ialert") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function shouldCreateAlert(userId: string, dedupeKey: string, nowMs: number) {
  const map = getUserDedupeMap(userId);
  const existingTs = map.get(dedupeKey);
  const windowMs = 30 * 60_000;
  if (typeof existingTs === "number" && nowMs - existingTs < windowMs) {
    return false;
  }
  map.set(dedupeKey, nowMs);

  if (map.size > 2_000) {
    const sortedEntries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 1_500);
    map.clear();
    for (const [key, value] of sortedEntries) {
      map.set(key, value);
    }
  }

  return true;
}

function pushAlert(userId: string, alert: IntelligenceAlert) {
  const alerts = getUserAlerts(userId);
  alerts.unshift(alert);
  if (alerts.length > 600) {
    alerts.splice(600);
  }
}

export function listWatchlist(userId: string) {
  return getUserWatchlist(userId).slice().sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function upsertWatchlistItem(userId: string, input: UpsertWatchlistInput) {
  const symbol = normalizeSymbol(String(input.symbol || ""));
  if (!symbol) {
    return { ok: false as const, error: "Symbol is required." };
  }

  const assetType: WatchlistAssetType =
    input.assetType === "crypto" || symbol.includes("/") ? "crypto" : "equity";
  const normalizedUserId = normalizeUserId(userId);
  const items = getUserWatchlist(normalizedUserId);
  const existingIndex = items.findIndex(
    (item) => item.symbol === symbol && item.assetType === assetType,
  );

  const timestamp = nowIso();
  const base: WatchlistItem = {
    id: existingIndex >= 0 ? items[existingIndex].id : createAlertId("watch"),
    userId: normalizedUserId,
    symbol,
    assetType,
    minFlowPremiumUsd: normalizePositiveNumber(input.minFlowPremiumUsd),
    minDarkPoolNotionalUsd: normalizePositiveNumber(input.minDarkPoolNotionalUsd),
    minCryptoNotionalUsd: normalizePositiveNumber(input.minCryptoNotionalUsd),
    minUnusualScore: normalizePositiveNumber(input.minUnusualScore),
    minConfidence: normalizeConfidence(input.minConfidence),
    notes: normalizeNotes(input.notes),
    active: input.active !== false,
    createdAt: existingIndex >= 0 ? items[existingIndex].createdAt : timestamp,
    updatedAt: timestamp,
  };

  if (existingIndex >= 0) {
    items[existingIndex] = base;
  } else {
    items.unshift(base);
  }

  return { ok: true as const, item: base };
}

export function removeWatchlistItem(
  userId: string,
  symbol: string,
  assetType?: WatchlistAssetType,
) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedSymbol = normalizeSymbol(symbol);
  if (!normalizedSymbol) {
    return { ok: false as const, error: "Symbol is required." };
  }
  const items = getUserWatchlist(normalizedUserId);
  const before = items.length;

  const filtered = items.filter((item) => {
    if (item.symbol !== normalizedSymbol) return true;
    if (assetType && item.assetType !== assetType) return true;
    return false;
  });

  getStore().watchlists.set(normalizedUserId, filtered);
  return {
    ok: true as const,
    removed: Math.max(0, before - filtered.length),
  };
}

export function listAlerts(userId: string, limit = 60) {
  const safeLimit = Number.isFinite(limit) ? Math.min(200, Math.max(1, Math.floor(limit))) : 60;
  return getUserAlerts(userId)
    .slice()
    .sort((a, b) => Date.parse(b.triggeredAt) - Date.parse(a.triggeredAt))
    .slice(0, safeLimit);
}

export function markAlertsDeliveredToDiscord(userId: string, alertIds: string[], deliveredAt: string) {
  if (alertIds.length === 0) return;
  const alerts = getUserAlerts(userId);
  const set = new Set(alertIds);
  for (const alert of alerts) {
    if (set.has(alert.id)) {
      alert.deliveredToDiscordAt = deliveredAt;
    }
  }
}

export function evaluateWatchlistAlerts(userId: string): EvaluateAlertsResult {
  const normalizedUserId = normalizeUserId(userId);
  const watchlist = listWatchlist(normalizedUserId).filter((item) => item.active);
  const snapshot = getIntelligenceSnapshot();
  const nowMs = Date.now();
  const timestamp = new Date(nowMs).toISOString();
  const newAlerts: IntelligenceAlert[] = [];

  for (const item of watchlist) {
    if (item.assetType === "equity") {
      const minFlowPremium = item.minFlowPremiumUsd ?? 700_000;
      const minDarkPool = item.minDarkPoolNotionalUsd ?? 14_000_000;
      const minScore = item.minUnusualScore ?? 75;

      const flowMatches = snapshot.flowTape.filter(
        (trade) =>
          trade.symbol === item.symbol &&
          trade.premiumUsd >= minFlowPremium &&
          trade.unusualScore >= minScore,
      );
      for (const trade of flowMatches) {
        const key = `flow:${item.symbol}:${trade.id}`;
        if (!shouldCreateAlert(normalizedUserId, key, nowMs)) {
          continue;
        }
        const alert: IntelligenceAlert = {
          id: createAlertId(),
          userId: normalizedUserId,
          symbol: item.symbol,
          assetType: "equity",
          source: "flow",
          severity: trade.unusualScore >= 90 ? "urgent" : "watch",
          title: `${item.symbol} options flow spike`,
          summary: `${trade.side.toUpperCase()} premium $${trade.premiumUsd.toLocaleString()} with unusual score ${trade.unusualScore}.`,
          triggeredAt: timestamp,
          route: "/intelligence/flow",
          referenceId: trade.id,
          deliveredToDiscordAt: null,
        };
        pushAlert(normalizedUserId, alert);
        newAlerts.push(alert);
      }

      const darkPoolMatches = snapshot.darkPoolTape.filter(
        (trade) =>
          trade.symbol === item.symbol &&
          trade.notionalUsd >= minDarkPool &&
          trade.unusualScore >= minScore,
      );
      for (const trade of darkPoolMatches) {
        const key = `dark:${item.symbol}:${trade.id}`;
        if (!shouldCreateAlert(normalizedUserId, key, nowMs)) {
          continue;
        }
        const alert: IntelligenceAlert = {
          id: createAlertId(),
          userId: normalizedUserId,
          symbol: item.symbol,
          assetType: "equity",
          source: "dark_pool",
          severity: trade.notionalUsd >= minDarkPool * 2 ? "urgent" : "watch",
          title: `${item.symbol} dark pool print`,
          summary: `Block notional $${trade.notionalUsd.toLocaleString()} on ${trade.venue} (${trade.sideEstimate}).`,
          triggeredAt: timestamp,
          route: "/intelligence/dark-pool",
          referenceId: trade.id,
          deliveredToDiscordAt: null,
        };
        pushAlert(normalizedUserId, alert);
        newAlerts.push(alert);
      }

      const newsMatches = snapshot.news.filter(
        (news) => news.symbol === item.symbol && (news.impact === "high" || news.impact === "medium"),
      );
      for (const news of newsMatches) {
        const key = `news:${item.symbol}:${news.id}`;
        if (!shouldCreateAlert(normalizedUserId, key, nowMs)) {
          continue;
        }
        const alert: IntelligenceAlert = {
          id: createAlertId(),
          userId: normalizedUserId,
          symbol: item.symbol,
          assetType: "equity",
          source: "news",
          severity: news.impact === "high" ? "urgent" : "info",
          title: `${item.symbol} catalyst headline`,
          summary: news.title,
          triggeredAt: timestamp,
          route: "/intelligence/news",
          referenceId: news.id,
          deliveredToDiscordAt: null,
        };
        pushAlert(normalizedUserId, alert);
        newAlerts.push(alert);
      }
    } else {
      const minCryptoNotional = item.minCryptoNotionalUsd ?? 500_000;
      const minConfidence = item.minConfidence ?? 0.65;
      const minScore = item.minUnusualScore ?? 0;

      const matches = snapshot.cryptoTape.filter((trade) => {
        if (trade.pair !== item.symbol) return false;
        if (trade.notionalUsd < minCryptoNotional) return false;
        if (trade.confidence < minConfidence) return false;
        if (minScore > 0 && trade.confidence * 100 < minScore) return false;
        return true;
      });

      for (const trade of matches) {
        const key = `crypto:${item.symbol}:${trade.id}`;
        if (!shouldCreateAlert(normalizedUserId, key, nowMs)) {
          continue;
        }
        const alert: IntelligenceAlert = {
          id: createAlertId(),
          userId: normalizedUserId,
          symbol: item.symbol,
          assetType: "crypto",
          source: "crypto",
          severity: trade.confidence >= 0.82 ? "urgent" : "watch",
          title: `${item.symbol} crypto flow trigger`,
          summary: `${trade.side} notional $${trade.notionalUsd.toLocaleString()} on ${trade.exchange} with ${(trade.confidence * 100).toFixed(0)}% confidence.`,
          triggeredAt: timestamp,
          route: "/intelligence/crypto-flow",
          referenceId: trade.id,
          deliveredToDiscordAt: null,
        };
        pushAlert(normalizedUserId, alert);
        newAlerts.push(alert);
      }
    }
  }

  return {
    generatedAt: timestamp,
    newAlerts,
    alerts: listAlerts(normalizedUserId, 80),
  };
}
