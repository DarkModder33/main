import { getUserSnapshot, parseTierOrDefault, setTierForUser } from "@/lib/monetization/engine";
import { resolveRequestUserId } from "@/lib/monetization/identity";
import {
    cancelSubscriptionAtPeriodEnd,
    reactivateSubscription,
    updateSubscriptionRecord,
} from "@/lib/monetization/store";
import { BillingProvider } from "@/lib/monetization/types";
import { enforceRateLimit, enforceTrustedOrigin, isJsonContentType } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

type SubscriptionAction = "set-tier" | "cancel" | "reactivate";

function parseProvider(value: unknown): BillingProvider {
  if (
    value === "stripe" ||
    value === "coinbase" ||
    value === "paypal" ||
    value === "square" ||
    value === "venmo" ||
    value === "cashapp" ||
    value === "ebay" ||
    value === "crypto" ||
    value === "none"
  ) {
    return value;
  }
  return "none";
}

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "monetization:subscription:get",
    max: 80,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const requestedUserId = request.nextUrl.searchParams.get("userId");
  const userId = await resolveRequestUserId(request, requestedUserId);
  return NextResponse.json(
    {
      ok: true,
      snapshot: getUserSnapshot(userId),
    },
    { headers: rateLimit.headers },
  );
}

export async function POST(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  if (!isJsonContentType(request)) {
    return NextResponse.json({ ok: false, error: "Expected JSON body." }, { status: 415 });
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "monetization:subscription:post",
    max: 40,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  try {
    const body = await request.json();
    const action: SubscriptionAction = body?.action;
    const userId = await resolveRequestUserId(request, body?.userId);

    if (action === "set-tier") {
      const tier = parseTierOrDefault(body?.tier, "free");
      const provider = parseProvider(body?.provider);
      const metadata =
        body?.metadata && typeof body.metadata === "object"
          ? (body.metadata as Record<string, string>)
          : undefined;

      setTierForUser(userId, tier, provider, metadata);
    } else if (action === "cancel") {
      cancelSubscriptionAtPeriodEnd(userId);
    } else if (action === "reactivate") {
      reactivateSubscription(userId);
    } else {
      return NextResponse.json(
        { ok: false, error: "Invalid action. Use set-tier, cancel, or reactivate." },
        { status: 400 },
      );
    }

    if (typeof body?.status === "string") {
      updateSubscriptionRecord(userId, {
        status: body.status,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        snapshot: getUserSnapshot(userId),
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Subscription update failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to update subscription.",
      },
      { status: 500 },
    );
  }
}
