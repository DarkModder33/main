#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const strictMode = process.argv.includes("--strict");
const envFiles = [".env.local", ".env"];

const requirements = [
  {
    key: "NEXT_PUBLIC_EMAILJS_SERVICE_ID",
    required: true,
    source: "EmailJS dashboard -> Email Services -> Service ID",
  },
  {
    key: "NEXT_PUBLIC_EMAILJS_TEMPLATE_ID",
    required: true,
    source: "EmailJS dashboard -> Email Templates -> Template ID",
  },
  {
    key: "NEXT_PUBLIC_EMAILJS_PUBLIC_KEY",
    required: true,
    source: "EmailJS dashboard -> Account -> API Keys -> Public Key",
  },
  {
    key: "RESEND_API_KEY",
    required: false,
    source: "Resend dashboard -> API Keys",
  },
  {
    key: "SNOW_REMOVAL_FROM_EMAIL",
    required: false,
    source: "A verified sender/domain in Resend",
  },
  {
    key: "SNOW_REMOVAL_TO_EMAIL",
    required: false,
    source: "The inbox that should receive leads (ex: njsnowremoval26@gmail.com)",
  },
];

function parseEnvFile(raw) {
  const result = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 1) continue;

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    result[key] = value;
  }
  return result;
}

function readLocalEnv() {
  const merged = {};
  for (const envFile of envFiles) {
    const fullPath = path.resolve(process.cwd(), envFile);
    if (!fs.existsSync(fullPath)) continue;

    const raw = fs.readFileSync(fullPath, "utf8");
    Object.assign(merged, parseEnvFile(raw));
  }
  return merged;
}

function getValue(envMap, key) {
  const processValue = String(process.env[key] || "").trim();
  if (processValue) return processValue;
  return String(envMap[key] || "").trim();
}

function isPlaceholder(value) {
  const normalized = value.toLowerCase();
  return (
    !normalized ||
    normalized.includes("your_") ||
    normalized.includes("replace_") ||
    normalized.endsWith("_id") ||
    normalized.endsWith("_key")
  );
}

(function main() {
  const localEnv = readLocalEnv();

  process.stdout.write("\n========================================================\n");
  process.stdout.write("❄️  Snow Removal Env Check\n");
  process.stdout.write("========================================================\n\n");
  process.stdout.write(
    strictMode
      ? "Mode: STRICT (missing required vars fail this check)\n\n"
      : "Mode: WARN-ONLY (advisory check, does not block)\n\n",
  );

  let missingRequired = 0;
  let warningCount = 0;

  for (const item of requirements) {
    const value = getValue(localEnv, item.key);
    const hasValue = value.length > 0 && !isPlaceholder(value);

    if (hasValue) {
      process.stdout.write(`✅ ${item.key}\n`);
      continue;
    }

    if (item.required) {
      missingRequired += 1;
      process.stdout.write(`❌ ${item.key} (required)\n`);
      process.stdout.write(`   ↳ source: ${item.source}\n`);
      continue;
    }

    warningCount += 1;
    process.stdout.write(`⚠️  ${item.key} (optional but recommended)\n`);
    process.stdout.write(`   ↳ source: ${item.source}\n`);
  }

  process.stdout.write("\n");
  process.stdout.write("Next step for deploy: add these values in Vercel -> Project Settings -> Environment Variables.\n");
  process.stdout.write("Reference doc: SNOW_REMOVAL_VERCEL_SETUP.md\n\n");

  if (missingRequired > 0 && strictMode) {
    process.stderr.write("❌ Missing required Snow Removal environment variables in strict mode.\n");
    process.exit(1);
  }

  if (missingRequired > 0) {
    process.stdout.write("⚠️  Required values are still missing, but warn-only mode allows continuing.\n");
    process.exit(0);
  }

  if (warningCount > 0) {
    process.stdout.write("ℹ️  Required values are configured. Optional backend delivery values are still missing.\n");
    process.exit(0);
  }

  process.stdout.write("✅ Snow Removal env setup looks complete.\n");
  process.exit(0);
})();
