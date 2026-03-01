import fs from "node:fs";
import path from "node:path";

import { getAiTokenConnections, resolveHfApiToken } from "@/lib/ai/env-tokens";
import { getBehaviorIngestionSummary } from "@/lib/ai/data-ingestion";
import { getLiveIngestionStatus } from "@/lib/intelligence/live-ingestion";
import { getIntelligenceProviderStatus } from "@/lib/intelligence/provider";

export type HivemindDatasetHealth = {
  name: string;
  filePath: string;
  exists: boolean;
  bytes: number;
  rows: number;
  parseableJsonlRows: number;
  malformedRows: number;
  lastModifiedAt?: string;
};

export type HivemindReadiness = {
  ok: boolean;
  generatedAt: string;
  legacyAccountId: string;
  retentionDays: number;
  minTrainingRows: number;
  tokens: {
    hfConfigured: boolean;
    providers: ReturnType<typeof getAiTokenConnections>;
  };
  behavior: ReturnType<typeof getBehaviorIngestionSummary>;
  datasets: HivemindDatasetHealth[];
  totals: {
    datasetRows: number;
    malformedRows: number;
    healthyDatasets: number;
  };
  issues: string[];
};

function nowIso() {
  return new Date().toISOString();
}

function resolveRetentionDays() {
  const parsed = Number.parseInt(String(process.env.TRADEHAX_HIVEMIND_DATA_RETENTION_DAYS || "36500"), 10);
  if (!Number.isFinite(parsed)) return 36_500;
  return Math.min(100_000, Math.max(30, parsed));
}

function resolveMinTrainingRows() {
  const parsed = Number.parseInt(String(process.env.TRADEHAX_HIVEMIND_MIN_TRAINING_ROWS || "500"), 10);
  if (!Number.isFinite(parsed)) return 500;
  return Math.min(10_000_000, Math.max(50, parsed));
}

function resolveLegacyAccountId() {
  return String(process.env.TRADEHAX_HIVEMIND_LEGACY_ACCOUNT_ID || "legacy-root").trim() || "legacy-root";
}

function countJsonlRows(raw: string) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let parseableJsonlRows = 0;
  let malformedRows = 0;

  for (const line of lines) {
    try {
      JSON.parse(line);
      parseableJsonlRows += 1;
    } catch {
      malformedRows += 1;
    }
  }

  return {
    rows: lines.length,
    parseableJsonlRows,
    malformedRows,
  };
}

function inspectDataset(rootDir: string, relativePath: string): HivemindDatasetHealth {
  const filePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(filePath)) {
    return {
      name: path.basename(relativePath),
      filePath,
      exists: false,
      bytes: 0,
      rows: 0,
      parseableJsonlRows: 0,
      malformedRows: 0,
    };
  }

  try {
    const stat = fs.statSync(filePath);
    const raw = fs.readFileSync(filePath, "utf8");
    const counts = countJsonlRows(raw);

    return {
      name: path.basename(relativePath),
      filePath,
      exists: true,
      bytes: stat.size,
      rows: counts.rows,
      parseableJsonlRows: counts.parseableJsonlRows,
      malformedRows: counts.malformedRows,
      lastModifiedAt: stat.mtime.toISOString(),
    };
  } catch {
    return {
      name: path.basename(relativePath),
      filePath,
      exists: true,
      bytes: 0,
      rows: 0,
      parseableJsonlRows: 0,
      malformedRows: 1,
    };
  }
}

function getDatasetCandidates() {
  return [
    "data/custom-llm/train.jsonl",
    "data/custom-llm/test.jsonl",
    "ai-training-set.jsonl",
    "tradehax-training-expanded.jsonl",
    "tradehax-domain-priority.jsonl",
  ];
}

export async function getHivemindReadiness(): Promise<HivemindReadiness> {
  const rootDir = process.cwd();
  const datasets = getDatasetCandidates().map((relativePath) => inspectDataset(rootDir, relativePath));
  const tokenConnections = getAiTokenConnections();
  const hfConfigured = Boolean(resolveHfApiToken());
  const behavior = getBehaviorIngestionSummary();
  const minTrainingRows = resolveMinTrainingRows();

  const totals = {
    datasetRows: datasets.reduce((acc, item) => acc + item.parseableJsonlRows, 0),
    malformedRows: datasets.reduce((acc, item) => acc + item.malformedRows, 0),
    healthyDatasets: datasets.filter((item) => item.exists && item.malformedRows === 0).length,
  };

  const issues: string[] = [];
  if (!hfConfigured) {
    issues.push("HF token is not configured (HF_API_TOKEN / HUGGINGFACE_API_TOKEN / HUGGING_FACE_HUB_TOKEN).");
  }
  if (totals.datasetRows < minTrainingRows) {
    issues.push(
      `Training corpus is below threshold: ${totals.datasetRows} rows < ${minTrainingRows} required rows.`,
    );
  }
  if (totals.malformedRows > 0) {
    issues.push(`Detected malformed JSONL rows: ${totals.malformedRows}.`);
  }
  if (behavior.acceptedEvents < 10) {
    issues.push("Behavioral ingestion has very low accepted event count; live user memory may be sparse.");
  }

  return {
    ok: issues.length === 0,
    generatedAt: nowIso(),
    legacyAccountId: resolveLegacyAccountId(),
    retentionDays: resolveRetentionDays(),
    minTrainingRows,
    tokens: {
      hfConfigured,
      providers: tokenConnections,
    },
    behavior,
    datasets,
    totals,
    issues,
  };
}

export async function getHivemindSourceSnapshot() {
  const [provider, live] = await Promise.all([getIntelligenceProviderStatus(), Promise.resolve(getLiveIngestionStatus())]);

  return {
    generatedAt: nowIso(),
    provider,
    live,
  };
}
