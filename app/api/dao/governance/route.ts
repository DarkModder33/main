import { resolveRequestUserId } from "@/lib/monetization/identity";
import { getDaoProposals, submitDaoVote } from "@/lib/phase03/state";
import {
  enforceRateLimit,
  enforceTrustedOrigin,
  isJsonContentType,
  sanitizePlainText,
} from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "dao:governance:get",
    max: 100,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  return NextResponse.json(
    {
      ok: true,
      proposals: getDaoProposals(),
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
    keyPrefix: "dao:governance:vote",
    max: 40,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  try {
    const body = await request.json();
    const proposalId = sanitizePlainText(String(body?.proposalId ?? ""), 64);
    const vote = sanitizePlainText(String(body?.vote ?? ""), 16).toLowerCase();
    if (!proposalId || (vote !== "for" && vote !== "against")) {
      return NextResponse.json(
        { ok: false, error: "proposalId and vote(for|against) are required." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const userId = await resolveRequestUserId(request, body?.userId);
    const result = submitDaoVote(userId, proposalId, vote);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400, headers: rateLimit.headers },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        proposal: result.proposal,
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("DAO vote error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to process vote.",
      },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
