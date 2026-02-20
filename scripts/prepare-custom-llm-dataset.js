#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const INPUT_FILES = [
  "ai-training-set.jsonl",
  "tradehax-training-expanded.jsonl",
  "tradehax-crypto-education.jsonl",
  "tradehax-domain-priority.jsonl",
].map((relativePath) => path.join(ROOT, relativePath));

const OUTPUT_DIR = path.join(ROOT, "data", "custom-llm");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "train.jsonl");
const SUMMARY_FILE = path.join(OUTPUT_DIR, "summary.json");

const STOCK_CRYPTO_WEIGHT = Number.parseInt(process.env.TRADEHAX_WEIGHT_STOCK_CRYPTO || "4", 10);
const MUSIC_TECH_WEIGHT = Number.parseInt(process.env.TRADEHAX_WEIGHT_MUSIC_TECH || "3", 10);
const GENERAL_WEIGHT = Number.parseInt(process.env.TRADEHAX_WEIGHT_GENERAL || "1", 10);
const SHUFFLE_SEED = Number.parseInt(process.env.TRADEHAX_DATASET_SHUFFLE_SEED || "42", 10);

function safeWeight(value, fallback) {
  if (!Number.isFinite(value) || value < 1) {
    return fallback;
  }
  return Math.max(1, Math.min(8, value));
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, "utf8");
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid JSONL at ${filePath}:${index + 1}`);
      }
    });
}

function toTrainingRecord(raw) {
  const instruction =
    typeof raw.instruction === "string"
      ? raw.instruction.trim()
      : typeof raw.instructions === "string"
        ? raw.instructions.trim()
        : "";
  const input = typeof raw.input === "string" ? raw.input.trim() : "";
  const output =
    typeof raw.output === "string"
      ? raw.output.trim()
      : typeof raw.response === "string"
        ? raw.response.trim()
        : "";
  const category = typeof raw.category === "string" ? raw.category.trim() : "GENERAL";

  if (!instruction || !output) {
    return null;
  }

  const prompt = input ? `${instruction}\n\nContext: ${input}` : instruction;
  return {
    messages: [
      {
        role: "system",
        content:
          "You are TradeHax AI. Domain priority: (1) stocks+crypto markets, (2) music, (3) technology. Provide concise, safe, conversion-aware guidance for tradehax.net users.",
      },
      {
        role: "user",
        content: prompt,
      },
      {
        role: "assistant",
        content: output,
      },
    ],
    metadata: {
      category,
      source: "tradehax-jsonl",
    },
  };
}

function normalizeCategory(value) {
  return String(value || "GENERAL").trim().toUpperCase();
}

function resolvePriorityWeight(category) {
  const normalized = normalizeCategory(category);

  // Highest priority: stock + crypto learning and execution
  if (
    normalized.includes("STOCK") ||
    normalized.includes("CRYPTO") ||
    normalized.includes("TRADING") ||
    normalized.includes("DEFI") ||
    normalized.includes("PORTFOLIO") ||
    normalized.includes("HFT") ||
    normalized.includes("BOT") ||
    normalized.includes("MARKET") ||
    normalized.includes("SOLANA")
  ) {
    return safeWeight(STOCK_CRYPTO_WEIGHT, 4);
  }

  // Secondary priority: music + tech
  if (normalized.includes("MUSIC") || normalized.includes("GUITAR") || normalized.includes("TECH")) {
    return safeWeight(MUSIC_TECH_WEIGHT, 3);
  }

  return safeWeight(GENERAL_WEIGHT, 1);
}

function seededRandomFactory(seed) {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function seededShuffle(items, seed) {
  const random = seededRandomFactory(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function main() {
  const rows = INPUT_FILES.flatMap((filePath) => readJsonl(filePath));
  const categoryCounts = new Map();
  const trainingRows = rows
    .map(toTrainingRecord)
    .filter(Boolean)
    .flatMap((row) => {
      const weight = resolvePriorityWeight(row.metadata.category);
      const categoryKey = normalizeCategory(row.metadata.category);
      categoryCounts.set(categoryKey, (categoryCounts.get(categoryKey) || 0) + weight);
      const weightedRows = [];
      for (let i = 0; i < weight; i += 1) {
        weightedRows.push({
          ...row,
          metadata: {
            ...row.metadata,
            sampleWeight: weight,
          },
        });
      }
      return weightedRows;
    });

  if (trainingRows.length === 0) {
    throw new Error("No valid training rows found.");
  }

  const shuffledRows = seededShuffle(trainingRows, SHUFFLE_SEED);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const output = shuffledRows.map((row) => JSON.stringify(row)).join("\n") + "\n";
  fs.writeFileSync(OUTPUT_FILE, output, "utf8");

  const summary = {
    generatedAt: new Date().toISOString(),
    sourceFiles: INPUT_FILES.map((filePath) => path.basename(filePath)),
    weights: {
      stockCrypto: safeWeight(STOCK_CRYPTO_WEIGHT, 4),
      musicTech: safeWeight(MUSIC_TECH_WEIGHT, 3),
      general: safeWeight(GENERAL_WEIGHT, 1),
    },
    shuffleSeed: SHUFFLE_SEED,
    samples: shuffledRows.length,
    categoryDistribution: Object.fromEntries([...categoryCounts.entries()].sort((a, b) => b[1] - a[1])),
  };
  fs.writeFileSync(SUMMARY_FILE, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`Prepared custom LLM dataset: ${OUTPUT_FILE}`);
  console.log(`Samples: ${shuffledRows.length}`);
  console.log(`Summary: ${SUMMARY_FILE}`);
}

main();
