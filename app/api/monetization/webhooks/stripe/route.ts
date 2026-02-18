import { isSubscriptionTier } from "@/lib/monetization/plans";
import { cancelSubscriptionAtPeriodEnd, setSubscriptionTier, updateSubscriptionRecord } from "@/lib/monetization/store";
import { BillingProvider } from "@/lib/monetization/types";
import { enforceRateLimit } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

type WebhookPayload = {
  type?: string;
  data?: {
    object?: Record<string, unknown>;
  };
};

function validateWebhookSecret(request: NextRequest) {
  const expected = process.env.TRADEHAX_WEBHOOK_SECRET?.trim();
  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }
  const provided = request.headers.get("x-tradehax-webhook-secret")?.trim();
  return Boolean(provided && provided === expected);
}

function getString(input: unknown) {
  return typeof input === "string" ? input : null;
}

function getMetadataValue(
  object: Record<string, unknown>,
  key: string,
): string | null {
  const metadata = object.metadata;
  if (!metadata || typeof metadata !== "object") {
    return null;
  }
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

function applySubscriptionUpdate(object: Record<string, unknown>, provider: BillingProvider) {
  const explicitUserId =
    getMetadataValue(object, "userId") ?? getString(object.client_reference_id);
  const requestedTier = getMetadataValue(object, "tier");
  const status = getString(object.status);

  if (!explicitUserId) {
    return false;
  }

  const userId = explicitUserId.trim().toLowerCase().slice(0, 64);
  const metadata = {
    eventCustomerId: getString(object.customer) ?? "",
    eventSubscriptionId: getString(object.subscription) ?? "",
  };

  if (requestedTier && isSubscriptionTier(requestedTier)) {
    setSubscriptionTier(userId, requestedTier, provider, metadata);
  }

  if (status) {
    updateSubscriptionRecord(userId, {
      status:
        status === "canceled"
          ? "canceled"
          : status === "past_due"
            ? "past_due"
            : "active",
    });
  }

  return true;
}

export async function POST(request: NextRequest) {
  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "monetization:webhooks:stripe",
    max: 50,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  if (!validateWebhookSecret(request)) {
    return NextResponse.json(
      { ok: false, error: "Invalid webhook secret." },
      { status: 401, headers: rateLimit.headers },
    );
  }

  let payload: WebhookPayload;
  try {
    payload = (await request.json()) as WebhookPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400, headers: rateLimit.headers },
    );
  }

  const eventType = payload.type;
  const object = payload.data?.object;
  if (!eventType || !object) {
    return NextResponse.json(
      { ok: false, error: "Missing event type or data.object." },
      { status: 400, headers: rateLimit.headers },
    );
  }

  switch (eventType) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
      applySubscriptionUpdate(object, "stripe");
      break;
    case "customer.subscription.deleted": {
      const explicitUserId = getMetadataValue(object, "userId");
      if (explicitUserId) {
        cancelSubscriptionAtPeriodEnd(explicitUserId.trim().toLowerCase().slice(0, 64));
        updateSubscriptionRecord(explicitUserId.trim().toLowerCase().slice(0, 64), {
          status: "canceled",
          provider: "stripe",
        });
      }
      break;
    }
    default:
      // Graceful no-op for unrelated events.
      break;
  }

  return NextResponse.json(
    {
      ok: true,
      received: true,
      eventType,
    },
    { headers: rateLimit.headers },
  );
}
