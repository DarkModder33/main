#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const SCORE_PATH = path.join(ROOT, "data", "tradebot", "eval-score.json");
const HISTORY_PATH = path.join(ROOT, "data", "tradebot", "eval-history.jsonl");

const STRICT = process.argv.includes("--strict");
const FORCE_APPEND = process.argv.includes("--append");
const NO_APPEND = process.argv.includes("--no-append") || (STRICT && !FORCE_APPEND);

function readNumber(name, fallback, min, max) {
  const parsed = Number.parseFloat(String(process.env[name] || ""));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function ensureScoreFile() {
  if (!fs.existsSync(SCORE_PATH)) {
    throw new Error(
      "Missing data/tradebot/eval-score.json. Run tradebot:evaluate (or tradebot:score-eval) before trend checks.",
    );
  }
}

function parseHistory() {
  if (!fs.existsSync(HISTORY_PATH)) {
    return [];
  }

  return fs
    .readFileSync(HISTORY_PATH, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`Invalid JSON in eval-history.jsonl at line ${index + 1}`);
      }
    });
}

function toFixed(value) {
  return Number.parseFloat(Number(value).toFixed(4));
}

function rollingAverage(values) {
  if (!values.length) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = (sorted.length - 1) * p;
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return sorted[low];
  const weight = rank - low;
  return sorted[low] * (1 - weight) + sorted[high] * weight;
}

function appendHistory(row) {
  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
  fs.appendFileSync(HISTORY_PATH, `${JSON.stringify(row)}\n`, "utf8");
}

function main() {
  const minScore = readNumber("TRADEHAX_HIVEMIND_BENCHMARK_MIN_SCORE", 0.62, 0, 1);
  const minDelta = readNumber("TRADEHAX_HIVEMIND_BENCHMARK_MIN_DELTA", -0.03, -1, 1);
  const windowSize = Math.floor(readNumber("TRADEHAX_HIVEMIND_BENCHMARK_WINDOW_SIZE", 10, 2, 180));

  ensureScoreFile();
  const report = readJson(SCORE_PATH);
  const score = Number(report.overallScore || 0);
  if (!Number.isFinite(score)) {
    throw new Error("Invalid overallScore in eval-score.json");
  }

  const history = parseHistory();
  const previous = history.length > 0 ? history[history.length - 1] : null;
  const delta = previous ? score - Number(previous.overallScore || 0) : 0;

  const entry = {
    generatedAt: new Date().toISOString(),
    overallScore: toFixed(score),
    scenarios: Number(report.scenarios || 0),
    scored: Number(report.scored || 0),
    missingCount: Array.isArray(report.missing) ? report.missing.length : 0,
    thresholds: {
      minScore,
      minDelta,
      windowSize,
    },
  };

  if (!NO_APPEND) {
    appendHistory(entry);
  }

  const freshHistory = NO_APPEND ? [...history, entry] : [...history, entry];
  const recent = freshHistory.slice(-windowSize);
  const recentScores = recent.map((row) => Number(row.overallScore || 0)).filter(Number.isFinite);
  const rolling = rollingAverage(recentScores);
  const p25 = percentile(recentScores, 0.25);
  const p75 = percentile(recentScores, 0.75);

  const issues = [];
  if (score < minScore) {
    issues.push(`overallScore ${toFixed(score)} is below minScore ${toFixed(minScore)}`);
  }
  if (previous && delta < minDelta) {
    issues.push(`score delta ${toFixed(delta)} is below minDelta ${toFixed(minDelta)}`);
  }
  if (entry.missingCount > 0) {
    issues.push(`evaluation has ${entry.missingCount} missing responses`);
  }

  const status = issues.length === 0 ? "pass" : "caution";

  console.log("hivemind-benchmark-status:", status);
  console.log("strict-mode:", STRICT ? "enabled" : "disabled");
  console.log("overall-score:", toFixed(score));
  console.log("delta-vs-last:", toFixed(delta));
  console.log("rolling-average:", toFixed(rolling));
  console.log("rolling-p25:", toFixed(p25));
  console.log("rolling-p75:", toFixed(p75));
  console.log("history-size:", freshHistory.length);
  console.log("window-size:", windowSize);

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

try {
  main();
} catch (error) {
  console.error("❌ Hivemind benchmark trend check failed");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
