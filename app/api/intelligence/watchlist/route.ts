import {
  listWatchlist,
  removeWatchlistItem,
  upsertWatchlistItem,
} from "@/lib/intelligence/watchlist-store";
import { resolveRequestUserId } from "@/lib/monetization/identity";
import {
  enforceRateLimit,
  enforceTrustedOrigin,
  isJsonContentType,
} from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

type WatchlistMutationRequest = {
  symbol?: string;
  assetType?: "equity" | "crypto";
  minFlowPremiumUsd?: number | string;
  minDarkPoolNotionalUsd?: number | string;
  minCryptoNotionalUsd?: number | string;
  minUnusualScore?: number | string;
  minConfidence?: number | string;
  notes?: string;
  active?: boolean;
  userId?: string;
};

function parseNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "intelligence:watchlist:get",
    max: 90,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const userId = await resolveRequestUserId(
    request,
    request.nextUrl.searchParams.get("userId"),
  );

  return NextResponse.json(
    {
      ok: true,
      userId,
      items: listWatchlist(userId),
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
    keyPrefix: "intelligence:watchlist:post",
    max: 60,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const body = (await request.json()) as WatchlistMutationRequest;
  const userId = await resolveRequestUserId(request, body.userId);

  const result = upsertWatchlistItem(userId, {
    symbol: String(body.symbol || ""),
    assetType: body.assetType === "crypto" ? "crypto" : body.assetType === "equity" ? "equity" : undefined,
    minFlowPremiumUsd: parseNumber(body.minFlowPremiumUsd),
    minDarkPoolNotionalUsd: parseNumber(body.minDarkPoolNotionalUsd),
    minCryptoNotionalUsd: parseNumber(body.minCryptoNotionalUsd),
    minUnusualScore: parseNumber(body.minUnusualScore),
    minConfidence: parseNumber(body.minConfidence),
    notes: typeof body.notes === "string" ? body.notes : undefined,
    active: typeof body.active === "boolean" ? body.active : undefined,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
      },
      { status: 400, headers: rateLimit.headers },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      userId,
      item: result.item,
      items: listWatchlist(userId),
    },
    { headers: rateLimit.headers },
  );
}

export async function DELETE(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }
  if (!isJsonContentType(request)) {
    return NextResponse.json({ ok: false, error: "Expected JSON body." }, { status: 415 });
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "intelligence:watchlist:delete",
    max: 60,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const body = (await request.json()) as {
    symbol?: string;
    assetType?: "equity" | "crypto";
    userId?: string;
  };
  const userId = await resolveRequestUserId(request, body.userId);
  const result = removeWatchlistItem(userId, String(body.symbol || ""), body.assetType);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
      },
      { status: 400, headers: rateLimit.headers },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      userId,
      removed: result.removed,
      items: listWatchlist(userId),
    },
    { headers: rateLimit.headers },
  );
}
