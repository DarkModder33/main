import { type NextRequest } from 'next/server';
import { generateEnsembleSignal } from '../trading/rl-engine';
import { getRealtimeData } from '../data/polygon/route';

export interface CopyTradeSignal {
  id: string;
  ticker: string;
  action: 'buy' | 'sell';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  positionSize: number;
  confidence: number;
  timestamp: number;
  backtestAccuracy: number;
  performanceFeePercentage: number;
  copiers: number;
  roi?: number;
}

// In-memory signal storage (use Supabase for production)
const signals: Map<string, CopyTradeSignal[]> = new Map();

/**
 * Generate copy-trade signal from ODIN analysis
 * Signals are published to marketplace for users to copy
 * TradeHax takes 5% performance fee on gains
 */
export async function generateCopyTradeSignal(
  ticker: string,
  mode: 'beginner' | 'advanced' | 'hfat' = 'advanced'
): Promise<CopyTradeSignal> {
  const data = await getRealtimeData(ticker, 30);
  if (data.length < 2) {
    throw new Error(`Insufficient data for ${ticker}`);
  }

  const signal = generateEnsembleSignal(data, ticker);
  const latest = data[data.length - 1];

  const copyTradeSignal: CopyTradeSignal = {
    id: `${ticker}-${Date.now()}`,
    ticker,
    action: signal.action,
    entryPrice: latest.close,
    targetPrice: signal.targetPrice,
    stopLoss: signal.stopLoss,
    positionSize: signal.positionSize,
    confidence: signal.confidence,
    timestamp: Date.now(),
    backtestAccuracy: signal.backtestAccuracy || 0.72,
    performanceFeePercentage: 5, // TradeHax cut
    copiers: 0,
    roi: undefined,
  };

  // Store signal
  if (!signals.has(ticker)) {
    signals.set(ticker, []);
  }
  signals.get(ticker)!.push(copyTradeSignal);

  return copyTradeSignal;
}

/**
 * Get active copy-trade signals for marketplace
 */
export async function getActiveSignals(
  limit: number = 50
): Promise<CopyTradeSignal[]> {
  const allSignals: CopyTradeSignal[] = [];

  for (const tickerSignals of signals.values()) {
    // Only return signals from last 24 hours
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    allSignals.push(
      ...tickerSignals.filter((s) => s.timestamp > dayAgo && s.action !== 'hold')
    );
  }

  // Sort by confidence descending
  return allSignals.sort((a, b) => b.confidence - a.confidence).slice(0, limit);
}

/**
 * Track copy-trade performance for fee calculation
 */
export function updateSignalROI(
  signalId: string,
  entryPrice: number,
  currentPrice: number,
  action: 'buy' | 'sell'
): number {
  let roi = 0;
  if (action === 'buy') {
    roi = ((currentPrice - entryPrice) / entryPrice) * 100;
  } else {
    roi = ((entryPrice - currentPrice) / entryPrice) * 100;
  }
  return roi;
}

/**
 * Calculate performance fee
 * 5% of net gains, only when profitable
 */
export function calculatePerformanceFee(
  roi: number,
  positionSize: number,
  accountSize: number = 10000
): number {
  if (roi <= 0) return 0; // No fee if loss

  const positionValue = (accountSize * positionSize) / 100;
  const gain = positionValue * (roi / 100);
  const fee = gain * 0.05; // 5% of gains

  return fee;
}

// API Routes

export async function POST(req: NextRequest) {
  const { action, ticker, mode = 'advanced' } = await req.json();

  if (action === 'generate') {
    try {
      const signal = await generateCopyTradeSignal(ticker, mode);
      return Response.json({
        success: true,
        signal,
        message: `Copy-trade signal published for ${ticker}. Traders can now mirror this position.`,
      });
    } catch (error) {
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }
  }

  if (action === 'getActive') {
    const activeSignals = await getActiveSignals(50);
    return Response.json({
      success: true,
      signals: activeSignals,
      totalAvailable: activeSignals.length,
    });
  }

  if (action === 'updateROI') {
    const { signalId, entryPrice, currentPrice } = await req.json();
    const signal = Array.from(signals.values())
      .flat()
      .find((s) => s.id === signalId);

    if (!signal) {
      return Response.json(
        { success: false, error: 'Signal not found' },
        { status: 404 }
      );
    }

    const roi = updateSignalROI(signalId, entryPrice, currentPrice, signal.action);
    signal.roi = roi;

    const fee = calculatePerformanceFee(roi, signal.positionSize);

    return Response.json({
      success: true,
      roi,
      performanceFee: fee,
      message: `ROI: ${roi.toFixed(2)}% | Performance fee (5% of gains): $${fee.toFixed(2)}`,
    });
  }

  return Response.json(
    { success: false, error: 'Invalid action' },
    { status: 400 }
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'getActive';

  if (action === 'getActive') {
    const activeSignals = await getActiveSignals(50);
    return Response.json({
      success: true,
      signals: activeSignals,
      totalAvailable: activeSignals.length,
      timestamp: new Date().toISOString(),
    });
  }

  return Response.json(
    { success: false, error: 'Invalid action' },
    { status: 400 }
  );
}

