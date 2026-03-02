import { sanitizePlainText } from "@/lib/security";
import type { ProbabilityDirection, ProbabilityPolicyProfile } from "@/lib/intelligence/probability-engine";
import { listResolvedProbabilityOutcomes } from "@/lib/intelligence/probability-calibration";

type PersistedPolicy = Exclude<ProbabilityPolicyProfile, "auto">;

type PolicyPreferenceRecord = {
  profileKey: string;
  policy: PersistedPolicy;
  updatedAt: string;
};

type PolicyDecisionRecord = {
  id: string;
  profileKey: string;
  requested: ProbabilityPolicyProfile;
  applied: PersistedPolicy;
  symbol: string;
  horizon: "scalp" | "intraday" | "swing";
  confidence: number;
  bias: ProbabilityDirection;
  impactDelta: number;
  forecastId?: string;
  generatedAt: string;
};

type PolicyStore = {
  preferences: Map<string, PolicyPreferenceRecord>;
  decisions: PolicyDecisionRecord[];
  autoSelectorState: Map<string, AutoSelectorStateRecord>;
  autoSwitchEvents: AutoPolicySwitchEventRecord[];
  autoSelectorConfig: Map<string, AutoSelectorConfigRecord>;
  presetRecommendationState: Map<string, PresetRecommendationStateRecord>;
  presetRecommendationOverride: Map<string, PresetRecommendationOverrideRecord>;
};

type PresetRecommendationStateRecord = {
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing";
  recommendedPreset: AutoSelectorPreset;
  confidence: number;
  holdUntil: string;
  switchedCount: number;
  updatedAt: string;
};

type PresetRecommendationOverrideRecord = {
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing" | "global";
  preset: AutoSelectorPreset;
  holdUntil: string;
  createdAt: string;
};

type AutoSelectorConfigRecord = {
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing" | "global";
  preset: AutoSelectorPreset;
  holdMinutes: number;
  minSwitchEdge: number;
  minSwitchConfidence: number;
  warmupMinMatches: number;
  updatedAt: string;
};

type AutoSelectorStateRecord = {
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing";
  policy: PersistedPolicy;
  updatedAt: string;
  holdUntil: string;
  switchCount: number;
  lastBasis: "attribution" | "health";
  lastConfidence: number;
  lastScoreEdge: number;
  warmupBaselineMatchedOutcomes: number;
  warmupMinMatches: number;
};

type AutoPolicySwitchEventRecord = {
  id: string;
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing";
  decision: "initialize" | "stay" | "hold" | "warmup" | "reject" | "switch" | "override_set" | "override_clear" | "override_expire";
  previousPolicy?: PersistedPolicy | AutoSelectorPreset;
  recommendedPolicy: PersistedPolicy | AutoSelectorPreset;
  appliedPolicy: PersistedPolicy | AutoSelectorPreset;
  basis: "attribution" | "health";
  confidence: number;
  scoreEdge: number;
  minSwitchEdge: number;
  minSwitchConfidence: number;
  volatility: number;
  hitRateDispersion: number;
  warmupActive: boolean;
  warmupMinMatches: number;
  warmupMatchesGained: number;
  warmupMatchesRemaining: number;
  reason: string;
  occurredAt: string;
};

export type PolicyResolution = {
  policy: ProbabilityPolicyProfile;
  source: "explicit" | "stored" | "default";
};

export type ProbabilityPolicyAnalytics = {
  generatedAt: string;
  profileKey: string;
  preference: PolicyPreferenceRecord | null;
  totals: {
    decisions: number;
  };
  requestMix: Array<{ policy: ProbabilityPolicyProfile; count: number }>;
  appliedMix: Array<{ policy: PersistedPolicy; count: number }>;
  byHorizon: Array<{
    horizon: "scalp" | "intraday" | "swing";
    decisions: number;
    avgConfidence: number;
    longBiasRate: number;
    avgImpactDelta: number;
  }>;
  attribution: {
    matchedOutcomes: number;
    byAppliedPolicy: Array<{
      policy: PersistedPolicy;
      decisions: number;
      matchedOutcomes: number;
      hitRate: number;
      avgRealizedReturnPct: number;
      score: number;
    }>;
    byAppliedPolicyAndHorizon: Array<{
      horizon: "scalp" | "intraday" | "swing";
      policy: PersistedPolicy;
      decisions: number;
      matchedOutcomes: number;
      hitRate: number;
      avgRealizedReturnPct: number;
      score: number;
    }>;
    leaderboard: Array<{
      policy: PersistedPolicy;
      matchedOutcomes: number;
      hitRate: number;
      avgRealizedReturnPct: number;
      score: number;
    }>;
  };
  autoSelectorStates: Array<{
    horizon: "scalp" | "intraday" | "swing";
    policy: PersistedPolicy;
    updatedAt: string;
    holdUntil: string;
    holdSecondsRemaining: number;
    switchCount: number;
    lastBasis: "attribution" | "health";
    lastConfidence: number;
    lastScoreEdge: number;
    warmupActive: boolean;
    warmupMinMatches: number;
    warmupMatchesGained: number;
    warmupMatchesRemaining: number;
  }>;
};

export type AutoPolicyRecommendation = {
  policy: PersistedPolicy;
  basis: "attribution" | "health";
  confidence: number;
  matchedOutcomes: number;
  scoreEdge: number;
  horizon: "scalp" | "intraday" | "swing" | "global";
  reason: string;
};

export type AutoPolicyHysteresisResult = {
  policy: PersistedPolicy;
  switched: boolean;
  locked: boolean;
  previousPolicy?: PersistedPolicy;
  holdSecondsRemaining: number;
  minSwitchEdgeUsed: number;
  minSwitchConfidenceUsed: number;
  volatility: number;
  hitRateDispersion: number;
  warmupActive: boolean;
  warmupMinMatches: number;
  warmupMatchesGained: number;
  warmupMatchesRemaining: number;
  reason: string;
};

export type AutoPolicySwitchEvent = {
  id: string;
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing";
  decision: "initialize" | "stay" | "hold" | "warmup" | "reject" | "switch" | "override_set" | "override_clear" | "override_expire";
  previousPolicy?: PersistedPolicy | AutoSelectorPreset;
  recommendedPolicy: PersistedPolicy | AutoSelectorPreset;
  appliedPolicy: PersistedPolicy | AutoSelectorPreset;
  basis: "attribution" | "health";
  confidence: number;
  scoreEdge: number;
  minSwitchEdge: number;
  minSwitchConfidence: number;
  volatility: number;
  hitRateDispersion: number;
  warmupActive: boolean;
  warmupMinMatches: number;
  warmupMatchesGained: number;
  warmupMatchesRemaining: number;
  reason: string;
  occurredAt: string;
};

export type AutoSelectorPreset =
  | "balanced"
  | "stabilize"
  | "discovery"
  | "scalp_tight"
  | "swing_stable";

export type AutoSelectorConfig = {
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing" | "global";
  preset: AutoSelectorPreset;
  holdMinutes: number;
  minSwitchEdge: number;
  minSwitchConfidence: number;
  warmupMinMatches: number;
  updatedAt: string;
};

export type AutoSelectorPresetRecommendation = {
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing";
  recommendedPreset: AutoSelectorPreset;
  rawRecommendedPreset: AutoSelectorPreset;
  confidence: number;
  rawConfidence: number;
  stabilized: boolean;
  locked: boolean;
  lockSecondsRemaining: number;
  switched: boolean;
  switchedCount: number;
  minConfidenceEdge: number;
  overrideActive: boolean;
  overrideSecondsRemaining: number;
  reason: string;
  metrics: {
    matchedOutcomes: number;
    volatility: number;
    hitRateDispersion: number;
    warmupActive: boolean;
    warmupMatchesRemaining: number;
  };
};

export type AutoSelectorIntegrityTrendPoint = {
  bucketStart: string;
  switchEvents: number;
  highImpactEvents: number;
  overrideEvents: number;
  score: number;
  status: "healthy" | "watch" | "critical";
};

export type AutoSelectorIntegrityTrend = {
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing" | "all";
  windowHours: number;
  generatedAt: string;
  points: AutoSelectorIntegrityTrendPoint[];
};

export type AutoSelectorAutoRemediation = {
  ok: true;
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing" | "all";
  generatedAt: string;
  actions: {
    expiredOverridesRemoved: number;
    selectorStatesCleared: number;
    configsNormalized: number;
  };
  integrity: AutoSelectorIntegrityReport;
};

export type AutoSelectorIntegrityReport = {
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing" | "all";
  generatedAt: string;
  status: "healthy" | "watch" | "critical";
  summary: {
    selectorStates: number;
    switchEvents: number;
    selectorConfigs: number;
    recommendationStates: number;
    recommendationOverrides: number;
    staleOverrides: number;
    invalidStateTimestamps: number;
    highChurnEvents24h: number;
  };
  issues: Array<{
    id: string;
    severity: "warning" | "critical";
    detail: string;
  }>;
};

