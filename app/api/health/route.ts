import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "tradehax",
      version: "1.1.1",
      runtime: "nextjs",
      nodeEnv: process.env.NODE_ENV || "unknown",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
