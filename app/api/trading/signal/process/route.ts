/**
 * POST /api/trading/signal/process
 * Process trading signal and execute bot action
 */

import { NextRequest, NextResponse } from "next/server";

interface TradeSignalRequest {
  symbol: string;
  action: "buy" | "sell" | "hold";
  confidence: number;
  price: number;
  targetPrice: number;
  stopLoss: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: TradeSignalRequest = await request.json();

    // Validate signal
    if (!body.symbol || !body.action || body.confidence === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (body.confidence < 0 || body.confidence > 1) {
      return NextResponse.json(
        { error: "Confidence must be between 0 and 1" },
        { status: 400 },
      );
    }

    // Process signal
    console.log("[TradeHax] Processing signal:", body);

    // TODO: Send to bot for execution
    // bot.processSignal(body)

    return NextResponse.json({
      ok: true,
      signal: body,
      status: "processing",
      message: `Signal for ${body.symbol} is being processed`,
    });
  } catch (error) {
    console.error("Signal processing error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Signal processing failed",
      },
      { status: 500 },
    );
  }
}
