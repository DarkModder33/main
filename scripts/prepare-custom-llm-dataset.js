#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const INPUT_FILES = [
  "ai-training-set.jsonl",
  "tradehax-training-expanded.jsonl",
].map((relativePath) => path.join(ROOT, relativePath));

const OUTPUT_DIR = path.join(ROOT, "data", "custom-llm");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "train.jsonl");

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
          "You are TradeHax AI. Provide concise, safe, conversion-aware guidance for tradehax.net users.",
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

function main() {
  const rows = INPUT_FILES.flatMap((filePath) => readJsonl(filePath));
  const trainingRows = rows.map(toTrainingRecord).filter(Boolean);

  if (trainingRows.length === 0) {
    throw new Error("No valid training rows found.");
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const output = trainingRows.map((row) => JSON.stringify(row)).join("\n") + "\n";
  fs.writeFileSync(OUTPUT_FILE, output, "utf8");

  console.log(`Prepared custom LLM dataset: ${OUTPUT_FILE}`);
  console.log(`Samples: ${trainingRows.length}`);
}

main();
