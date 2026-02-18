import { NextRequest, NextResponse } from "next/server";
import { processNeuralCommand, NeuralQuery } from "@/lib/ai/kernel";
import { checkCredits, deductCredits } from "@/lib/ai/credit-system";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, tier = 'UNCENSORED', context, userId = "anonymous" } = body;

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // 1. Credit Gate
    const hasCredits = await checkCredits(userId, tier as any);
    if (!hasCredits) {
      return NextResponse.json({ error: "INSUFFICIENT_CREDITS" }, { status: 402 });
    }

    // Prepare query for kernel
    const query: NeuralQuery = {
      text: message,
      tier: tier as any,
      context
    };

    // Process using our neural kernel
    const response = await processNeuralCommand(query);

    // 2. Deduct Credits
    await deductCredits(userId, tier as any);

    // Simulated latency for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ 
      response,
      status: "SUCCESS",
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Neural API Error:", error);
    return NextResponse.json({ 
      error: "NEURAL_LINK_FAILURE", 
      details: error.message 
    }, { status: 500 });
  }
}
