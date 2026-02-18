/**
 * POST /api/environment/update-context
 * Update market data and context for smart environment
 */

import { NextRequest, NextResponse } from "next/server";

interface ContextUpdateRequest {
  sessionId: string;
  marketData?: {
    symbol: string;
    price: number;
    change24h: number;
  }[];
  interaction?: {
    prompt: string;
    response: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ContextUpdateRequest = await request.json();

    if (!body.sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 },
      );
    }

    // TODO: Update actual environment state
    console.log("[Environment] Updating context for session:", body.sessionId);

    if (body.marketData) {
      console.log("[Environment] Market data update:", body.marketData);
    }

    if (body.interaction) {
      console.log(
        "[Environment] Recording interaction:",
        body.interaction.prompt,
      );
    }

    return NextResponse.json({
      ok: true,
      sessionId: body.sessionId,
      updated: {
        marketData: body.marketData?.length || 0,
        interactions: body.interaction ? 1 : 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Context update error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Update failed",
      },
      { status: 500 },
    );
  }
}
