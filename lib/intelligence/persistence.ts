import {
  IntelligenceAlert,
  IntelligenceStorageMode,
  IntelligenceStorageStatus,
  WatchlistAssetType,
  WatchlistItem,
} from "@/lib/intelligence/types";

type MemoryStore = {
  watchlists: Map<string, WatchlistItem[]>;
  alerts: Map<string, IntelligenceAlert[]>;
  lastError?: string;
};

function getMemoryStore(): MemoryStore {
  const globalRef = globalThis as typeof globalThis & {
    __TRADEHAX_INTELLIGENCE_MEMORY_STORE__?: MemoryStore;
  };

  if (!globalRef.__TRADEHAX_INTELLIGENCE_MEMORY_STORE__) {
    globalRef.__TRADEHAX_INTELLIGENCE_MEMORY_STORE__ = {
      watchlists: new Map(),
      alerts: new Map(),
    };
  }
  return globalRef.__TRADEHAX_INTELLIGENCE_MEMORY_STORE__;
}

type SupabaseConfig = {
  baseUrl: string;
  serviceKey: string;
  watchlistTable: string;
  alertsTable: string;
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeUserId(userId: string) {
  return userId.trim().toLowerCase().slice(0, 64);
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase().replace(/[^A-Z0-9/_.\-]/g, "").slice(0, 24);
}

function resolveStorageMode(): IntelligenceStorageMode {
  const raw = String(process.env.TRADEHAX_INTELLIGENCE_STORAGE || "").trim().toLowerCase();
  if (raw === "memory" || raw === "supabase") {
    return raw as IntelligenceStorageMode;
  }
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "supabase";
  }
  return "memory";
}

function getSupabaseConfig(): SupabaseConfig | null {
  const baseUrl = String(process.env.SUPABASE_URL || "").trim();
  const serviceKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!baseUrl || !serviceKey) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    serviceKey,
    watchlistTable: String(
      process.env.TRADEHAX_SUPABASE_WATCHLIST_TABLE || "tradehax_watchlist_items",
    ).trim(),
    alertsTable: String(
      process.env.TRADEHAX_SUPABASE_ALERTS_TABLE || "tradehax_intelligence_alerts",
    ).trim(),
  };
}

function getStorageConfig() {
  const supabase = getSupabaseConfig();
  const mode = resolveStorageMode();
  return {
    mode,
    supabase,
    shouldUseSupabase: mode === "supabase" && Boolean(supabase),
  };
}

