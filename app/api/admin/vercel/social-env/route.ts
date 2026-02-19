import { requireAdminAccess } from "@/lib/admin-access";
import {
    enforceRateLimit,
    enforceTrustedOrigin,
    isJsonContentType,
    sanitizePlainText,
} from "@/lib/security";
import { NextRequest, NextResponse } from "next/server";

type TargetEnv = "production" | "preview" | "development";

type VariableInput = {
  key?: string;
  value?: string;
  target?: string[];
  type?: "plain" | "encrypted" | "sensitive";
};

type RequestBody = {
  variables?: VariableInput[];
};

const ALLOWED_TARGETS: TargetEnv[] = ["production", "preview", "development"];
const DEFAULT_TARGETS: TargetEnv[] = ["production", "preview", "development"];
const KEY_PATTERN = /^[A-Z0-9_]{2,128}$/;

function normalizeTargets(raw: unknown): TargetEnv[] {
  if (!Array.isArray(raw)) {
    return DEFAULT_TARGETS;
  }

  const set = new Set<TargetEnv>();
  for (const item of raw) {
    const normalized = typeof item === "string" ? item.trim().toLowerCase() : "";
    if (normalized === "production" || normalized === "preview" || normalized === "development") {
      set.add(normalized);
    }
  }

  return set.size > 0 ? Array.from(set) : DEFAULT_TARGETS;
}

function normalizeVar(input: VariableInput) {
  const key = sanitizePlainText(String(input.key || "").toUpperCase(), 128);
  if (!KEY_PATTERN.test(key)) {
    return { ok: false as const, error: `Invalid key format: ${key || "(empty)"}` };
  }

  const value = typeof input.value === "string" ? input.value : "";
  if (value.length > 20_000) {
    return { ok: false as const, error: `Value too long for key: ${key}` };
  }

  const type: "plain" | "encrypted" | "sensitive" =
    input.type === "plain" || input.type === "sensitive" ? input.type : "encrypted";
  const target = normalizeTargets(input.target);

  return {
    ok: true as const,
    variable: {
      key,
      value,
      type,
      target,
    },
  };
}

function vercelEnvUrl(projectId: string, teamId?: string) {
  const url = new URL(`https://api.vercel.com/v10/projects/${encodeURIComponent(projectId)}/env`);
  url.searchParams.set("upsert", "true");
  if (teamId) {
    url.searchParams.set("teamId", teamId);
  }
  return url.toString();
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
    keyPrefix: "admin:vercel:social-env",
    max: 20,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  const adminGate = requireAdminAccess(request, rateLimit.headers);
  if (adminGate.response) {
    return adminGate.response;
  }

  const vercelToken = process.env.VERCEL_TOKEN?.trim() || "";
  const vercelProjectId = process.env.VERCEL_PROJECT_ID?.trim() || "";
  const vercelOrgId = process.env.VERCEL_ORG_ID?.trim() || "";

  if (!vercelToken || !vercelProjectId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Server is missing VERCEL_TOKEN or VERCEL_PROJECT_ID.",
      },
      {
        status: 500,
        headers: rateLimit.headers,
      },
    );
  }

  try {
    const body = (await request.json()) as RequestBody;
    const rawVariables = Array.isArray(body.variables) ? body.variables : [];

    if (rawVariables.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "No variables provided.",
        },
        {
          status: 400,
          headers: rateLimit.headers,
        },
      );
    }

    const prepared: Array<{ key: string; value: string; target: TargetEnv[]; type: "plain" | "encrypted" | "sensitive" }> = [];
    for (const input of rawVariables.slice(0, 200)) {
      const normalized = normalizeVar(input);
      if (!normalized.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: normalized.error,
          },
          {
            status: 400,
            headers: rateLimit.headers,
          },
        );
      }
      prepared.push(normalized.variable);
    }

    const url = vercelEnvUrl(vercelProjectId, vercelOrgId || undefined);

    const results: Array<{ key: string; ok: boolean; status: number; error?: string }> = [];

    for (const variable of prepared) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(variable),
      });

      if (!response.ok) {
        let errorText = "Unknown Vercel API error";
        try {
          const payload = (await response.json()) as { error?: { message?: string }; message?: string };
          errorText = payload?.error?.message || payload?.message || errorText;
        } catch {
          // ignore parse issues
        }
        results.push({ key: variable.key, ok: false, status: response.status, error: errorText });
      } else {
        results.push({ key: variable.key, ok: true, status: response.status });
      }
    }

    const failed = results.filter((r) => !r.ok);

    return NextResponse.json(
      {
        ok: failed.length === 0,
        adminMode: adminGate.access.mode,
        synced: results.length - failed.length,
        failed: failed.length,
        results,
      },
      {
        status: failed.length === 0 ? 200 : 207,
        headers: {
          ...rateLimit.headers,
          "X-TradeHax-Admin-Mode": adminGate.access.mode || "unknown",
        },
      },
    );
  } catch (error) {
    console.error("admin vercel social env sync failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected sync failure",
      },
      {
        status: 500,
        headers: rateLimit.headers,
      },
    );
  }
}
