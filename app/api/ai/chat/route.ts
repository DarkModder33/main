import { NextRequest, NextResponse } from "next/server";
import { processNeuralCommand, NeuralQuery } from "@/lib/ai/kernel";
import { checkCredits, deductCredits } from "@/lib/ai/credit-system";
import { getLLMClient } from "@/lib/ai/hf-server";
import { canConsumeFeature, consumeFeatureUsage, tierSupportsNeuralMode } from "@/lib/monetization/engine";
import { resolveRequestUserId } from "@/lib/monetization/identity";
import { enforceRateLimit, enforceTrustedOrigin } from "@/lib/security";

type NeuralTier = "STANDARD" | "UNCENSORED" | "OVERCLOCK" | "HFT_SIGNAL" | "GUITAR_LESSON";

function parseNeuralTier(value: unknown): NeuralTier {
  const normalized = typeof value === "string" ? value.toUpperCase().trim() : "UNCENSORED";
  if (
    normalized === "STANDARD" ||
    normalized === "UNCENSORED" ||
    normalized === "OVERCLOCK" ||
    normalized === "HFT_SIGNAL" ||
    normalized === "GUITAR_LESSON"
  ) {
    return normalized;
  }
  return "UNCENSORED";
}

/**
 * POST /api/ai/chat
 * TradeHax AI Chat Endpoint
 * Supports both single 'message' (Neural Terminal) and 'messages' array (Chat standard)
 */
export async function POST(req: NextRequest) {
  const originBlock = enforceTrustedOrigin(req);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(req, {
    keyPrefix: "ai:chat",
    max: 90,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  try {
    const body = await req.json();
    
    const { 
      message, 
      messages,
      tier = "UNCENSORED", 
      context, 
      userId: requestedUserId,
      systemPrompt 
    } = body;
    const userId = await resolveRequestUserId(req, requestedUserId);
    const neuralTier = parseNeuralTier(tier);

    const inputMessage = message || (messages && messages.length > 0 ? messages[messages.length - 1].content : null);

    if (!inputMessage) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    if (!tierSupportsNeuralMode(userId, neuralTier)) {
      return NextResponse.json(
        {
          error: "TIER_UPGRADE_REQUIRED",
          message: `Your current plan does not include ${neuralTier} mode.`,
        },
        { status: 403, headers: rateLimit.headers },
      );
    }

    const allowance = canConsumeFeature(userId, "ai_chat", 1);
    if (!allowance.allowed) {
      return NextResponse.json(
        {
          error: "USAGE_LIMIT_REACHED",
          message: allowance.reason,
          allowance,
        },
        { status: 429, headers: rateLimit.headers },
      );
    }

    // 1. Credit Gate
    const hasCredits = await checkCredits(userId, neuralTier as any);
    if (!hasCredits) {
      return NextResponse.json({ error: "INSUFFICIENT_CREDITS" }, { status: 402 });
    }

    // Prepare query for kernel
    const query: NeuralQuery = {
      text: inputMessage,
      tier: neuralTier as any,
      context
    };

    // 2. Process using our neural kernel (Middleware/Keyword detection)
    let response = await processNeuralCommand(query);

    // 3. If kernel returns default simulation, try Hugging Face LLM
    if (response.startsWith("AI_RESPONSE: ANALYZING_QUERY")) {
      try {
        const client = getLLMClient();
        let prompt = systemPrompt ? `System: ${systemPrompt}\n\n` : "";
        
        if (messages && Array.isArray(messages)) {
          for (const msg of messages) {
            prompt += `${msg.role}: ${msg.content}\n`;
          }
        } else {
          prompt += `user: ${inputMessage}\n`;
        }
        prompt += "assistant:";

        const hfResponse = await client.generate(prompt);
        response = hfResponse.text;
      } catch (hfError) {
        console.warn("HF LLM Fallback failed, using kernel response:", hfError);
      }
    }

    // 4. Deduct Credits
    await deductCredits(userId, neuralTier as any);
    consumeFeatureUsage(userId, "ai_chat", 1, "api:ai:chat", {
      tier: neuralTier,
    });

    // Simulated latency for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ 
      response,
      message: {
        role: "assistant",
        content: response
      },
      status: "SUCCESS",
      usage: {
        feature: "ai_chat",
        remainingToday: allowance.remainingToday,
      },
      timestamp: new Date().toISOString()
    }, { headers: rateLimit.headers });

  } catch (error: any) {
    console.error("Neural API Error:", error);
    return NextResponse.json({ 
      error: "NEURAL_LINK_FAILURE", 
      details: error.message 
    }, { status: 500 });
  }
}
