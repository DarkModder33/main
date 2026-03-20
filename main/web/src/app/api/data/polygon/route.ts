import { RESTClient } from '@polygon.io/client-js';
import { type NextRequest } from 'next/server';

const apiKey = process.env.POLYGON_API_KEY;

interface PolygonAgg {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  n?: number;
}

interface MarketData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  sma20?: number;
  sma50?: number;
  rsi?: number;
  atr?: number;
}

export async function getRealtimeData(
  ticker: string,
  daysBack: number = 30
): Promise<MarketData[]> {
  try {
    const client = new RESTClient({
      apiKey: apiKey || '',
    });

    const now = new Date();
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const response = await client.stocks.aggregates(ticker, 1, 'day', {
      from: startDate.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0],
      adjusted: true,
      sort: 'asc',
      limit: 50000,
    });

    if (!response.results) return [];

    // Calculate technical indicators
    const data = response.results as PolygonAgg[];
    const closes = data.map((d) => d.close);

    // SMA 20 & 50
    const sma20Values = calculateSMA(closes, 20);
    const sma50Values = calculateSMA(closes, 50);

    // RSI
    const rsiValues = calculateRSI(closes, 14);

    // ATR
    const atrValues = calculateATR(data, 14);

    return data.map((d, i) => ({
      timestamp: Math.floor(d.timestamp / 1000),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
      vwap: d.vwap,
      sma20: sma20Values[i],
      sma50: sma50Values[i],
      rsi: rsiValues[i],
      atr: atrValues[i],
    }));
  } catch (error) {
    console.error('[POLYGON_DATA_ERROR]', error);
    return [];
  }
}

function calculateSMA(closes: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else {
      const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

function calculateRSI(closes: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  const deltas = [];

  for (let i = 1; i < closes.length; i++) {
    deltas.push(closes[i] - closes[i - 1]);
  }

  for (let i = 0; i < deltas.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else {
      const gains = deltas
        .slice(i - period + 1, i + 1)
        .filter((d) => d > 0)
        .reduce((a, b) => a + b, 0);
      const losses = Math.abs(
        deltas
          .slice(i - period + 1, i + 1)
          .filter((d) => d < 0)
          .reduce((a, b) => a + b, 0)
      );

      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgGain / (avgLoss || 0.0001);
      result.push(100 - 100 / (1 + rs));
    }
  }

  result.unshift(undefined);
  return result;
}

function calculateATR(
  data: PolygonAgg[],
  period: number
): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  const trValues = [];

  for (let i = 0; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const close = i > 0 ? data[i - 1].close : data[i].close;

    const tr = Math.max(high - low, Math.abs(high - close), Math.abs(low - close));
    trValues.push(tr);
  }

  for (let i = 0; i < trValues.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else {
      const avg = trValues.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      result.push(avg);
    }
  }

  return result;
}

export async function analyzeParabolic(
  ticker: string,
  riskLevel: number = 5
): Promise<{
  entry: number;
  target: number;
  stop: number;
  positionSize: number;
  riskReward: number;
  confidence: number;
}> {
  const data = await getRealtimeData(ticker, 30);
  if (data.length < 2) {
    return {
      entry: 0,
      target: 0,
      stop: 0,
      positionSize: 0,
      riskReward: 0,
      confidence: 0,
    };
  }

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];

  // Parabolic logic
  const atr = latest.atr || 0;
  const sma20 = latest.sma20 || latest.close;
  const sma50 = latest.sma50 || latest.close;
  const rsi = latest.rsi || 50;

  // Trend detection
  const isBullish = sma20 > sma50 && rsi > 50;

  // Entry: current close (momentum filter)
  const entry = latest.close;

  // Target: 3R reward (3x risk)
  const stop = entry - atr * 1.5;
  const risk = entry - stop;
  const target = entry + risk * 3;

  // Position size based on risk level (1-10)
  const basePosSize = (riskLevel / 10) * 100; // % of account
  const positionSize = Math.min(basePosSize, 50); // cap at 50%

  return {
    entry,
    target,
    stop,
    positionSize,
    riskReward: 3,
    confidence: isBullish ? 0.7 : 0.5,
  };
}

// API Handler
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker') || 'AAPL';
  const daysBack = parseInt(searchParams.get('days') || '30');

  const data = await getRealtimeData(ticker, daysBack);

  return Response.json({
    ticker,
    data: data.slice(-30), // last 30 days
    latest: data[data.length - 1],
  });
}

