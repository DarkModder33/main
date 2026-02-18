import {
  AllowanceResult,
  BillingProvider,
  MonetizationSnapshot,
  SubscriptionTier,
  UsageFeature,
} from "@/lib/monetization/types";
import { getPlanDefinition, getFeatureDailyLimit, isSubscriptionTier } from "@/lib/monetization/plans";
import {
  getSubscription,
  getUsageCountForToday,
  getUsageSummaryForUser,
  recordUsageEvent,
  setSubscriptionTier,
} from "@/lib/monetization/store";

export function getUserSnapshot(userId: string): MonetizationSnapshot {
  const subscription = getSubscription(userId);
  return {
    userId,
    subscription,
    plan: getPlanDefinition(subscription.tier),
    usage: getUsageSummaryForUser(userId),
  };
}

export function canConsumeFeature(
  userId: string,
  feature: UsageFeature,
  requestedUnits = 1,
): AllowanceResult {
  const subscription = getSubscription(userId);
  const dailyLimit = getFeatureDailyLimit(subscription.tier, feature);
  const usedToday = getUsageCountForToday(userId, feature);
  const normalizedUnits = Math.max(1, Math.floor(requestedUnits));
  const remainingToday = Math.max(0, dailyLimit - usedToday);

  if (dailyLimit <= 0) {
    return {
      allowed: false,
      feature,
      requestedUnits: normalizedUnits,
      usedToday,
      dailyLimit,
      remainingToday,
      reason: "Feature is not included in current tier.",
    };
  }

  if (usedToday + normalizedUnits > dailyLimit) {
    return {
      allowed: false,
      feature,
      requestedUnits: normalizedUnits,
      usedToday,
      dailyLimit,
      remainingToday,
      reason: "Daily usage limit reached for this feature.",
    };
  }

  return {
    allowed: true,
    feature,
    requestedUnits: normalizedUnits,
    usedToday,
    dailyLimit,
    remainingToday: dailyLimit - (usedToday + normalizedUnits),
  };
}

export function consumeFeatureUsage(
  userId: string,
  feature: UsageFeature,
  units = 1,
  source = "unknown",
  metadata?: Record<string, string>,
) {
  return recordUsageEvent(userId, feature, units, source, metadata);
}

export function tierSupportsNeuralMode(
  userId: string,
  neuralTier: "STANDARD" | "UNCENSORED" | "OVERCLOCK" | "HFT_SIGNAL" | "GUITAR_LESSON",
) {
  const subscription = getSubscription(userId);
  const entitlements = getPlanDefinition(subscription.tier).entitlements;

  if (neuralTier === "UNCENSORED") {
    return entitlements.uncensoredAi;
  }
  if (neuralTier === "OVERCLOCK" || neuralTier === "HFT_SIGNAL") {
    return entitlements.overclockAi;
  }
  return true;
}

export function setTierForUser(
  userId: string,
  tier: SubscriptionTier,
  provider: BillingProvider,
  metadata?: Record<string, string>,
) {
  return setSubscriptionTier(userId, tier, provider, metadata);
}

export function parseTierOrDefault(value: unknown, fallback: SubscriptionTier = "free") {
  return isSubscriptionTier(value) ? value : fallback;
}
