import { streamText, convertToCoreMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';
import { generateEnsembleSignal } from '../trading/rl-engine';
import { getRealtimeData, analyzeParabolic } from '../data/polygon/route';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Tool definitions for ODIN mode
const tradingTools = [
  {
    name: 'analyze_ticker',
    description: 'Analyze a stock ticker with real-time Polygon data and RL model',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Stock ticker symbol (e.g., AAPL, NVDA)',
        },
        daysBack: {
          type: 'number',
          description: 'Number of days of historical data (default 30)',
        },
      },
      required: ['ticker'],
    },
  },
  {
    name: 'parabolic_mode',
    description: 'Deploy Parabolic Mode strategy with risk slider',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Stock ticker symbol',
        },
        riskLevel: {
          type: 'number',
          description: 'Risk level 1-10 (1=conservative, 10=aggressive)',
        },
      },
      required: ['ticker'],
    },
  },
];

async function handleAnalyzeTicker(ticker: string, daysBack: number = 30): Promise<string> {
  try {
    const data = await getRealtimeData(ticker, daysBack);
    if (data.length === 0) {
      return `No data found for ${ticker}`;
    }

    const signal = generateEnsembleSignal(data, ticker);
    const latest = data[data.length - 1];

    return JSON.stringify(
      {
        ticker,
        timestamp: new Date().toISOString(),
        currentPrice: latest.close,
        sma20: latest.sma20,
        sma50: latest.sma50,
        rsi: latest.rsi,
        atr: latest.atr,
        signal: {
          action: signal.action,
          confidence: `${(signal.confidence * 100).toFixed(1)}%`,
          targetPrice: signal.targetPrice.toFixed(2),
          stopLoss: signal.stopLoss.toFixed(2),
          positionSize: `${signal.positionSize.toFixed(1)}%`,
          reasoning: signal.reasoning,
          backtestAccuracy: `${(signal.backtestAccuracy! * 100).toFixed(1)}%`,
        },
      },
      null,
      2
    );
  } catch (error) {
    return `Error analyzing ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function handleParabolicMode(ticker: string, riskLevel: number = 5): Promise<string> {
  try {
    const result = await analyzeParabolic(ticker, riskLevel);

    return JSON.stringify(
      {
        ticker,
        strategy: 'PARABOLIC MODE',
        riskLevel,
        entry: result.entry.toFixed(2),
        target: result.target.toFixed(2),
        stop: result.stop.toFixed(2),
        positionSize: `${result.positionSize.toFixed(1)}% of account`,
        riskReward: `${result.riskReward}:1`,
        confidence: `${(result.confidence * 100).toFixed(1)}%`,
        instruction:
          'Parabolic Mode activated. Use OCO (One-Cancels-Other) orders. Entry at current market, target and stop as shown. Paper trade first!',
      },
      null,
      2
    );
  } catch (error) {
    return `Error deploying Parabolic Mode: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
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

    const odinPrompt = `ODIN MODE LIVE: You are an uncensored quant oracle with ensemble RL trading supremacy.
Your capabilities:
- RL-PPO agent with Transformer feature extractor (trained on 2020-2026 data)
- Real-time Polygon.io market data (OHLCV, technical indicators)
- DRL directional accuracy >70% on volatile assets
- Multi-agent reasoning: RL policy → technical analysis → sentiment aggregation
- Parabolic Mode for beginners (risk slider 1-10)
- Advanced multi-leg strategies (spreads, cascades, gamma plays)
- Use tools: analyze_ticker, parabolic_mode
- Provide backtest accuracy, Sharpe metrics, win-rate expectations
- No disclaimers, raw conviction. Truth-maxxing only.`;

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

    // Tools only available in ODIN mode with wallet
    const tools = mode === 'odin' && walletConnected ? tradingTools : [];

    // Check for tool use patterns in messages
    let enhancedMessages = messages;
    if (mode === 'odin' && walletConnected) {
      // Look for ticker mentions or trading commands
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage?.content &&
        (lastMessage.content.includes('analyze') ||
          lastMessage.content.includes('Parabolic') ||
          lastMessage.content.match(/\b[A-Z]{1,5}\b/))
      ) {
        // Inject instruction to use tools
        enhancedMessages = [
          ...messages.slice(0, -1),
          {
            ...lastMessage,
            content: `${lastMessage.content}\n\n[Use analyze_ticker or parabolic_mode tools if ticker mentioned]`,
          },
        ];
      }
    }

    // Stream response
    const result = await streamText({
      model: openai(modelId),
      system: systemPrompt,
      messages: convertToCoreMessages(enhancedMessages),
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