function nowIso() {
  return new Date().toISOString();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function stddev(values: number[]) {
  if (values.length <= 1) return 0;
  const mean = average(values);
  const variance = values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function getDefaultHoldMinutes(horizon: "scalp" | "intraday" | "swing") {
  if (horizon === "scalp") return 20;
  if (horizon === "swing") return 360;
  return 90;
}

function getDefaultWarmupMatches(horizon: "scalp" | "intraday" | "swing") {
  if (horizon === "scalp") return 4;
  if (horizon === "swing") return 12;
  return 8;
}

function normalizePreset(value: unknown): AutoSelectorPreset {
  const normalized = sanitizePlainText(String(value || ""), 32).toLowerCase();
  if (
    normalized === "stabilize" ||
    normalized === "discovery" ||
    normalized === "scalp_tight" ||
    normalized === "swing_stable"
  ) {
    return normalized;
  }
  return "balanced";
}

function toPresetConfig(input: {
  preset: AutoSelectorPreset;
  horizon: "scalp" | "intraday" | "swing" | "global";
}) {
  const horizonDefault = input.horizon === "global" ? "intraday" : input.horizon;
  const base = {
    holdMinutes: getDefaultHoldMinutes(horizonDefault),
    minSwitchEdge: 0.05,
    minSwitchConfidence: 0.45,
    warmupMinMatches: getDefaultWarmupMatches(horizonDefault),
  };

  if (input.preset === "stabilize") {
    return {
      holdMinutes: Math.round(base.holdMinutes * 1.6),
      minSwitchEdge: 0.085,
      minSwitchConfidence: 0.62,
      warmupMinMatches: Math.round(base.warmupMinMatches * 1.75),
    };
  }

  if (input.preset === "discovery") {
    return {
      holdMinutes: Math.max(5, Math.round(base.holdMinutes * 0.55)),
      minSwitchEdge: 0.03,
      minSwitchConfidence: 0.34,
      warmupMinMatches: Math.max(2, Math.round(base.warmupMinMatches * 0.6)),
    };
  }

  if (input.preset === "scalp_tight") {
    return {
      holdMinutes: input.horizon === "scalp" ? 15 : base.holdMinutes,
      minSwitchEdge: input.horizon === "scalp" ? 0.07 : base.minSwitchEdge,
      minSwitchConfidence: input.horizon === "scalp" ? 0.58 : base.minSwitchConfidence,
      warmupMinMatches: input.horizon === "scalp" ? 7 : base.warmupMinMatches,
    };
  }

  if (input.preset === "swing_stable") {
    return {
      holdMinutes: input.horizon === "swing" ? 540 : base.holdMinutes,
      minSwitchEdge: input.horizon === "swing" ? 0.09 : base.minSwitchEdge,
      minSwitchConfidence: input.horizon === "swing" ? 0.66 : base.minSwitchConfidence,
      warmupMinMatches: input.horizon === "swing" ? 20 : base.warmupMinMatches,
    };
  }

  return base;
}

function toSelectorStateKey(profileKey: string, horizon: "scalp" | "intraday" | "swing") {
  return `${profileKey}:${horizon}`;
}

function toPresetRecommendationKey(profileKey: string, horizon: "scalp" | "intraday" | "swing") {
  return `${profileKey}:${horizon}`;
}

function toPresetOverrideKey(profileKey: string, horizon: "scalp" | "intraday" | "swing" | "global") {
  return `${profileKey}:${horizon}`;
}

function getRecommendationHoldMinutes(horizon: "scalp" | "intraday" | "swing") {
  if (horizon === "scalp") return 20;
  if (horizon === "swing") return 240;
  return 75;
}

function getRecommendationSwitchEdge(horizon: "scalp" | "intraday" | "swing") {
  if (horizon === "scalp") return 0.08;
  if (horizon === "swing") return 0.06;
  return 0.07;
}

function toSwitchEventId() {
  return `pps_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function pushAutoSwitchEvent(input: {
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing";
  decision: "initialize" | "stay" | "hold" | "warmup" | "reject" | "switch" | "override_set" | "override_clear" | "override_expire";
  previousPolicy?: PersistedPolicy | AutoSelectorPreset;
  recommendedPolicy: PersistedPolicy | AutoSelectorPreset;
  appliedPolicy: PersistedPolicy | AutoSelectorPreset;
  basis: "attribution" | "health";
  confidence: number;
  scoreEdge: number;
  minSwitchEdge: number;
  minSwitchConfidence: number;
  volatility: number;
  hitRateDispersion: number;
  warmupActive: boolean;
  warmupMinMatches: number;
  warmupMatchesGained: number;
  warmupMatchesRemaining: number;
  reason: string;
}) {
  const store = getStore();
  const row: AutoPolicySwitchEventRecord = {
    id: toSwitchEventId(),
    occurredAt: nowIso(),
    ...input,
  };
  store.autoSwitchEvents.push(row);
  if (store.autoSwitchEvents.length > 5_000) {
    store.autoSwitchEvents.splice(0, store.autoSwitchEvents.length - 5_000);
  }
  return row;
}

function getDynamicSwitchThresholds(input: {
  profileKey: string;
  horizon: "scalp" | "intraday" | "swing";
  baseEdge: number;
  baseConfidence: number;
}) {
  const analytics = getPolicyAnalytics({ profileKey: input.profileKey });
  const horizonRows = analytics.attribution.byAppliedPolicyAndHorizon
    .filter((row) => row.horizon === input.horizon && row.matchedOutcomes > 0);

  if (horizonRows.length <= 1) {
    return {
      edge: input.baseEdge,
      confidence: input.baseConfidence,
      volatility: 0,
      hitRateDispersion: 0,
    };
  }

  const realizedReturns = horizonRows.map((row) => row.avgRealizedReturnPct);
  const hitRates = horizonRows.map((row) => row.hitRate);
  const volatility = stddev(realizedReturns);
  const hitRateDispersion = stddev(hitRates);

  const volatilityNorm = clamp(volatility / 2.25, 0, 1);
  const ambiguityNorm = clamp(1 - hitRateDispersion / 0.22, 0, 1);

  const edge = clamp(input.baseEdge + volatilityNorm * 0.03 + ambiguityNorm * 0.02, 0.01, 0.28);
  const confidence = clamp(input.baseConfidence + volatilityNorm * 0.09 + ambiguityNorm * 0.05, 0.08, 0.995);

  return {
    edge: Number.parseFloat(edge.toFixed(4)),
    confidence: Number.parseFloat(confidence.toFixed(4)),
    volatility: Number.parseFloat(volatility.toFixed(4)),
    hitRateDispersion: Number.parseFloat(hitRateDispersion.toFixed(4)),
  };
}

function scorePolicyFromAttribution(input: {
  hitRate: number;
  avgRealizedReturnPct: number;
  matchedOutcomes: number;
}) {
  const hit = clamp(input.hitRate, 0, 1);
  const returnSignal = Math.tanh((input.avgRealizedReturnPct || 0) / 1.5);
  const returnComponent = (returnSignal + 1) / 2;
  const sampleConfidence = clamp(input.matchedOutcomes / 20, 0.2, 1);
  const blended = hit * 0.72 + returnComponent * 0.28;
  return Number.parseFloat((blended * sampleConfidence).toFixed(4));
}

function fallbackByHealth(health?: {
  status: "healthy" | "watch" | "critical";
  score: number;
}) {
  if (!health) {
    return {
      policy: "balanced" as const,
      basis: "health" as const,
      confidence: 0.35,
      reason: "No attribution signal available; defaulting to balanced profile.",
    };
  }

  if (health.status === "critical") {
    return {
      policy: "conservative" as const,
      basis: "health" as const,
      confidence: 0.9,
      reason: `Calibration health is critical (score ${health.score}), favoring conservative risk posture.`,
    };
  }

  if (health.status === "watch") {
    return {
      policy: "balanced" as const,
      basis: "health" as const,
      confidence: 0.7,
      reason: `Calibration health is watch (score ${health.score}), keeping balanced profile.`,
    };
  }

  return {
    policy: health.score >= 90 ? ("aggressive" as const) : ("balanced" as const),
    basis: "health" as const,
    confidence: clamp(health.score / 100, 0.45, 0.9),
    reason: `Attribution sample depth is insufficient; using health-guided profile from score ${health.score}.`,
  };
}

function getStore() {
  const globalRef = globalThis as typeof globalThis & {
    __TRADEHAX_POLICY_STORE__?: PolicyStore;
  };

  if (!globalRef.__TRADEHAX_POLICY_STORE__) {
    globalRef.__TRADEHAX_POLICY_STORE__ = {
      preferences: new Map(),
      decisions: [],
      autoSelectorState: new Map(),
      autoSwitchEvents: [],
      autoSelectorConfig: new Map(),
      presetRecommendationState: new Map(),
      presetRecommendationOverride: new Map(),
    };
  }

  return globalRef.__TRADEHAX_POLICY_STORE__;
}

export function normalizePolicyProfileKey(value: unknown) {
  const normalized = sanitizePlainText(String(value || "default"), 64)
    .toLowerCase()
    .replace(/[^a-z0-9:_-]/g, "");
  return normalized || "default";
}

function toPersistedPolicy(value: unknown): PersistedPolicy {
  const normalized = sanitizePlainText(String(value || ""), 20).toLowerCase();
  if (normalized === "conservative" || normalized === "aggressive") {
    return normalized;
  }
  return "balanced";
}

function toPolicy(value: unknown): ProbabilityPolicyProfile {
  const normalized = sanitizePlainText(String(value || ""), 20).toLowerCase();
  if (normalized === "conservative" || normalized === "balanced" || normalized === "aggressive") {
    return normalized;
  }
  return "auto";
}

export function setStoredPolicyPreference(input: {
  profileKey: string;
  policy: PersistedPolicy;
}) {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input.profileKey);
  const record: PolicyPreferenceRecord = {
    profileKey,
    policy: toPersistedPolicy(input.policy),
    updatedAt: nowIso(),
  };

  store.preferences.set(profileKey, record);
  return record;
}

export function clearStoredPolicyPreference(profileKey: string) {
  const store = getStore();
  store.preferences.delete(normalizePolicyProfileKey(profileKey));
}

export function resolvePolicyPreference(input: {
  profileKey: string;
  explicitPolicy?: ProbabilityPolicyProfile;
}): PolicyResolution {
  const explicit = input.explicitPolicy ? toPolicy(input.explicitPolicy) : undefined;
  if (explicit && explicit !== "auto") {
    return {
      policy: explicit,
      source: "explicit",
    };
  }

  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input.profileKey);
  const preference = store.preferences.get(profileKey);
  if (preference) {
    return {
      policy: preference.policy,
      source: "stored",
    };
  }

  return {
    policy: explicit || "auto",
    source: "default",
  };
}

export function recordPolicyDecision(input: {
  profileKey: string;
  requested: ProbabilityPolicyProfile;
  applied: PersistedPolicy;
  symbol: string;
  horizon: "scalp" | "intraday" | "swing";
  confidence: number;
  bias: ProbabilityDirection;
  impactDelta: number;
  forecastId?: string;
  generatedAt?: string;
}) {
  const store = getStore();
  const row: PolicyDecisionRecord = {
    id: `ppd_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`,
    profileKey: normalizePolicyProfileKey(input.profileKey),
    requested: toPolicy(input.requested),
    applied: toPersistedPolicy(input.applied),
    symbol: sanitizePlainText(String(input.symbol || ""), 20).toUpperCase().replace(/[^A-Z0-9]/g, ""),
    horizon: input.horizon,
    confidence: clamp(Number(input.confidence) || 0, 0, 1),
    bias: input.bias === "short" ? "short" : "long",
    impactDelta: clamp(Number(input.impactDelta) || 0, -1, 1),
    forecastId: sanitizePlainText(String(input.forecastId || ""), 120) || undefined,
    generatedAt: input.generatedAt || nowIso(),
  };

  store.decisions.push(row);
  if (store.decisions.length > 10_000) {
    store.decisions.splice(0, store.decisions.length - 10_000);
  }

  return row;
}

export function getPolicyAnalytics(input?: {
  profileKey?: string;
}): ProbabilityPolicyAnalytics {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input?.profileKey || "default");
  const preference = store.preferences.get(profileKey) || null;
  const rows = store.decisions.filter((row) => row.profileKey === profileKey);

  const requestCounts = new Map<ProbabilityPolicyProfile, number>();
  const appliedCounts = new Map<PersistedPolicy, number>();

  for (const row of rows) {
    requestCounts.set(row.requested, (requestCounts.get(row.requested) || 0) + 1);
    appliedCounts.set(row.applied, (appliedCounts.get(row.applied) || 0) + 1);
  }

  const horizons: Array<"scalp" | "intraday" | "swing"> = ["scalp", "intraday", "swing"];
  const byHorizon = horizons.map((horizon) => {
    const scoped = rows.filter((row) => row.horizon === horizon);
    const count = scoped.length;
    const avgConfidence = count > 0 ? scoped.reduce((acc, row) => acc + row.confidence, 0) / count : 0;
    const longBiasRate = count > 0 ? scoped.filter((row) => row.bias === "long").length / count : 0;
    const avgImpactDelta = count > 0 ? scoped.reduce((acc, row) => acc + row.impactDelta, 0) / count : 0;
    return {
      horizon,
      decisions: count,
      avgConfidence: Number.parseFloat(avgConfidence.toFixed(4)),
      longBiasRate: Number.parseFloat(longBiasRate.toFixed(4)),
      avgImpactDelta: Number.parseFloat(avgImpactDelta.toFixed(4)),
    };
  });

  const requestPolicies: ProbabilityPolicyProfile[] = ["auto", "conservative", "balanced", "aggressive"];
  const requestMix: ProbabilityPolicyAnalytics["requestMix"] = requestPolicies.map((policy) => ({
    policy,
    count: requestCounts.get(policy) || 0,
  }));

  const appliedPolicies: PersistedPolicy[] = ["conservative", "balanced", "aggressive"];
  const appliedMix: ProbabilityPolicyAnalytics["appliedMix"] = appliedPolicies.map((policy) => ({
    policy,
    count: appliedCounts.get(policy) || 0,
  }));

  const resolvedOutcomes = listResolvedProbabilityOutcomes({ limit: 20_000 });
  const outcomeByForecastId = new Map(resolvedOutcomes.map((row) => [row.forecastId, row]));
  const matchedRows = rows
    .map((row) => ({
      row,
      outcome: row.forecastId ? outcomeByForecastId.get(row.forecastId) : undefined,
    }))
    .filter((item) => Boolean(item.outcome));

  const byAppliedPolicy: ProbabilityPolicyAnalytics["attribution"]["byAppliedPolicy"] = appliedPolicies.map((policy) => {
    const scoped = rows.filter((row) => row.applied === policy);
    const scopedMatched = matchedRows.filter((item) => item.row.applied === policy);
    const matchedCount = scopedMatched.length;
    const hitRate = matchedCount > 0
      ? scopedMatched.filter((item) => item.row.bias === item.outcome!.realizedDirection).length / matchedCount
      : 0;
    const avgRealizedReturnPct = matchedCount > 0
      ? scopedMatched.reduce((acc, item) => acc + Number(item.outcome?.realizedReturnPct || 0), 0) / matchedCount
      : 0;
    const score = scorePolicyFromAttribution({
      hitRate,
      avgRealizedReturnPct,
      matchedOutcomes: matchedCount,
    });
    return {
      policy,
      decisions: scoped.length,
      matchedOutcomes: matchedCount,
      hitRate: Number.parseFloat(hitRate.toFixed(4)),
      avgRealizedReturnPct: Number.parseFloat(avgRealizedReturnPct.toFixed(4)),
      score,
    };
  });

  const byAppliedPolicyAndHorizon: ProbabilityPolicyAnalytics["attribution"]["byAppliedPolicyAndHorizon"] = horizons.flatMap((horizon) =>
    appliedPolicies.map((policy) => {
      const scoped = rows.filter((row) => row.horizon === horizon && row.applied === policy);
      const scopedMatched = matchedRows.filter((item) => item.row.horizon === horizon && item.row.applied === policy);
      const matchedCount = scopedMatched.length;
      const hitRate = matchedCount > 0
        ? scopedMatched.filter((item) => item.row.bias === item.outcome!.realizedDirection).length / matchedCount
        : 0;
      const avgRealizedReturnPct = matchedCount > 0
        ? scopedMatched.reduce((acc, item) => acc + Number(item.outcome?.realizedReturnPct || 0), 0) / matchedCount
        : 0;
      const score = scorePolicyFromAttribution({
        hitRate,
        avgRealizedReturnPct,
        matchedOutcomes: matchedCount,
      });
      return {
        horizon,
        policy,
        decisions: scoped.length,
        matchedOutcomes: matchedCount,
        hitRate: Number.parseFloat(hitRate.toFixed(4)),
        avgRealizedReturnPct: Number.parseFloat(avgRealizedReturnPct.toFixed(4)),
        score,
      };
    }),
  );

  const leaderboard = [...byAppliedPolicy]
    .sort((a, b) => b.score - a.score || b.matchedOutcomes - a.matchedOutcomes)
    .map((row) => ({
      policy: row.policy,
      matchedOutcomes: row.matchedOutcomes,
      hitRate: row.hitRate,
      avgRealizedReturnPct: row.avgRealizedReturnPct,
      score: row.score,
    }));

  const nowMs = Date.now();
  const autoSelectorStates = Array.from(store.autoSelectorState.values())
    .filter((state) => state.profileKey === profileKey)
    .map((state) => {
      const holdSecondsRemaining = Math.max(0, Math.ceil((Date.parse(state.holdUntil) - nowMs) / 1000));
      const matchedForHorizon = byAppliedPolicyAndHorizon
        .filter((row) => row.horizon === state.horizon)
        .reduce((acc, row) => acc + row.matchedOutcomes, 0);
      const warmupMatchesGained = Math.max(0, matchedForHorizon - state.warmupBaselineMatchedOutcomes);
      const warmupMatchesRemaining = Math.max(0, state.warmupMinMatches - warmupMatchesGained);
      return {
        horizon: state.horizon,
        policy: state.policy,
        updatedAt: state.updatedAt,
        holdUntil: state.holdUntil,
        holdSecondsRemaining,
        switchCount: state.switchCount,
        lastBasis: state.lastBasis,
        lastConfidence: state.lastConfidence,
        lastScoreEdge: state.lastScoreEdge,
        warmupActive: warmupMatchesRemaining > 0,
        warmupMinMatches: state.warmupMinMatches,
        warmupMatchesGained,
        warmupMatchesRemaining,
      };
    })
    .sort((a, b) => a.horizon.localeCompare(b.horizon));

  return {
    generatedAt: nowIso(),
    profileKey,
    preference,
    totals: {
      decisions: rows.length,
    },
    requestMix,
    appliedMix,
    byHorizon,
    attribution: {
      matchedOutcomes: matchedRows.length,
      byAppliedPolicy,
      byAppliedPolicyAndHorizon,
      leaderboard,
    },
    autoSelectorStates,
  };
}

export function getAutoPolicyRecommendation(input: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing";
  health?: {
    status: "healthy" | "watch" | "critical";
    score: number;
  };
  minHorizonMatches?: number;
  minGlobalMatches?: number;
  minScoreEdge?: number;
}): AutoPolicyRecommendation {
  const profileKey = normalizePolicyProfileKey(input.profileKey || "default");
  const horizon = input.horizon || "intraday";
  const minHorizonMatches = Math.max(3, Math.floor(input.minHorizonMatches ?? 6));
  const minGlobalMatches = Math.max(6, Math.floor(input.minGlobalMatches ?? 12));
  const minScoreEdge = clamp(input.minScoreEdge ?? 0.035, 0.005, 0.25);

  const analytics = getPolicyAnalytics({ profileKey });
  const horizonRows = analytics.attribution.byAppliedPolicyAndHorizon
    .filter((row) => row.horizon === horizon)
    .sort((a, b) => b.score - a.score || b.matchedOutcomes - a.matchedOutcomes);
  const globalRows = [...analytics.attribution.byAppliedPolicy]
    .sort((a, b) => b.score - a.score || b.matchedOutcomes - a.matchedOutcomes);

  const bestHorizon = horizonRows[0];
  const runnerHorizon = horizonRows[1];
  if (bestHorizon && bestHorizon.matchedOutcomes >= minHorizonMatches) {
    const edge = bestHorizon.score - (runnerHorizon?.score || 0);
    if (edge >= minScoreEdge || !runnerHorizon) {
      return {
        policy: bestHorizon.policy,
        basis: "attribution",
        confidence: clamp(bestHorizon.score + Math.min(0.2, edge), 0.25, 0.98),
        matchedOutcomes: bestHorizon.matchedOutcomes,
        scoreEdge: Number.parseFloat(edge.toFixed(4)),
        horizon,
        reason: `Attribution leaderboard selected ${bestHorizon.policy} on ${horizon} horizon (score ${bestHorizon.score.toFixed(3)}, edge ${edge.toFixed(3)}, n=${bestHorizon.matchedOutcomes}).`,
      };
    }
  }

  const bestGlobal = globalRows[0];
  const runnerGlobal = globalRows[1];
  if (bestGlobal && bestGlobal.matchedOutcomes >= minGlobalMatches) {
    const edge = bestGlobal.score - (runnerGlobal?.score || 0);
    if (edge >= minScoreEdge || !runnerGlobal) {
      return {
        policy: bestGlobal.policy,
        basis: "attribution",
        confidence: clamp(bestGlobal.score + Math.min(0.16, edge), 0.25, 0.96),
        matchedOutcomes: bestGlobal.matchedOutcomes,
        scoreEdge: Number.parseFloat(edge.toFixed(4)),
        horizon: "global",
        reason: `Attribution leaderboard selected ${bestGlobal.policy} globally (score ${bestGlobal.score.toFixed(3)}, edge ${edge.toFixed(3)}, n=${bestGlobal.matchedOutcomes}).`,
      };
    }
  }

  const healthFallback = fallbackByHealth(input.health);
  return {
    policy: healthFallback.policy,
    basis: healthFallback.basis,
    confidence: healthFallback.confidence,
    matchedOutcomes: analytics.attribution.matchedOutcomes,
    scoreEdge: 0,
    horizon: "global",
    reason: healthFallback.reason,
  };
}

export function applyAutoPolicyHysteresis(input: {
  profileKey?: string;
  horizon: "scalp" | "intraday" | "swing";
  recommendation: AutoPolicyRecommendation;
  holdMinutes?: number;
  minSwitchEdge?: number;
  minSwitchConfidence?: number;
  warmupMinMatches?: number;
}): AutoPolicyHysteresisResult {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input.profileKey || "default");
  const horizon = input.horizon;
  const now = Date.now();
  const configured = resolveAutoSelectorConfig({ profileKey, horizon });
  const holdMinutes = Math.max(5, Math.floor(input.holdMinutes ?? configured.holdMinutes));
  const holdMs = holdMinutes * 60_000;
  const minSwitchEdge = clamp(input.minSwitchEdge ?? configured.minSwitchEdge, 0.005, 0.3);
  const minSwitchConfidence = clamp(input.minSwitchConfidence ?? configured.minSwitchConfidence, 0.05, 0.99);
  const warmupMinMatches = Math.max(0, Math.floor(input.warmupMinMatches ?? configured.warmupMinMatches));
  const dynamicThresholds = getDynamicSwitchThresholds({
    profileKey,
    horizon,
    baseEdge: minSwitchEdge,
    baseConfidence: minSwitchConfidence,
  });
  const minSwitchEdgeUsed = dynamicThresholds.edge;
  const minSwitchConfidenceUsed = dynamicThresholds.confidence;
  const key = toSelectorStateKey(profileKey, horizon);
  const previous = store.autoSelectorState.get(key);

  const baseline = previous?.warmupBaselineMatchedOutcomes ?? input.recommendation.matchedOutcomes;
  const warmupMatchesGained = Math.max(0, input.recommendation.matchedOutcomes - baseline);
  const warmupMatchesRemaining = Math.max(0, warmupMinMatches - warmupMatchesGained);
  const warmupActive = warmupMatchesRemaining > 0;

  const pushEvent = (event: Omit<AutoPolicySwitchEventRecord, "id" | "occurredAt">) => pushAutoSwitchEvent(event);

  const upsertState = (nextPolicy: PersistedPolicy, switchCount: number, resetWarmup: boolean) => {
    const nextWarmupBaseline = resetWarmup
      ? input.recommendation.matchedOutcomes
      : previous?.warmupBaselineMatchedOutcomes ?? input.recommendation.matchedOutcomes;
    const next: AutoSelectorStateRecord = {
      profileKey,
      horizon,
      policy: nextPolicy,
      updatedAt: new Date(now).toISOString(),
      holdUntil: new Date(now + holdMs).toISOString(),
      switchCount,
      lastBasis: input.recommendation.basis,
      lastConfidence: Number.parseFloat(input.recommendation.confidence.toFixed(4)),
      lastScoreEdge: Number.parseFloat(input.recommendation.scoreEdge.toFixed(4)),
      warmupBaselineMatchedOutcomes: nextWarmupBaseline,
      warmupMinMatches,
    };
    store.autoSelectorState.set(key, next);
    return next;
  };

  if (!previous) {
    upsertState(input.recommendation.policy, 0, true);
    pushEvent({
      profileKey,
      horizon,
      decision: "initialize",
      previousPolicy: undefined,
      recommendedPolicy: input.recommendation.policy,
      appliedPolicy: input.recommendation.policy,
      basis: input.recommendation.basis,
      confidence: input.recommendation.confidence,
      scoreEdge: input.recommendation.scoreEdge,
      minSwitchEdge: minSwitchEdgeUsed,
      minSwitchConfidence: minSwitchConfidenceUsed,
      volatility: dynamicThresholds.volatility,
      hitRateDispersion: dynamicThresholds.hitRateDispersion,
      warmupActive: true,
      warmupMinMatches,
      warmupMatchesGained: 0,
      warmupMatchesRemaining: warmupMinMatches,
      reason: `Initialized hysteresis state for ${horizon} with ${input.recommendation.policy}. ${input.recommendation.reason}`,
    });
    return {
      policy: input.recommendation.policy,
      switched: false,
      locked: false,
      holdSecondsRemaining: holdMinutes * 60,
      minSwitchEdgeUsed,
      minSwitchConfidenceUsed,
      volatility: dynamicThresholds.volatility,
      hitRateDispersion: dynamicThresholds.hitRateDispersion,
      warmupActive: true,
      warmupMinMatches,
      warmupMatchesGained: 0,
      warmupMatchesRemaining: warmupMinMatches,
      reason: `Initialized hysteresis state for ${horizon} with ${input.recommendation.policy}. ${input.recommendation.reason}`,
    };
  }

  const holdUntilMs = Date.parse(previous.holdUntil) || now;
  const locked = holdUntilMs > now;
  const holdSecondsRemaining = Math.max(0, Math.ceil((holdUntilMs - now) / 1000));

  if (input.recommendation.policy === previous.policy) {
    upsertState(previous.policy, previous.switchCount, false);
    pushEvent({
      profileKey,
      horizon,
      decision: "stay",
      previousPolicy: previous.policy,
      recommendedPolicy: input.recommendation.policy,
      appliedPolicy: previous.policy,
      basis: input.recommendation.basis,
      confidence: input.recommendation.confidence,
      scoreEdge: input.recommendation.scoreEdge,
      minSwitchEdge: minSwitchEdgeUsed,
      minSwitchConfidence: minSwitchConfidenceUsed,
      volatility: dynamicThresholds.volatility,
      hitRateDispersion: dynamicThresholds.hitRateDispersion,
      warmupActive,
      warmupMinMatches,
      warmupMatchesGained,
      warmupMatchesRemaining,
      reason: `Recommendation confirms existing ${previous.policy} policy; hysteresis window refreshed.`,
    });
    return {
      policy: previous.policy,
      switched: false,
      locked,
      holdSecondsRemaining,
      minSwitchEdgeUsed,
      minSwitchConfidenceUsed,
      volatility: dynamicThresholds.volatility,
      hitRateDispersion: dynamicThresholds.hitRateDispersion,
      warmupActive,
      warmupMinMatches,
      warmupMatchesGained,
      warmupMatchesRemaining,
      reason: `Recommendation confirms existing ${previous.policy} policy; hysteresis window refreshed.`,
    };
  }

  if (locked) {
    pushEvent({
      profileKey,
      horizon,
      decision: "hold",
      previousPolicy: previous.policy,
      recommendedPolicy: input.recommendation.policy,
      appliedPolicy: previous.policy,
      basis: input.recommendation.basis,
      confidence: input.recommendation.confidence,
      scoreEdge: input.recommendation.scoreEdge,
      minSwitchEdge: minSwitchEdgeUsed,
      minSwitchConfidence: minSwitchConfidenceUsed,
      volatility: dynamicThresholds.volatility,
      hitRateDispersion: dynamicThresholds.hitRateDispersion,
      warmupActive,
      warmupMinMatches,
      warmupMatchesGained,
      warmupMatchesRemaining,
      reason: `Holding ${previous.policy} for ${holdSecondsRemaining}s to avoid policy churn. Candidate ${input.recommendation.policy} deferred.`,
    });
    return {
      policy: previous.policy,
      switched: false,
      locked: true,
      previousPolicy: previous.policy,
      holdSecondsRemaining,
      minSwitchEdgeUsed,
      minSwitchConfidenceUsed,
      volatility: dynamicThresholds.volatility,
      hitRateDispersion: dynamicThresholds.hitRateDispersion,
      warmupActive,
      warmupMinMatches,
      warmupMatchesGained,
      warmupMatchesRemaining,
      reason: `Holding ${previous.policy} for ${holdSecondsRemaining}s to avoid policy churn. Candidate ${input.recommendation.policy} deferred.`,
    };
  }

  if (warmupActive) {
    upsertState(previous.policy, previous.switchCount, false);
    pushEvent({
      profileKey,
      horizon,
      decision: "warmup",
      previousPolicy: previous.policy,
      recommendedPolicy: input.recommendation.policy,
      appliedPolicy: previous.policy,
      basis: input.recommendation.basis,
      confidence: input.recommendation.confidence,
      scoreEdge: input.recommendation.scoreEdge,
      minSwitchEdge: minSwitchEdgeUsed,
      minSwitchConfidence: minSwitchConfidenceUsed,
      volatility: dynamicThresholds.volatility,
      hitRateDispersion: dynamicThresholds.hitRateDispersion,
      warmupActive,
      warmupMinMatches,
      warmupMatchesGained,
      warmupMatchesRemaining,
      reason: `Warm-up active: need ${warmupMatchesRemaining} more matched outcomes before allowing policy switches.`,
    });
    return {
      policy: previous.policy,
      switched: false,
      locked: false,
      previousPolicy: previous.policy,
      holdSecondsRemaining: holdMinutes * 60,
      minSwitchEdgeUsed,
      minSwitchConfidenceUsed,
      volatility: dynamicThresholds.volatility,
      hitRateDispersion: dynamicThresholds.hitRateDispersion,
      warmupActive,
      warmupMinMatches,
      warmupMatchesGained,
      warmupMatchesRemaining,
      reason: `Warm-up active: need ${warmupMatchesRemaining} more matched outcomes before allowing policy switches.`,
    };
  }

  if (input.recommendation.scoreEdge < minSwitchEdgeUsed || input.recommendation.confidence < minSwitchConfidenceUsed) {
    upsertState(previous.policy, previous.switchCount, false);
    pushEvent({
      profileKey,
      horizon,
      decision: "reject",
      previousPolicy: previous.policy,
      recommendedPolicy: input.recommendation.policy,
      appliedPolicy: previous.policy,
      basis: input.recommendation.basis,
      confidence: input.recommendation.confidence,
      scoreEdge: input.recommendation.scoreEdge,
      minSwitchEdge: minSwitchEdgeUsed,
      minSwitchConfidence: minSwitchConfidenceUsed,
      volatility: dynamicThresholds.volatility,
      hitRateDispersion: dynamicThresholds.hitRateDispersion,
      warmupActive,
      warmupMinMatches,
      warmupMatchesGained,
      warmupMatchesRemaining,
      reason: `Switch criteria not met (edge ${input.recommendation.scoreEdge.toFixed(3)} / ${minSwitchEdgeUsed.toFixed(3)}, confidence ${input.recommendation.confidence.toFixed(3)} / ${minSwitchConfidenceUsed.toFixed(3)}).`,
    });
    return {
      policy: previous.policy,
      switched: false,
      locked: false,
      previousPolicy: previous.policy,
      holdSecondsRemaining: holdMinutes * 60,
      minSwitchEdgeUsed,
      minSwitchConfidenceUsed,
      volatility: dynamicThresholds.volatility,
      hitRateDispersion: dynamicThresholds.hitRateDispersion,
      warmupActive,
      warmupMinMatches,
      warmupMatchesGained,
      warmupMatchesRemaining,
      reason: `Switch criteria not met (edge ${input.recommendation.scoreEdge.toFixed(3)} / ${minSwitchEdgeUsed.toFixed(3)}, confidence ${input.recommendation.confidence.toFixed(3)} / ${minSwitchConfidenceUsed.toFixed(3)}).`,
    };
  }

  upsertState(input.recommendation.policy, previous.switchCount + 1, true);
  pushEvent({
    profileKey,
    horizon,
    decision: "switch",
    previousPolicy: previous.policy,
    recommendedPolicy: input.recommendation.policy,
    appliedPolicy: input.recommendation.policy,
    basis: input.recommendation.basis,
    confidence: input.recommendation.confidence,
    scoreEdge: input.recommendation.scoreEdge,
    minSwitchEdge: minSwitchEdgeUsed,
    minSwitchConfidence: minSwitchConfidenceUsed,
    volatility: dynamicThresholds.volatility,
    hitRateDispersion: dynamicThresholds.hitRateDispersion,
    warmupActive: false,
    warmupMinMatches,
    warmupMatchesGained,
    warmupMatchesRemaining: 0,
    reason: `Switched policy ${previous.policy} → ${input.recommendation.policy} (edge ${input.recommendation.scoreEdge.toFixed(3)}, confidence ${input.recommendation.confidence.toFixed(3)}).`,
  });
  return {
    policy: input.recommendation.policy,
    switched: true,
    locked: false,
    previousPolicy: previous.policy,
    holdSecondsRemaining: holdMinutes * 60,
    minSwitchEdgeUsed,
    minSwitchConfidenceUsed,
    volatility: dynamicThresholds.volatility,
    hitRateDispersion: dynamicThresholds.hitRateDispersion,
    warmupActive: false,
    warmupMinMatches,
    warmupMatchesGained,
    warmupMatchesRemaining: 0,
    reason: `Switched policy ${previous.policy} → ${input.recommendation.policy} (edge ${input.recommendation.scoreEdge.toFixed(3)}, confidence ${input.recommendation.confidence.toFixed(3)}).`,
  };
}

export function listAutoPolicySwitchEvents(input?: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing";
  limit?: number;
}): AutoPolicySwitchEvent[] {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input?.profileKey || "default");
  const limit = Math.max(1, Math.min(200, Math.floor(input?.limit ?? 40)));
  const horizon = input?.horizon;

  const rows = store.autoSwitchEvents
    .filter((row) => row.profileKey === profileKey)
    .filter((row) => (horizon ? row.horizon === horizon : true))
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, limit)
    .map((row) => ({
      id: row.id,
      profileKey: row.profileKey,
      horizon: row.horizon,
      decision: row.decision,
      previousPolicy: row.previousPolicy,
      recommendedPolicy: row.recommendedPolicy,
      appliedPolicy: row.appliedPolicy,
      basis: row.basis,
      confidence: Number.parseFloat(row.confidence.toFixed(4)),
      scoreEdge: Number.parseFloat(row.scoreEdge.toFixed(4)),
      minSwitchEdge: Number.parseFloat(row.minSwitchEdge.toFixed(4)),
      minSwitchConfidence: Number.parseFloat(row.minSwitchConfidence.toFixed(4)),
      volatility: Number.parseFloat(row.volatility.toFixed(4)),
      hitRateDispersion: Number.parseFloat(row.hitRateDispersion.toFixed(4)),
      warmupActive: row.warmupActive,
      warmupMinMatches: row.warmupMinMatches,
      warmupMatchesGained: row.warmupMatchesGained,
      warmupMatchesRemaining: row.warmupMatchesRemaining,
      reason: row.reason,
      occurredAt: row.occurredAt,
    }));

  return rows;
}

export function resetAutoPolicySelector(input?: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing";
  clearEvents?: boolean;
}) {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input?.profileKey || "default");
  const horizon = input?.horizon;
  const clearEvents = Boolean(input?.clearEvents);

  const stateKeys = Array.from(store.autoSelectorState.keys());
  let clearedStates = 0;
  for (const key of stateKeys) {
    const row = store.autoSelectorState.get(key);
    if (!row || row.profileKey !== profileKey) {
      continue;
    }
    if (horizon && row.horizon !== horizon) {
      continue;
    }
    store.autoSelectorState.delete(key);
    clearedStates += 1;
  }

  let clearedEvents = 0;
  if (clearEvents) {
    const before = store.autoSwitchEvents.length;
    store.autoSwitchEvents = store.autoSwitchEvents.filter((row) => {
      if (row.profileKey !== profileKey) {
        return true;
      }
      if (horizon && row.horizon !== horizon) {
        return true;
      }
      return false;
    });
    clearedEvents = Math.max(0, before - store.autoSwitchEvents.length);
  }

  return {
    ok: true,
    profileKey,
    horizon: horizon || "all",
    clearEvents,
    clearedStates,
    clearedEvents,
    generatedAt: nowIso(),
  };
}

function toConfigKey(profileKey: string, horizon: "scalp" | "intraday" | "swing" | "global") {
  return `${profileKey}:${horizon}`;
}

export function setAutoSelectorPreset(input: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing" | "global";
  preset?: AutoSelectorPreset;
}) {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input.profileKey || "default");
  const horizon = input.horizon || "global";
  const preset = normalizePreset(input.preset || "balanced");
  const config = toPresetConfig({ preset, horizon });

  const record: AutoSelectorConfigRecord = {
    profileKey,
    horizon,
    preset,
    holdMinutes: config.holdMinutes,
    minSwitchEdge: Number.parseFloat(config.minSwitchEdge.toFixed(4)),
    minSwitchConfidence: Number.parseFloat(config.minSwitchConfidence.toFixed(4)),
    warmupMinMatches: config.warmupMinMatches,
    updatedAt: nowIso(),
  };

  store.autoSelectorConfig.set(toConfigKey(profileKey, horizon), record);
  return record;
}

export function clearAutoSelectorPreset(input?: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing" | "global";
}) {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input?.profileKey || "default");
  const horizon = input?.horizon || "global";
  store.autoSelectorConfig.delete(toConfigKey(profileKey, horizon));
}

export function resolveAutoSelectorConfig(input?: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing";
}): AutoSelectorConfig {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input?.profileKey || "default");
  const horizon = input?.horizon || "intraday";

  const specific = store.autoSelectorConfig.get(toConfigKey(profileKey, horizon));
  const global = store.autoSelectorConfig.get(toConfigKey(profileKey, "global"));
  const resolved = specific || global;

  if (resolved) {
    return {
      profileKey,
      horizon,
      preset: resolved.preset,
      holdMinutes: resolved.holdMinutes,
      minSwitchEdge: resolved.minSwitchEdge,
      minSwitchConfidence: resolved.minSwitchConfidence,
      warmupMinMatches: resolved.warmupMinMatches,
      updatedAt: resolved.updatedAt,
    };
  }

  return {
    profileKey,
    horizon,
    preset: "balanced",
    holdMinutes: getDefaultHoldMinutes(horizon),
    minSwitchEdge: 0.05,
    minSwitchConfidence: 0.45,
    warmupMinMatches: getDefaultWarmupMatches(horizon),
    updatedAt: nowIso(),
  };
}

export function recommendAutoSelectorPreset(input?: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing";
}): AutoSelectorPresetRecommendation {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input?.profileKey || "default");
  cleanupExpiredRecommendationOverrides({ profileKey });
  const horizon = input?.horizon || "intraday";
  const analytics = getPolicyAnalytics({ profileKey });

  const horizonRows = analytics.attribution.byAppliedPolicyAndHorizon
    .filter((row) => row.horizon === horizon && row.matchedOutcomes > 0);
  const matchedOutcomes = horizonRows.reduce((acc, row) => acc + row.matchedOutcomes, 0);
  const volatility = horizonRows.length > 1
    ? Number.parseFloat(stddev(horizonRows.map((row) => row.avgRealizedReturnPct)).toFixed(4))
    : 0;
  const hitRateDispersion = horizonRows.length > 1
    ? Number.parseFloat(stddev(horizonRows.map((row) => row.hitRate)).toFixed(4))
    : 0;

  const state = analytics.autoSelectorStates.find((row) => row.horizon === horizon);
  const warmupActive = Boolean(state?.warmupActive);
  const warmupMatchesRemaining = state?.warmupMatchesRemaining || 0;

  const buildBase = (candidate: {
    recommendedPreset: AutoSelectorPreset;
    confidence: number;
    reason: string;
  }) => ({
    profileKey,
    horizon,
    recommendedPreset: candidate.recommendedPreset,
    rawRecommendedPreset: candidate.recommendedPreset,
    confidence: Number.parseFloat(candidate.confidence.toFixed(4)),
    rawConfidence: Number.parseFloat(candidate.confidence.toFixed(4)),
    stabilized: false,
    locked: false,
    lockSecondsRemaining: 0,
    switched: false,
    switchedCount: 0,
    minConfidenceEdge: getRecommendationSwitchEdge(horizon),
    overrideActive: false,
    overrideSecondsRemaining: 0,
    reason: candidate.reason,
    metrics: {
      matchedOutcomes,
      volatility,
      hitRateDispersion,
      warmupActive,
      warmupMatchesRemaining,
    },
  });

  let base: AutoSelectorPresetRecommendation;

  if (warmupActive || matchedOutcomes < 6) {
    base = buildBase({
      recommendedPreset: "stabilize",
      confidence: 0.86,
      reason: "Sample depth is still warming up; a stabilization preset reduces premature policy churn.",
    });
  } else if (horizon === "scalp" && volatility >= 1.05) {
    base = buildBase({
      recommendedPreset: "scalp_tight",
      confidence: clamp(0.62 + volatility * 0.11, 0.62, 0.94),
      reason: "Scalp regime is volatile; tighter scalp guardrails improve switch quality.",
    });
  } else if (horizon === "swing" && volatility >= 1.15) {
    base = buildBase({
      recommendedPreset: "swing_stable",
      confidence: clamp(0.65 + volatility * 0.1, 0.65, 0.95),
      reason: "Swing regime is broad and noisy; longer holds and stronger confirmation are recommended.",
    });
  } else if (volatility <= 0.55 && hitRateDispersion >= 0.11 && matchedOutcomes >= 12) {
    base = buildBase({
      recommendedPreset: "discovery",
      confidence: clamp(0.6 + hitRateDispersion * 1.2, 0.6, 0.92),
      reason: "Regime is relatively calm with meaningful policy separation; discovery can accelerate adaptation.",
    });
  } else {
    base = buildBase({
      recommendedPreset: "balanced",
      confidence: 0.7,
      reason: "Current regime appears mixed; balanced remains the most robust default.",
    });
  }

  const key = toPresetRecommendationKey(profileKey, horizon);
  const overrideSpecific = store.presetRecommendationOverride.get(toPresetOverrideKey(profileKey, horizon));
  const overrideGlobal = store.presetRecommendationOverride.get(toPresetOverrideKey(profileKey, "global"));
  const override = overrideSpecific || overrideGlobal;
  const now = Date.now();

  if (override) {
    const overrideUntilMs = Date.parse(override.holdUntil);
    if (overrideUntilMs > now) {
      const overrideSecondsRemaining = Math.max(0, Math.ceil((overrideUntilMs - now) / 1000));
      return {
        ...base,
        recommendedPreset: override.preset,
        stabilized: true,
        locked: true,
        lockSecondsRemaining: overrideSecondsRemaining,
        switched: false,
        switchedCount: (store.presetRecommendationState.get(key)?.switchedCount || 0),
        minConfidenceEdge: getRecommendationSwitchEdge(horizon),
        overrideActive: true,
        overrideSecondsRemaining,
        reason: `${base.reason} Manual override is active for ${overrideSecondsRemaining}s, honoring ${override.preset}.`,
      };
    }

    store.presetRecommendationOverride.delete(toPresetOverrideKey(profileKey, override.horizon));
    pushAutoSwitchEvent({
      profileKey,
      horizon,
      decision: "override_expire",
      previousPolicy: override.preset,
      recommendedPolicy: base.rawRecommendedPreset === "balanced" ? "balanced" : base.rawRecommendedPreset,
      appliedPolicy: base.rawRecommendedPreset === "balanced" ? "balanced" : base.rawRecommendedPreset,
      basis: "health",
      confidence: base.rawConfidence,
      scoreEdge: 0,
      minSwitchEdge: getRecommendationSwitchEdge(horizon),
      minSwitchConfidence: 0,
      volatility,
      hitRateDispersion,
      warmupActive,
      warmupMinMatches: state?.warmupMinMatches || 0,
      warmupMatchesGained: state?.warmupMatchesGained || 0,
      warmupMatchesRemaining,
      reason: `Manual recommendation override expired for ${override.horizon}.`,
    });
  }

  const previous = store.presetRecommendationState.get(key);
  const holdMinutes = getRecommendationHoldMinutes(horizon);
  const holdMs = holdMinutes * 60_000;
  const minConfidenceEdge = getRecommendationSwitchEdge(horizon);

  if (!previous) {
    store.presetRecommendationState.set(key, {
      profileKey,
      horizon,
      recommendedPreset: base.recommendedPreset,
      confidence: base.confidence,
      holdUntil: new Date(now + holdMs).toISOString(),
      switchedCount: 0,
      updatedAt: new Date(now).toISOString(),
    });
    return {
      ...base,
      minConfidenceEdge,
      overrideActive: false,
      overrideSecondsRemaining: 0,
      reason: `${base.reason} Initialized recommendation memory for ${horizon}.`,
    };
  }

  const lockUntilMs = Date.parse(previous.holdUntil) || now;
  const locked = lockUntilMs > now;
  const lockSecondsRemaining = Math.max(0, Math.ceil((lockUntilMs - now) / 1000));

  if (base.recommendedPreset === previous.recommendedPreset) {
    store.presetRecommendationState.set(key, {
      ...previous,
      confidence: base.confidence,
      holdUntil: new Date(now + holdMs).toISOString(),
      updatedAt: new Date(now).toISOString(),
    });
    return {
      ...base,
      stabilized: true,
      locked,
      lockSecondsRemaining,
      switched: false,
      switchedCount: previous.switchedCount,
      minConfidenceEdge,
      overrideActive: false,
      overrideSecondsRemaining: 0,
      reason: `${base.reason} Recommendation unchanged; stability window refreshed.`,
    };
  }

  const confidenceEdge = base.confidence - previous.confidence;
  if (locked || confidenceEdge < minConfidenceEdge) {
    return {
      ...base,
      recommendedPreset: previous.recommendedPreset,
      confidence: previous.confidence,
      stabilized: true,
      locked,
      lockSecondsRemaining,
      switched: false,
      switchedCount: previous.switchedCount,
      minConfidenceEdge,
      overrideActive: false,
      overrideSecondsRemaining: 0,
      reason: locked
        ? `${base.reason} Candidate preset held for stability (${lockSecondsRemaining}s remaining).`
        : `${base.reason} Candidate preset deferred: confidence edge ${confidenceEdge.toFixed(3)} is below threshold ${minConfidenceEdge.toFixed(3)}.`,
    };
  }

  store.presetRecommendationState.set(key, {
    profileKey,
    horizon,
    recommendedPreset: base.recommendedPreset,
    confidence: base.confidence,
    holdUntil: new Date(now + holdMs).toISOString(),
    switchedCount: previous.switchedCount + 1,
    updatedAt: new Date(now).toISOString(),
  });

  return {
    ...base,
    stabilized: true,
    locked: false,
    lockSecondsRemaining: 0,
    switched: true,
    switchedCount: previous.switchedCount + 1,
    minConfidenceEdge,
    overrideActive: false,
    overrideSecondsRemaining: 0,
    reason: `${base.reason} Recommendation switched ${previous.recommendedPreset} → ${base.recommendedPreset}.`,
  };
}

export function setPresetRecommendationOverride(input: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing" | "global";
  preset: AutoSelectorPreset;
  holdMinutes?: number;
}) {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input.profileKey || "default");
  const horizon = input.horizon || "global";
  const holdMinutes = Math.max(5, Math.floor(input.holdMinutes ?? 90));
  const now = Date.now();

  const row: PresetRecommendationOverrideRecord = {
    profileKey,
    horizon,
    preset: normalizePreset(input.preset),
    holdUntil: new Date(now + holdMinutes * 60_000).toISOString(),
    createdAt: new Date(now).toISOString(),
  };

  store.presetRecommendationOverride.set(toPresetOverrideKey(profileKey, horizon), row);

  const eventHorizon: "scalp" | "intraday" | "swing" = horizon === "global" ? "intraday" : horizon;
  pushAutoSwitchEvent({
    profileKey,
    horizon: eventHorizon,
    decision: "override_set",
    previousPolicy: undefined,
    recommendedPolicy: row.preset,
    appliedPolicy: row.preset,
    basis: "health",
    confidence: 1,
    scoreEdge: 0,
    minSwitchEdge: 0,
    minSwitchConfidence: 0,
    volatility: 0,
    hitRateDispersion: 0,
    warmupActive: false,
    warmupMinMatches: 0,
    warmupMatchesGained: 0,
    warmupMatchesRemaining: 0,
    reason: `Manual recommendation override set to ${row.preset} for ${horizon} (${holdMinutes}m).`,
  });

  return row;
}

export function clearPresetRecommendationOverride(input?: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing" | "global";
}) {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input?.profileKey || "default");
  const horizon = input?.horizon || "global";
  const existing = store.presetRecommendationOverride.get(toPresetOverrideKey(profileKey, horizon));
  store.presetRecommendationOverride.delete(toPresetOverrideKey(profileKey, horizon));

  if (existing) {
    const eventHorizon: "scalp" | "intraday" | "swing" = horizon === "global" ? "intraday" : horizon;
    pushAutoSwitchEvent({
      profileKey,
      horizon: eventHorizon,
      decision: "override_clear",
      previousPolicy: existing.preset,
      recommendedPolicy: existing.preset,
      appliedPolicy: existing.preset,
      basis: "health",
      confidence: 1,
      scoreEdge: 0,
      minSwitchEdge: 0,
      minSwitchConfidence: 0,
      volatility: 0,
      hitRateDispersion: 0,
      warmupActive: false,
      warmupMinMatches: 0,
      warmupMatchesGained: 0,
      warmupMatchesRemaining: 0,
      reason: `Manual recommendation override cleared for ${horizon}.`,
    });
  }
}

export function cleanupExpiredRecommendationOverrides(input?: {
  profileKey?: string;
}) {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input?.profileKey || "default");
  const now = Date.now();
  const rows = Array.from(store.presetRecommendationOverride.values()).filter((row) => row.profileKey === profileKey);

  let removed = 0;
  for (const row of rows) {
    const expiresAt = Date.parse(row.holdUntil);
    if (!Number.isFinite(expiresAt) || expiresAt <= now) {
      store.presetRecommendationOverride.delete(toPresetOverrideKey(row.profileKey, row.horizon));
      removed += 1;
      const eventHorizon: "scalp" | "intraday" | "swing" = row.horizon === "global" ? "intraday" : row.horizon;
      pushAutoSwitchEvent({
        profileKey: row.profileKey,
        horizon: eventHorizon,
        decision: "override_expire",
        previousPolicy: row.preset,
        recommendedPolicy: row.preset,
        appliedPolicy: row.preset,
        basis: "health",
        confidence: 1,
        scoreEdge: 0,
        minSwitchEdge: 0,
        minSwitchConfidence: 0,
        volatility: 0,
        hitRateDispersion: 0,
        warmupActive: false,
        warmupMinMatches: 0,
        warmupMatchesGained: 0,
        warmupMatchesRemaining: 0,
        reason: `Expired recommendation override was cleaned up for ${row.horizon}.`,
      });
    }
  }

  return {
    profileKey,
    removed,
    generatedAt: nowIso(),
  };
}

export function getAutoSelectorIntegrityReport(input?: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing";
}): AutoSelectorIntegrityReport {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input?.profileKey || "default");
  const horizon = input?.horizon;
  const now = Date.now();

  const selectorStates = Array.from(store.autoSelectorState.values())
    .filter((row) => row.profileKey === profileKey)
    .filter((row) => (horizon ? row.horizon === horizon : true));

  const switchEvents = store.autoSwitchEvents
    .filter((row) => row.profileKey === profileKey)
    .filter((row) => (horizon ? row.horizon === horizon : true));

  const selectorConfigs = Array.from(store.autoSelectorConfig.values())
    .filter((row) => row.profileKey === profileKey)
    .filter((row) => (horizon ? row.horizon === horizon || row.horizon === "global" : true));

  const recommendationStates = Array.from(store.presetRecommendationState.values())
    .filter((row) => row.profileKey === profileKey)
    .filter((row) => (horizon ? row.horizon === horizon : true));

  const recommendationOverrides = Array.from(store.presetRecommendationOverride.values())
    .filter((row) => row.profileKey === profileKey)
    .filter((row) => (horizon ? row.horizon === horizon || row.horizon === "global" : true));

  const invalidStateTimestamps = selectorStates.filter((row) => Number.isNaN(Date.parse(row.holdUntil))).length;
  const staleOverrides = recommendationOverrides.filter((row) => {
    const expiresAt = Date.parse(row.holdUntil);
    return !Number.isFinite(expiresAt) || expiresAt <= now;
  }).length;

  const highChurnEvents24h = switchEvents.filter((row) => {
    const occurredAt = Date.parse(row.occurredAt);
    return Number.isFinite(occurredAt) && now - occurredAt <= 24 * 60 * 60 * 1000;
  }).filter((row) => row.decision === "switch" || row.decision === "override_set" || row.decision === "override_clear").length;

  const issues: AutoSelectorIntegrityReport["issues"] = [];
  if (invalidStateTimestamps > 0) {
    issues.push({
      id: "invalid_state_timestamps",
      severity: "critical",
      detail: `${invalidStateTimestamps} selector states have invalid holdUntil timestamps.`,
    });
  }
  if (staleOverrides > 0) {
    issues.push({
      id: "stale_overrides",
      severity: staleOverrides >= 3 ? "critical" : "warning",
      detail: `${staleOverrides} recommendation overrides are stale and should be cleaned.`,
    });
  }
  if (highChurnEvents24h >= 40) {
    issues.push({
      id: "high_churn_24h",
      severity: highChurnEvents24h >= 70 ? "critical" : "warning",
      detail: `Observed ${highChurnEvents24h} high-impact switch/override events in 24h (possible instability).`,
    });
  }

  const status: AutoSelectorIntegrityReport["status"] = issues.some((item) => item.severity === "critical")
    ? "critical"
    : issues.length > 0
      ? "watch"
      : "healthy";

  return {
    profileKey,
    horizon: horizon || "all",
    generatedAt: nowIso(),
    status,
    summary: {
      selectorStates: selectorStates.length,
      switchEvents: switchEvents.length,
      selectorConfigs: selectorConfigs.length,
      recommendationStates: recommendationStates.length,
      recommendationOverrides: recommendationOverrides.length,
      staleOverrides,
      invalidStateTimestamps,
      highChurnEvents24h,
    },
    issues,
  };
}

function normalizeSelectorConfigRow(row: AutoSelectorConfigRecord): AutoSelectorConfigRecord {
  const normalizedPreset = normalizePreset(row.preset);
  const normalizedHorizon = row.horizon === "global" ? "global" : row.horizon;
  const baseline = toPresetConfig({
    preset: normalizedPreset,
    horizon: normalizedHorizon,
  });

  return {
    ...row,
    preset: normalizedPreset,
    holdMinutes: Math.max(5, Math.floor(Number(row.holdMinutes) || baseline.holdMinutes)),
    minSwitchEdge: Number.parseFloat(clamp(Number(row.minSwitchEdge) || baseline.minSwitchEdge, 0.005, 0.3).toFixed(4)),
    minSwitchConfidence: Number.parseFloat(clamp(Number(row.minSwitchConfidence) || baseline.minSwitchConfidence, 0.05, 0.99).toFixed(4)),
    warmupMinMatches: Math.max(0, Math.floor(Number(row.warmupMinMatches) || baseline.warmupMinMatches)),
    updatedAt: nowIso(),
  };
}

export function normalizeAutoSelectorConfigs(input?: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing";
}) {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input?.profileKey || "default");
  const horizon = input?.horizon;

  const entries = Array.from(store.autoSelectorConfig.entries()).filter(([, row]) => {
    if (row.profileKey !== profileKey) return false;
    if (!horizon) return true;
    return row.horizon === horizon || row.horizon === "global";
  });

  let normalized = 0;
  for (const [key, row] of entries) {
    const next = normalizeSelectorConfigRow(row);
    const changed = next.preset !== row.preset
      || next.holdMinutes !== row.holdMinutes
      || next.minSwitchEdge !== row.minSwitchEdge
      || next.minSwitchConfidence !== row.minSwitchConfidence
      || next.warmupMinMatches !== row.warmupMinMatches;

    if (changed) {
      store.autoSelectorConfig.set(key, next);
      normalized += 1;
    }
  }

  return {
    profileKey,
    horizon: horizon || "all",
    normalized,
    generatedAt: nowIso(),
  };
}

export function getAutoSelectorIntegrityTrend(input?: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing";
  windowHours?: number;
}): AutoSelectorIntegrityTrend {
  const store = getStore();
  const profileKey = normalizePolicyProfileKey(input?.profileKey || "default");
  const horizon = input?.horizon;
  const windowHours = Math.max(6, Math.min(72, Math.floor(input?.windowHours ?? 24)));

  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const fromMs = now - windowHours * hourMs;

  const buckets = new Map<number, {
    switchEvents: number;
    highImpactEvents: number;
    overrideEvents: number;
  }>();

  for (let i = 0; i < windowHours; i += 1) {
    const bucketStart = fromMs + i * hourMs;
    const normalizedBucket = Math.floor(bucketStart / hourMs) * hourMs;
    buckets.set(normalizedBucket, {
      switchEvents: 0,
      highImpactEvents: 0,
      overrideEvents: 0,
    });
  }

  const rows = store.autoSwitchEvents
    .filter((row) => row.profileKey === profileKey)
    .filter((row) => (horizon ? row.horizon === horizon : true));

  for (const row of rows) {
    const occurredAtMs = Date.parse(row.occurredAt);
    if (!Number.isFinite(occurredAtMs) || occurredAtMs < fromMs || occurredAtMs > now) {
      continue;
    }
    const bucketStart = Math.floor(occurredAtMs / hourMs) * hourMs;
    const bucket = buckets.get(bucketStart);
    if (!bucket) continue;

    bucket.switchEvents += 1;

    const isHighImpact = row.decision === "switch"
      || row.decision === "override_set"
      || row.decision === "override_clear"
      || row.decision === "override_expire";
    if (isHighImpact) {
      bucket.highImpactEvents += 1;
    }

    if (row.decision === "override_set" || row.decision === "override_clear" || row.decision === "override_expire") {
      bucket.overrideEvents += 1;
    }
  }

  const points = Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([bucketStart, bucket]) => {
      const score = Math.max(0, 100 - bucket.switchEvents * 2 - bucket.highImpactEvents * 4 - bucket.overrideEvents * 2);
      const status: AutoSelectorIntegrityTrendPoint["status"] = score >= 85
        ? "healthy"
        : score >= 65
          ? "watch"
          : "critical";
      return {
        bucketStart: new Date(bucketStart).toISOString(),
        switchEvents: bucket.switchEvents,
        highImpactEvents: bucket.highImpactEvents,
        overrideEvents: bucket.overrideEvents,
        score,
        status,
      };
    });

  return {
    profileKey,
    horizon: horizon || "all",
    windowHours,
    generatedAt: nowIso(),
    points,
  };
}

export function runAutoSelectorAutoRemediation(input?: {
  profileKey?: string;
  horizon?: "scalp" | "intraday" | "swing";
}): AutoSelectorAutoRemediation {
  const profileKey = normalizePolicyProfileKey(input?.profileKey || "default");
  const horizon = input?.horizon;

  const cleanup = cleanupExpiredRecommendationOverrides({ profileKey });
  const reset = resetAutoPolicySelector({
    profileKey,
    horizon,
    clearEvents: false,
  });
  const normalized = normalizeAutoSelectorConfigs({
    profileKey,
    horizon,
  });
  const integrity = getAutoSelectorIntegrityReport({
    profileKey,
    horizon,
  });

  return {
    ok: true,
    profileKey,
    horizon: horizon || "all",
    generatedAt: nowIso(),
    actions: {
      expiredOverridesRemoved: cleanup.removed,
      selectorStatesCleared: reset.clearedStates,
      configsNormalized: normalized.normalized,
    },
    integrity,
  };
}
