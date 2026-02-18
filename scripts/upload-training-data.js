#!/usr/bin/env node

/**
 * Upload training dataset to Hugging Face
 * Usage: node scripts/upload-training-data.js
 */

const fs = require("fs");
const path = require("path");

const HF_TOKEN = process.env.HF_API_TOKEN || "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";
const HF_USER = "DarkModder33";
const DATASET_NAME = "tradehax-behavioral";
const FILE_PATH = path.join(process.cwd(), "ai-training-set.jsonl");

if (!fs.existsSync(FILE_PATH)) {
  console.error("❌ File not found:", FILE_PATH);
  process.exit(1);
}

const fileSize = fs.statSync(FILE_PATH).size;
const fileContent = fs.readFileSync(FILE_PATH);

console.log("📤 Uploading training dataset to Hugging Face...");
console.log(`   Dataset: ${HF_USER}/${DATASET_NAME}`);
console.log(`   File: ai-training-set.jsonl`);
console.log(`   Size: ${(fileSize / 1024).toFixed(2)} KB`);
console.log("");

// Use curl to upload
const { execSync } = require("child_process");

const curlCommand = `curl -X POST \\
  -H "Authorization: Bearer ${HF_TOKEN}" \\
  -F "file=@${FILE_PATH}" \\
  "https://huggingface.co/api/datasets/${HF_USER}/${DATASET_NAME}/upload/main/ai-training-set.jsonl"`;

try {
  const output = execSync(curlCommand, { encoding: "utf-8", stdio: "pipe" });
  const result = JSON.parse(output);

  if (result.error) {
    console.error("❌ Upload failed:", result.error);
    console.log("\n📝 If dataset doesn't exist, create it manually:");
    console.log(`   https://huggingface.co/new-dataset?name=${DATASET_NAME}`);
    process.exit(1);
  }

  console.log("✅ Upload successful!");
  console.log("   Dataset URL: https://huggingface.co/datasets/" + HF_USER + "/" + DATASET_NAME);
  console.log("");
  console.log("📊 You can now:");
  console.log("   1. Fine-tune models with this dataset");
  console.log("   2. Share it with the community");
  console.log("   3. Track it with git/dvc");
} catch (error) {
  console.error("❌ Upload error:", error.message);
  console.log("\n💡 Alternative: Upload manually at https://huggingface.co/new-dataset");
  process.exit(1);
}
