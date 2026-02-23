import {
    enforceRateLimit,
    enforceTrustedOrigin,
    isJsonContentType,
    sanitizePlainText,
} from '@/lib/security';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type TournamentEntry = {
  did: string;
  alias: string;
  joinedAt: string;
  wagerLamports: number;
  mode: 'simulation' | 'live';
};

type TournamentPayload = {
  did?: unknown;
  alias?: unknown;
  roomId?: unknown;
  wagerLamports?: unknown;
  mode?: unknown;
};

const ROOM_CAPACITY = 4;

const tournamentStore = (() => {
  const globalRef = globalThis as typeof globalThis & {
    __TRADEHAX_SPADES_TOURNAMENTS__?: Map<string, TournamentEntry[]>;
  };

  if (!globalRef.__TRADEHAX_SPADES_TOURNAMENTS__) {
    globalRef.__TRADEHAX_SPADES_TOURNAMENTS__ = new Map();
  }

  return globalRef.__TRADEHAX_SPADES_TOURNAMENTS__;
})();

function normalizeMode(mode: unknown): 'simulation' | 'live' {
  const value = typeof mode === 'string' ? mode.trim().toLowerCase() : '';
  return value === 'live' ? 'live' : 'simulation';
}

function normalizeWagerLamports(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  return 0;
}

export async function GET(request: NextRequest) {
  const originViolation = enforceTrustedOrigin(request);
  if (originViolation) {
    return originViolation;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: 'spades:tournament:status',
    max: 90,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const roomId = sanitizePlainText(
    request.nextUrl.searchParams.get('roomId') || 'tradehax-spades-alpha',
    72,
  );

  const entries = tournamentStore.get(roomId) || [];

  return NextResponse.json(
    {
      ok: true,
      roomId,
      players: entries.map((entry) => ({
        did: entry.did,
        alias: entry.alias,
      })),
      count: entries.length,
      capacity: ROOM_CAPACITY,
      potLamports: entries.reduce((sum, entry) => sum + entry.wagerLamports, 0),
    },
    { headers: rateLimit.headers },
  );
}

export async function POST(request: NextRequest) {
  const originViolation = enforceTrustedOrigin(request);
  if (originViolation) {
    return originViolation;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: 'spades:tournament:join',
    max: 30,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  if (!isJsonContentType(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Expected JSON request body.',
      },
      {
        status: 415,
        headers: rateLimit.headers,
      },
    );
  }

  try {
    const payload = (await request.json()) as TournamentPayload;

    const did = sanitizePlainText(String(payload.did ?? ''), 160);
    const alias = sanitizePlainText(String(payload.alias ?? ''), 48) || 'NeuralSpadesPlayer';
    const roomId =
      sanitizePlainText(String(payload.roomId ?? 'tradehax-spades-alpha'), 72) ||
      'tradehax-spades-alpha';
    const wagerLamports = normalizeWagerLamports(payload.wagerLamports);
    const mode = normalizeMode(payload.mode);

    if (!did) {
      return NextResponse.json(
        {
          ok: false,
          error: 'DID is required to enter the tournament.',
        },
        {
          status: 400,
          headers: rateLimit.headers,
        },
      );
    }

    const roomEntries = tournamentStore.get(roomId) || [];
    const alreadyJoined = roomEntries.some((entry) => entry.did === did);

    if (!alreadyJoined && roomEntries.length >= ROOM_CAPACITY) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Tournament room is full. Please join another room.',
        },
        {
          status: 409,
          headers: rateLimit.headers,
        },
      );
    }

    if (!alreadyJoined) {
      roomEntries.push({
        did,
        alias,
        joinedAt: new Date().toISOString(),
        wagerLamports,
        mode,
      });
      tournamentStore.set(roomId, roomEntries);
    }

    return NextResponse.json(
      {
        ok: true,
        roomId,
        players: roomEntries.map((entry) => ({ did: entry.did, alias: entry.alias })),
        capacity: ROOM_CAPACITY,
        potLamports: roomEntries.reduce((sum, entry) => sum + entry.wagerLamports, 0),
      },
      {
        headers: rateLimit.headers,
      },
    );
  } catch (error) {
    console.error('[spades] tournament join failed', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Unable to process tournament join request right now.',
      },
      {
        status: 500,
        headers: rateLimit.headers,
      },
    );
  }
}