function memoryListWatchlist(userId: string) {
  const store = getMemoryStore();
  const normalizedUserId = normalizeUserId(userId);
  const list = store.watchlists.get(normalizedUserId) || [];
  return list.slice().sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

function memoryUpsertWatchlist(item: WatchlistItem) {
  const store = getMemoryStore();
  const key = normalizeUserId(item.userId);
  const list = store.watchlists.get(key) || [];
  const index = list.findIndex(
    (entry) => entry.symbol === item.symbol && entry.assetType === item.assetType,
  );
  if (index >= 0) {
    list[index] = item;
  } else {
    list.unshift(item);
  }
  store.watchlists.set(key, list);
  return item;
}

function memoryDeleteWatchlist(userId: string, symbol: string, assetType?: WatchlistAssetType) {
  const store = getMemoryStore();
  const key = normalizeUserId(userId);
  const list = store.watchlists.get(key) || [];
  const normalizedSymbol = normalizeSymbol(symbol);
  const filtered = list.filter((entry) => {
    if (entry.symbol !== normalizedSymbol) return true;
    if (assetType && entry.assetType !== assetType) return true;
    return false;
  });
  store.watchlists.set(key, filtered);
  return Math.max(0, list.length - filtered.length);
}

function memoryListAlerts(userId: string, limit = 60) {
  const store = getMemoryStore();
  const key = normalizeUserId(userId);
  const safeLimit = Math.min(200, Math.max(1, Math.floor(limit)));
  const list = store.alerts.get(key) || [];
  return list
    .slice()
    .sort((a, b) => Date.parse(b.triggeredAt) - Date.parse(a.triggeredAt))
    .slice(0, safeLimit);
}

function memoryInsertAlerts(alerts: IntelligenceAlert[]) {
  if (alerts.length === 0) return;
  const store = getMemoryStore();
  const grouped = new Map<string, IntelligenceAlert[]>();
  for (const alert of alerts) {
    const key = normalizeUserId(alert.userId);
    const existing = grouped.get(key) || [];
    existing.push(alert);
    grouped.set(key, existing);
  }

  for (const [userId, incoming] of grouped.entries()) {
    const existing = store.alerts.get(userId) || [];
    const merged = [...incoming, ...existing];
    const deduped = new Map<string, IntelligenceAlert>();
    for (const alert of merged) {
      if (!deduped.has(alert.id)) {
        deduped.set(alert.id, alert);
      }
    }
    const finalList = Array.from(deduped.values())
      .sort((a, b) => Date.parse(b.triggeredAt) - Date.parse(a.triggeredAt))
      .slice(0, 1_000);
    store.alerts.set(userId, finalList);
  }
}

function memoryMarkAlertsDelivered(userId: string, alertIds: string[], deliveredAt: string) {
  if (alertIds.length === 0) return;
  const store = getMemoryStore();
  const key = normalizeUserId(userId);
  const set = new Set(alertIds);
  const list = store.alerts.get(key) || [];
  for (const alert of list) {
    if (set.has(alert.id)) {
      alert.deliveredToDiscordAt = deliveredAt;
    }
  }
  store.alerts.set(key, list);
}

let lastSupabaseError = "";

function rememberSupabaseError(message: string) {
  lastSupabaseError = message.slice(0, 600);
  getMemoryStore().lastError = lastSupabaseError;
}

function getSupabaseHeaders(config: SupabaseConfig, extraHeaders?: HeadersInit) {
  return {
    apikey: config.serviceKey,
    Authorization: `Bearer ${config.serviceKey}`,
    "Content-Type": "application/json",
    ...(extraHeaders || {}),
  };
}

async function requestSupabaseJson<T>(
  config: SupabaseConfig,
  path: string,
  init: RequestInit = {},
  timeoutMs = 8_000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${config.baseUrl}/rest/v1/${path}`;

  try {
    const response = await fetch(url, {
      ...init,
      headers: getSupabaseHeaders(config, init.headers),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase ${response.status}: ${text.slice(0, 220)}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    const text = await response.text();
    if (!text) {
      return null as T;
    }
    return JSON.parse(text) as T;
  } catch (error) {
    rememberSupabaseError(error instanceof Error ? error.message : "Supabase request failed.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function mapIncomingWatchlistRow(row: Record<string, unknown>): WatchlistItem {
  return {
    id: String(row.id || ""),
    userId: String(row.userId || ""),
    symbol: String(row.symbol || ""),
    assetType: row.assetType === "crypto" ? "crypto" : "equity",
    minFlowPremiumUsd:
      typeof row.minFlowPremiumUsd === "number" ? row.minFlowPremiumUsd : undefined,
    minDarkPoolNotionalUsd:
      typeof row.minDarkPoolNotionalUsd === "number" ? row.minDarkPoolNotionalUsd : undefined,
    minCryptoNotionalUsd:
      typeof row.minCryptoNotionalUsd === "number" ? row.minCryptoNotionalUsd : undefined,
    minUnusualScore: typeof row.minUnusualScore === "number" ? row.minUnusualScore : undefined,
    minConfidence: typeof row.minConfidence === "number" ? row.minConfidence : undefined,
    notes: typeof row.notes === "string" ? row.notes : "",
    active: row.active !== false,
    createdAt: String(row.createdAt || nowIso()),
    updatedAt: String(row.updatedAt || nowIso()),
  };
}

function mapIncomingAlertRow(row: Record<string, unknown>): IntelligenceAlert {
  return {
    id: String(row.id || ""),
    userId: String(row.userId || ""),
    symbol: String(row.symbol || ""),
    assetType: row.assetType === "crypto" ? "crypto" : "equity",
    source:
      row.source === "flow" ||
      row.source === "dark_pool" ||
      row.source === "crypto" ||
      row.source === "news"
        ? row.source
        : "news",
    severity: row.severity === "urgent" || row.severity === "watch" ? row.severity : "info",
    title: String(row.title || ""),
    summary: String(row.summary || ""),
    triggeredAt: String(row.triggeredAt || nowIso()),
    route: String(row.route || "/intelligence"),
    referenceId: typeof row.referenceId === "string" ? row.referenceId : undefined,
    deliveredToDiscordAt:
      typeof row.deliveredToDiscordAt === "string" ? row.deliveredToDiscordAt : null,
  };
}

function encodeEq(value: string) {
  return `eq.${encodeURIComponent(value)}`;
}

export async function getIntelligenceStorageStatus(): Promise<IntelligenceStorageStatus> {
  const config = getStorageConfig();
  return {
    mode: config.shouldUseSupabase ? "supabase" : "memory",
    configured: Boolean(config.supabase),
    watchlistTable: config.supabase?.watchlistTable || "memory_watchlists",
    alertsTable: config.supabase?.alertsTable || "memory_alerts",
    generatedAt: nowIso(),
    fallbackActive: config.mode === "supabase" && !config.shouldUseSupabase,
    lastError: lastSupabaseError || getMemoryStore().lastError,
  };
}

export async function listPersistedWatchlistItems(userId: string) {
  const normalizedUserId = normalizeUserId(userId);
  const config = getStorageConfig();
  if (!config.shouldUseSupabase || !config.supabase) {
    return memoryListWatchlist(normalizedUserId);
  }

  try {
    const rows = await requestSupabaseJson<Record<string, unknown>[]>(
      config.supabase,
      `${config.supabase.watchlistTable}?userId=${encodeEq(normalizedUserId)}&order=updatedAt.desc`,
      { method: "GET" },
    );
    return (rows || []).map((row) => mapIncomingWatchlistRow(row));
  } catch {
    return memoryListWatchlist(normalizedUserId);
  }
}

export async function upsertPersistedWatchlistItem(item: WatchlistItem) {
  const normalizedItem: WatchlistItem = {
    ...item,
    userId: normalizeUserId(item.userId),
    symbol: normalizeSymbol(item.symbol),
  };
  const config = getStorageConfig();
  if (!config.shouldUseSupabase || !config.supabase) {
    return memoryUpsertWatchlist(normalizedItem);
  }

  try {
    const rows = await requestSupabaseJson<Record<string, unknown>[]>(
      config.supabase,
      `${config.supabase.watchlistTable}?on_conflict=userId,symbol,assetType`,
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify([normalizedItem]),
      },
    );
    if (Array.isArray(rows) && rows[0]) {
      return mapIncomingWatchlistRow(rows[0]);
    }
  } catch {
    // fallback below
  }

  return memoryUpsertWatchlist(normalizedItem);
}

export async function deletePersistedWatchlistItem(
  userId: string,
  symbol: string,
  assetType?: WatchlistAssetType,
) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedSymbol = normalizeSymbol(symbol);
  const config = getStorageConfig();

  if (!config.shouldUseSupabase || !config.supabase) {
    return memoryDeleteWatchlist(normalizedUserId, normalizedSymbol, assetType);
  }

  try {
    let path =
      `${config.supabase.watchlistTable}?userId=${encodeEq(normalizedUserId)}` +
      `&symbol=${encodeEq(normalizedSymbol)}`;
    if (assetType) {
      path += `&assetType=${encodeEq(assetType)}`;
    }
    await requestSupabaseJson<unknown>(config.supabase, path, { method: "DELETE" });
    return 1;
  } catch {
    return memoryDeleteWatchlist(normalizedUserId, normalizedSymbol, assetType);
  }
}

export async function listPersistedAlerts(userId: string, limit = 60) {
  const normalizedUserId = normalizeUserId(userId);
  const safeLimit = Math.min(200, Math.max(1, Math.floor(limit)));
  const config = getStorageConfig();
  if (!config.shouldUseSupabase || !config.supabase) {
    return memoryListAlerts(normalizedUserId, safeLimit);
  }

  try {
    const rows = await requestSupabaseJson<Record<string, unknown>[]>(
      config.supabase,
      `${config.supabase.alertsTable}?userId=${encodeEq(normalizedUserId)}` +
        `&order=triggeredAt.desc&limit=${safeLimit}`,
      { method: "GET" },
    );
    return (rows || []).map((row) => mapIncomingAlertRow(row));
  } catch {
    return memoryListAlerts(normalizedUserId, safeLimit);
  }
}

export async function insertPersistedAlerts(alerts: IntelligenceAlert[]) {
  if (alerts.length === 0) return;
  const config = getStorageConfig();
  if (!config.shouldUseSupabase || !config.supabase) {
    memoryInsertAlerts(alerts);
    return;
  }

  try {
    await requestSupabaseJson<unknown>(
      config.supabase,
      `${config.supabase.alertsTable}?on_conflict=id`,
      {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(alerts),
      },
    );
  } catch {
    memoryInsertAlerts(alerts);
    return;
  }

  memoryInsertAlerts(alerts);
}

export async function markPersistedAlertsDelivered(
  userId: string,
  alertIds: string[],
  deliveredAt: string,
) {
  if (alertIds.length === 0) return;
  const normalizedUserId = normalizeUserId(userId);
  const config = getStorageConfig();

  if (config.shouldUseSupabase && config.supabase) {
    try {
      const normalizedIds = alertIds
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
        .map((id) => encodeURIComponent(id));

      if (normalizedIds.length > 0) {
        await requestSupabaseJson<unknown>(
          config.supabase,
          `${config.supabase.alertsTable}?userId=${encodeEq(normalizedUserId)}` +
            `&id=in.(${normalizedIds.join(",")})`,
          {
            method: "PATCH",
            body: JSON.stringify({ deliveredToDiscordAt: deliveredAt }),
          },
        );
      }
    } catch {
      // memory fallback below
    }
  }

  memoryMarkAlertsDelivered(normalizedUserId, alertIds, deliveredAt);
}
