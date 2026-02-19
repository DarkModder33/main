import { rebuildAndPersistRetrievalSnapshot } from "@/lib/ai/retriever";
import { NextRequest, NextResponse } from "next/server";

function isAuthorizedCronRequest(request: NextRequest) {
  const expected = String(process.env.TRADEHAX_CRON_SECRET || "").trim();
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const vercelCron = request.headers.get("x-vercel-cron");

  if (expected && bearer === expected) {
    return true;
  }
  if (vercelCron === "1") {
    return true;
  }
  return false;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized cron request.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const snapshot = await rebuildAndPersistRetrievalSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("retrieval snapshot cron error", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to generate retrieval snapshot.",
      },
      {
        status: 500,
      },
    );
  }
}
