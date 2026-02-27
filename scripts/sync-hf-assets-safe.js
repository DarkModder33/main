#!/usr/bin/env node

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SYNC_SCRIPT = path.join(__dirname, "sync-hf-assets.js");

function runSync() {
  const result = spawnSync(process.execPath, [SYNC_SCRIPT], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });

  return {
    status: typeof result.status === "number" ? result.status : 1,
    signal: result.signal || null,
  };
}

function removePath(targetPath) {
  try {
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
      console.log(`🧹 Cleared: ${targetPath}`);
    }
  } catch (error) {
    console.warn(`⚠️ Could not clear ${targetPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function freeDiskSpace() {
  const cleanupTargets = [
    path.join(ROOT, ".next"),
    path.join(ROOT, "node_modules", ".cache"),
    path.join(process.env.LOCALAPPDATA || "", "npm-cache", "_logs"),
    process.env.TEMP || "",
  ].filter(Boolean);

  console.log("⚠️ Detected possible disk pressure. Performing safe cache cleanup...");
  for (const target of cleanupTargets) {
    removePath(target);
  }
}

function main() {
  console.log("🚀 Running HF asset sync...");
  const first = runSync();

  if (first.status === 0) {
    process.exit(0);
  }

  freeDiskSpace();
  console.log("🔁 Retrying HF asset sync after cleanup...");
  const second = runSync();
  process.exit(second.status);
}

main();
