/**
 * POST /api/trading/bot/create
 * Create a new TradeHax bot
 */

import { getLLMClient } from "@/lib/ai/hf-server";
import { NextRequest, NextResponse } from "next/server";

interface CreateBotRequest {
  name: string;
  strategy: "scalping" | "swing" | "long-term" | "arbitrage";
  riskLevel: "low" | "medium" | "high";
  allocatedCapital: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateBotRequest = await request.json();

    // Validate input
    if (!body.name || !body.strategy || !body.riskLevel || !body.allocatedCapital) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (body.allocatedCapital < 0.1 || body.allocatedCapital > 1000) {
      return NextResponse.json(
        { error: "Allocated capital must be between 0.1 and 1000 SOL" },
        { status: 400 },
      );
    }

    // Create bot (would save to database)
    const botId = `bot-${Date.now()}`;
    const bot = {
      id: botId,
      name: body.name,
      strategy: body.strategy,
      riskLevel: body.riskLevel,
      allocatedCapital: body.allocatedCapital,
      enabled: true,
      executedTrades: 0,
      profitLoss: 0,
      winRate: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // TODO: Save to database (Firebase, PostgreSQL, etc.)

    return NextResponse.json({
      ok: true,
      bot,
      message: `Bot "${body.name}" created successfully`,
    });
  } catch (error) {
    console.error("Bot creation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Bot creation failed",
      },
      { status: 500 },
    );
  }
}
