#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const STRICT = process.argv.includes("--strict");

const tokenKeys = ["HF_API_TOKEN", "HUGGINGFACE_API_TOKEN", "HUGGING_FACE_HUB_TOKEN"];
const datasetCandidates = [
  "data/custom-llm/train.jsonl",
  "data/custom-llm/test.jsonl",
  "ai-training-set.jsonl",
  "tradehax-training-expanded.jsonl",
  "tradehax-domain-priority.jsonl",
];

function readNumber(name, fallback, min, max) {
  const raw = process.env[name];
  const parsed = Number.parseInt(String(raw || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function parseJsonlStats(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let valid = 0;
  let invalid = 0;

  for (const line of lines) {
    try {
      JSON.parse(line);
      valid += 1;
    } catch {
      invalid += 1;
    }
  }

  return {
    rows: lines.length,
    valid,
    invalid,
  };
}

function inspectDataset(candidatePath) {
  const fullPath = path.join(process.cwd(), candidatePath);
  if (!fs.existsSync(fullPath)) {
    return {
      candidatePath,
      exists: false,
      bytes: 0,
      rows: 0,
      valid: 0,
      invalid: 0,
    };
  }

  const stat = fs.statSync(fullPath);
  const raw = fs.readFileSync(fullPath, "utf8");
  const stats = parseJsonlStats(raw);

  return {
    candidatePath,
    exists: true,
    bytes: stat.size,
    rows: stats.rows,
    valid: stats.valid,
    invalid: stats.invalid,
    lastModifiedAt: stat.mtime.toISOString(),
  };
}

function print(header, value) {
  console.log(`${header}: ${value}`);
}

function main() {
  const minTrainingRows = readNumber("TRADEHAX_HIVEMIND_MIN_TRAINING_ROWS", 500, 50, 10_000_000);
  const retentionDays = readNumber("TRADEHAX_HIVEMIND_DATA_RETENTION_DAYS", 36500, 30, 100000);
  const legacyAccountId = String(process.env.TRADEHAX_HIVEMIND_LEGACY_ACCOUNT_ID || "legacy-root").trim() || "legacy-root";
  const configuredTokenKey = tokenKeys.find((key) => Boolean(String(process.env[key] || "").trim()));

  const datasets = datasetCandidates.map(inspectDataset);
  const totalValidRows = datasets.reduce((acc, item) => acc + item.valid, 0);
  const totalInvalidRows = datasets.reduce((acc, item) => acc + item.invalid, 0);

  const issues = [];
  if (!configuredTokenKey) {
    issues.push("No Hugging Face token found (HF_API_TOKEN / HUGGINGFACE_API_TOKEN / HUGGING_FACE_HUB_TOKEN)");
  }
  if (totalValidRows < minTrainingRows) {
    issues.push(`Training data below threshold: ${totalValidRows} < ${minTrainingRows}`);
  }
  if (totalInvalidRows > 0) {
    issues.push(`Malformed JSONL rows detected: ${totalInvalidRows}`);
  }

  print("hivemind-ready", issues.length === 0 ? "yes" : "no");
  print("strict-mode", STRICT ? "enabled" : "disabled");
  print("legacy-account-id", legacyAccountId);
  print("retention-days", retentionDays);
  print("minimum-training-rows", minTrainingRows);
  print("hf-token-key", configuredTokenKey || "missing");
  print("dataset-valid-rows", totalValidRows);
  print("dataset-malformed-rows", totalInvalidRows);
  console.log("dataset-inventory:");
  console.table(
    datasets.map((item) => ({
      dataset: item.candidatePath,
      exists: item.exists,
      bytes: item.bytes,
      rows: item.rows,
      validRows: item.valid,
      malformedRows: item.invalid,
      lastModifiedAt: item.lastModifiedAt || "n/a",
    })),
  );

  if (issues.length > 0) {
    console.log("issues:");
    for (const issue of issues) {
      console.log(`- ${issue}`);
    }
  }

  if (STRICT && issues.length > 0) {
    process.exit(1);
  }
}

main();
