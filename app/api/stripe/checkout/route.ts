import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const base = request.nextUrl.clone();
  base.pathname = "/billing";
  base.searchParams.set("provider", "stripe");
  base.searchParams.set("tier", "pro");
  return NextResponse.redirect(base, { status: 307 });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
