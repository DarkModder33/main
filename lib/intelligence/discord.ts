import { IntelligenceAlert } from "@/lib/intelligence/types";
import { SubscriptionTier } from "@/lib/monetization/types";

export type IntelligenceDiscordRoute = {
  tier: SubscriptionTier;
  webhookUrl: string;
  channelLabel: string;
  viaFallback: boolean;
};

export type IntelligenceDiscordDispatchResult = {
  ok: boolean;
  route: Omit<IntelligenceDiscordRoute, "webhookUrl"> & { webhookConfigured: boolean };
  deliveredCount: number;
  deliveredAt: string;
  error?: string;
};

function resolveChannelLabel(tier: SubscriptionTier) {
  const value = process.env[`TRADEHAX_DISCORD_CHANNEL_${tier.toUpperCase()}`];
  if (value && value.trim()) {
    return value.trim();
  }
  if (tier === "elite") return "intel-elite";
  if (tier === "pro") return "intel-pro";
  if (tier === "basic") return "intel-basic";
  return "intel-community";
}

function resolveTierWebhook(tier: SubscriptionTier) {
  const direct = process.env[`TRADEHAX_DISCORD_WEBHOOK_${tier.toUpperCase()}`];
  if (direct && direct.trim()) {
    return {
      tier,
      webhookUrl: direct.trim(),
      channelLabel: resolveChannelLabel(tier),
      viaFallback: false,
    } satisfies IntelligenceDiscordRoute;
  }

  const fallback = process.env.TRADEHAX_DISCORD_WEBHOOK;
  if (fallback && fallback.trim()) {
    return {
      tier,
      webhookUrl: fallback.trim(),
      channelLabel: resolveChannelLabel(tier),
      viaFallback: true,
    } satisfies IntelligenceDiscordRoute;
  }

  return null;
}

export function resolveDiscordRouteForTier(tier: SubscriptionTier) {
  const routed = resolveTierWebhook(tier);
  if (routed) return routed;

  return null;
}

function formatAlertLine(alert: IntelligenceAlert) {
  return `- [${alert.severity.toUpperCase()}][${alert.source}] ${alert.symbol}: ${alert.summary}`;
}

function buildDiscordMessage(input: {
  userId: string;
  tier: SubscriptionTier;
  channelLabel: string;
  alerts: IntelligenceAlert[];
}) {
  const lines = input.alerts.slice(0, 15).map(formatAlertLine);
  const remaining = input.alerts.length - lines.length;
  if (remaining > 0) {
    lines.push(`- ...${remaining} additional alerts not shown`);
  }

  return [
    `TradeHax Intelligence Alert Batch`,
    `Tier: ${input.tier}`,
    `Channel: ${input.channelLabel}`,
    `User: ${input.userId}`,
    `Alerts: ${input.alerts.length}`,
    "",
    ...lines,
    "",
    "Open dashboard: https://www.tradehax.net/intelligence/watchlist",
  ].join("\n");
}

export async function dispatchAlertsToDiscord(input: {
  userId: string;
  tier: SubscriptionTier;
  alerts: IntelligenceAlert[];
}): Promise<IntelligenceDiscordDispatchResult> {
  const deliveredAt = new Date().toISOString();
  const route = resolveDiscordRouteForTier(input.tier);

  if (!route) {
    return {
      ok: false,
      route: {
        tier: input.tier,
        channelLabel: resolveChannelLabel(input.tier),
        viaFallback: false,
        webhookConfigured: false,
      },
      deliveredCount: 0,
      deliveredAt,
      error: "No Discord webhook configured for this tier route.",
    };
  }

  if (input.alerts.length === 0) {
    return {
      ok: true,
      route: {
        tier: route.tier,
        channelLabel: route.channelLabel,
        viaFallback: route.viaFallback,
        webhookConfigured: true,
      },
      deliveredCount: 0,
      deliveredAt,
    };
  }

  const content = buildDiscordMessage({
    userId: input.userId,
    tier: input.tier,
    channelLabel: route.channelLabel,
    alerts: input.alerts,
  });

  try {
    const response = await fetch(route.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        route: {
          tier: route.tier,
          channelLabel: route.channelLabel,
          viaFallback: route.viaFallback,
          webhookConfigured: true,
        },
        deliveredCount: 0,
        deliveredAt,
        error: `Discord webhook failed with status ${response.status}.`,
      };
    }

    return {
      ok: true,
      route: {
        tier: route.tier,
        channelLabel: route.channelLabel,
        viaFallback: route.viaFallback,
        webhookConfigured: true,
      },
      deliveredCount: input.alerts.length,
      deliveredAt,
    };
  } catch (error) {
    return {
      ok: false,
      route: {
        tier: route.tier,
        channelLabel: route.channelLabel,
        viaFallback: route.viaFallback,
        webhookConfigured: true,
      },
      deliveredCount: 0,
      deliveredAt,
      error: error instanceof Error ? error.message : "Discord dispatch failed.",
    };
  }
}
