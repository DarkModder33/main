import { NextRequest, NextResponse } from "next/server";
import { processNeuralCommand, NeuralQuery } from "@/lib/ai/kernel";
import { checkCredits, deductCredits } from "@/lib/ai/credit-system";
import { getLLMClient } from "@/lib/ai/hf-server";

/**
 * POST /api/ai/chat
 * TradeHax AI Chat Endpoint
 * Supports both single 'message' (Neural Terminal) and 'messages' array (Chat standard)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { 
      message, 
      messages,
      tier = 'UNCENSORED', 
      context, 
      userId = "anonymous",
      systemPrompt 
    } = body;

    const inputMessage = message || (messages && messages.length > 0 ? messages[messages.length - 1].content : null);

    if (!inputMessage) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // 1. Credit Gate
    const hasCredits = await checkCredits(userId, tier as any);
    if (!hasCredits) {
      return NextResponse.json({ error: "INSUFFICIENT_CREDITS" }, { status: 402 });
    }

    // Prepare query for kernel
    const query: NeuralQuery = {
      text: inputMessage,
      tier: tier as any,
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
    await deductCredits(userId, tier as any);

    // Simulated latency for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ 
      response,
      message: {
        role: "assistant",
        content: response
      },
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
