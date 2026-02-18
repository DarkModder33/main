import { parseTierOrDefault, setTierForUser } from "@/lib/monetization/engine";
import { resolveRequestUserId } from "@/lib/monetization/identity";
import { BillingCycle, BillingProvider, SubscriptionTier } from "@/lib/monetization/types";
import { enforceRateLimit, enforceTrustedOrigin, isJsonContentType } from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

function parseProvider(value: unknown): BillingProvider {
  if (value === "stripe" || value === "coinbase") {
    return value;
  }
  return "stripe";
}

function parseCycle(value: unknown): BillingCycle {
  if (value === "yearly") {
    return "yearly";
  }
  return "monthly";
}

function getCheckoutUrlFromEnv(
  provider: BillingProvider,
  tier: SubscriptionTier,
  cycle: BillingCycle,
) {
  const providerPrefix = provider.toUpperCase();
  const tierPrefix = tier.toUpperCase();
  const cyclePrefix = cycle.toUpperCase();

  const keys = [
    `TRADEHAX_${providerPrefix}_CHECKOUT_URL_${tierPrefix}_${cyclePrefix}`,
    `TRADEHAX_${providerPrefix}_CHECKOUT_URL_${tierPrefix}`,
    `TRADEHAX_${providerPrefix}_CHECKOUT_URL`,
  ];

  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }
  return null;
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
    keyPrefix: "monetization:checkout",
    max: 30,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  try {
    const body = await request.json();
    const tier = parseTierOrDefault(body?.tier, "pro");
    const provider = parseProvider(body?.provider);
    const billingCycle = parseCycle(body?.billingCycle);
    const userId = await resolveRequestUserId(request, body?.userId);
    const checkoutUrl = getCheckoutUrlFromEnv(provider, tier, billingCycle);

    if (checkoutUrl) {
      return NextResponse.json(
        {
          ok: true,
          simulated: false,
          checkoutUrl,
          checkoutReference: `chk_${Date.now().toString(36)}`,
          provider,
          tier,
          billingCycle,
          userId,
        },
        { headers: rateLimit.headers },
      );
    }

    const allowSimulation =
      process.env.TRADEHAX_ALLOW_PAYMENT_SIMULATION === "true" ||
      process.env.NODE_ENV !== "production";

    if (!allowSimulation) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Checkout URL is not configured for this provider/tier. Set TRADEHAX_*_CHECKOUT_URL env vars.",
        },
        { status: 503, headers: rateLimit.headers },
      );
    }

    setTierForUser(userId, tier, provider, {
      source: "simulated_checkout",
      billingCycle,
    });

    return NextResponse.json(
      {
        ok: true,
        simulated: true,
        checkoutUrl: `/billing?checkout=simulated&tier=${tier}&provider=${provider}`,
        checkoutReference: `sim_${Date.now().toString(36)}`,
        provider,
        tier,
        billingCycle,
        userId,
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to initialize checkout.",
      },
      { status: 500 },
    );
  }
}
