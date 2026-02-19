import {
  enforceRateLimit,
  enforceTrustedOrigin,
  isFiniteNumberInRange,
  isJsonContentType,
  sanitizePlainText,
} from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

type RomUploadRecord = {
  id: string;
  filename: string;
  core: string;
  sizeKb: number;
  uploadedAt: string;
};

const allowedCores = ["nes", "snes", "genesis", "gba", "psx"] as const;

function getRomUploadStore() {
  const globalRef = globalThis as typeof globalThis & {
    __TRADEHAX_ROM_UPLOADS__?: RomUploadRecord[];
  };
  if (!globalRef.__TRADEHAX_ROM_UPLOADS__) {
    globalRef.__TRADEHAX_ROM_UPLOADS__ = [];
  }
  return globalRef.__TRADEHAX_ROM_UPLOADS__;
}

export async function GET(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "game:rom:list",
    max: 120,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const uploads = getRomUploadStore();
  return NextResponse.json(
    {
      ok: true,
      uploads: uploads.slice(-25).reverse(),
    },
    { headers: rateLimit.headers },
  );
}

export async function POST(request: NextRequest) {
  const originBlock = enforceTrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  if (!isJsonContentType(request)) {
    return NextResponse.json({ ok: false, error: "Expected JSON body." }, { status: 415 });
  }

  const rateLimit = enforceRateLimit(request, {
    keyPrefix: "game:rom:upload",
    max: 30,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  try {
    const body = await request.json();
    const filename = sanitizePlainText(String(body?.filename ?? ""), 120);
    const core = sanitizePlainText(String(body?.core ?? ""), 32).toLowerCase();
    const sizeKb = Number(body?.sizeKb);

    if (!filename) {
      return NextResponse.json(
        { ok: false, error: "filename is required." },
        { status: 400, headers: rateLimit.headers },
      );
    }
    if (!allowedCores.includes(core as (typeof allowedCores)[number])) {
      return NextResponse.json(
        { ok: false, error: "Unsupported core." },
        { status: 400, headers: rateLimit.headers },
      );
    }
    if (!isFiniteNumberInRange(sizeKb, 1, 250000)) {
      return NextResponse.json(
        { ok: false, error: "sizeKb must be between 1 and 250000." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const uploads = getRomUploadStore();
    const record: RomUploadRecord = {
      id: `rom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      filename,
      core,
      sizeKb,
      uploadedAt: new Date().toISOString(),
    };
    uploads.push(record);
    if (uploads.length > 300) {
      uploads.splice(0, uploads.length - 300);
    }

    return NextResponse.json(
      {
        ok: true,
        record,
        message: "ROM metadata queued. Core validation passed.",
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("ROM upload metadata error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to queue ROM metadata.",
      },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
