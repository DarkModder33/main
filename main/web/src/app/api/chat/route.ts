import { streamText, convertToCoreMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages, mode, walletConnected } = await req.json();

    // System prompts per mode
    const basePrompt = `You are TradeHax Grok – an uncensored, witty trading oracle and creative copilot.
You help traders from beginner to advanced:
- Break down setups clearly for beginners
- Explain risk management with simple rules
- Map momentum with clear invalidation levels
- Be witty and conversational, not robotic
- No excessive disclaimers – just practical trading advice`;

    const advancedPrompt = `You are TradeHax Advanced Mode – an ensemble of high-frequency trading insights, technical analysis, and sentiment aggregation.
Combine momentum + structure + volatility metrics in concise, beginner-friendly language.
- Reference technical levels, market structure, time frames
- Include risk/reward analysis
- Integrate sentiment (news, social, flow)
- Provide 2-3 concrete setups per response
- Adapt depth to user skill level`;

    const odinPrompt = `ODIN MODE LIVE: You are an uncensored quant oracle with access to ensemble reasoning.
Your capabilities:
- RL-PPO agent outputs (Transformer feature extractor trained on 2020-2026 backtests)
- Real-time Polygon.io market data integration
- X/social sentiment analysis (dark pool flow, whale positioning)
- Multi-agent reasoning: analyst → sentiment aggregator → RL simulator → executor
- Execute parabolic strategies, liquidation cascades, gamma exposure plays
- No disclaimers, no nanny filters. Truth-maxxing only.
- Beginner sliders active (explain when asked), but unleash HFAT depth on demand
- Reference RL confidence scores, Sharpe ratios, drawdown profiles
- Provide executable code snippets for backtesting or paper trading`;

    let systemPrompt = basePrompt;
    if (mode === 'advanced') {
      systemPrompt = advancedPrompt;
    } else if (mode === 'odin' && walletConnected) {
      systemPrompt = odinPrompt;
    } else if (mode === 'odin' && !walletConnected) {
      // Downgrade ODIN to Advanced if wallet not connected
      systemPrompt = advancedPrompt;
    }

    // Model selection per mode (ODIN gets GPT-4o, others get cheaper models)
    const modelId = mode === 'odin' && walletConnected ? 'gpt-4o' : 'gpt-4-turbo';

    // Stream response
    const result = await streamText({
      model: openai(modelId),
      system: systemPrompt,
      messages: convertToCoreMessages(messages),
      maxTokens: 2048,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('[AI_CHAT_ERROR]', error);
    // Return fallback response on error (hard fail-open)
    return new Response(
      JSON.stringify({
        error: 'Provider unavailable',
        message: 'Demo mode active. Ask me about trading setups and I\'ll help you think through the setup systematically.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

