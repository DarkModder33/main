import type { LeaderboardEntry } from "@/lib/game/leaderboard-types";

export const LEADERBOARD_STORAGE_KEY = "hyperborea_leaderboard_v1";
export const UTILITY_POINTS_PER_TOKEN_UNIT = 25;

export function stripSensitiveLeaderboardFields(entry: LeaderboardEntry): LeaderboardEntry {
  const { oauthProvider, oauthUserId, ...rest } = entry;
  return {
    ...(rest as LeaderboardEntry),
    oauthProvider: undefined,
    oauthUserId: undefined,
  };
}

export function createSessionId() {
  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatElapsed(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function sortLeaderboard(entries: LeaderboardEntry[]) {
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
  });
}