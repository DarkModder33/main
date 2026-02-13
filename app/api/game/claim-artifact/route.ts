import type { ArtifactCollectionEvent } from "@/lib/game/level-types";
import { NextResponse } from "next/server";

function isArtifactCollectionEvent(value: unknown): value is ArtifactCollectionEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<ArtifactCollectionEvent>;
  return (
    typeof event.eventId === "string" &&
    typeof event.sessionId === "string" &&
    typeof event.levelId === "string" &&
    typeof event.artifactId === "string" &&
    typeof event.artifactName === "string" &&
    typeof event.tokenRewardUnits === "number" &&
    typeof event.claimEndpoint === "string" &&
    typeof event.web5Collection === "string"
  );
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!isArtifactCollectionEvent(payload)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid artifact claim payload.",
        },
        { status: 400 },
      );
    }

    const claimId = `claim-${crypto.randomUUID()}`;
    return NextResponse.json({
      ok: true,
      claimId,
      queuedAt: new Date().toISOString(),
      settlement: {
        status: "queued",
        mode: "web5-preclaim",
        networkHint: "l2-staging",
      },
      claimRecord: {
        levelId: payload.levelId,
        artifactId: payload.artifactId,
        tokenUnits: payload.tokenRewardUnits,
        collection: payload.web5Collection,
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to process artifact claim payload.",
      },
      { status: 500 },
    );
  }
}
