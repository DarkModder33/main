#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const dns = require("node:dns").promises;

const DOMAIN = process.env.TRADEHAX_PRIMARY_DOMAIN || "tradehax.net";
const EXPECTED_APEX_A = "76.76.21.21";

const args = new Set(process.argv.slice(2));
const runVercelOnly = args.has("--vercel");
const runDnsOnly = args.has("--dns");
const runAll = !runVercelOnly && !runDnsOnly;

const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

let passCount = 0;
let warnCount = 0;
let failCount = 0;

function log(msg = "") {
  process.stdout.write(`${msg}\n`);
}

function pass(message) {
  passCount += 1;
  log(`${colors.green}✓${colors.reset} ${message}`);
}

function warn(message) {
  warnCount += 1;
  log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function fail(message) {
  failCount += 1;
  log(`${colors.red}✗${colors.reset} ${message}`);
}

function info(message) {
  log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function exists(file) {
  return fs.existsSync(path.resolve(process.cwd(), file));
}

function read(file) {
  return fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
}

function runGit(argsList) {
  const result = spawnSync("git", argsList, {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  if (result.error || result.status !== 0) {
    return "";
  }

  return (result.stdout || "").trim();
}

function checkVercelConfig() {
  log("==================================================");
  log("🔍 Vercel Deployment Configuration Checker");
  log("==================================================");
  log();

  if (exists("package.json")) {
    pass("package.json exists in repository root");
  } else {
    fail("package.json NOT found in repository root");
  }

  if (exists("vercel.json")) {
    pass("vercel.json exists");

    const vercelRaw = read("vercel.json");

    if (vercelRaw.includes('"framework": "nextjs"')) {
      pass("Framework is set to nextjs in vercel.json");
    } else {
      fail("Framework is NOT set to nextjs in vercel.json");
    }
  } else {
    warn("vercel.json not found (optional but recommended)");
  }

  if (exists("next.config.ts")) {
    pass("next.config.ts exists");

    const nextConfigRaw = read("next.config.ts");
    if (nextConfigRaw.includes("output: \"export\"") || nextConfigRaw.includes("output: 'export'")) {
      warn("Static export path is present in next.config.ts (verify server feature expectations)");
    } else {
      pass("No forced static export in next.config.ts");
    }
  } else {
    fail("next.config.ts NOT found");
  }

  const currentBranch = runGit(["branch", "--show-current"]);
  if (!currentBranch) {
    warn("Unable to determine current git branch");
  } else if (currentBranch === "main") {
    pass("Currently on 'main' branch");
  } else {
    warn(`Currently on '${currentBranch}' branch`);
  }

  if (exists(".github/workflows/build-check.yml")) {
    pass("CI build-check workflow exists");
  } else {
    warn("CI build-check workflow not found");
  }

  if (exists("app") || exists("pages")) {
    pass("Next.js app structure found (app/ or pages/)");
  } else {
    fail("No app/ or pages/ directory found");
  }

  if (exists(".gitignore")) {
    const gitIgnore = read(".gitignore");
    if (gitIgnore.includes("out") && gitIgnore.includes(".next")) {
      pass(".gitignore ignores build directories (.next/out)");
    } else {
      warn(".gitignore may not be ignoring all build directories");
    }
  }
}

async function safeResolve4(hostname) {
  try {
    return await dns.resolve4(hostname);
  } catch {
    return [];
  }
}

async function safeResolveTxt(hostname) {
  try {
    const records = await dns.resolveTxt(hostname);
    return records.map((parts) => parts.join(""));
  } catch {
    return [];
  }
}

async function safeResolveCname(hostname) {
  try {
    return await dns.resolveCname(hostname);
  } catch {
    return [];
  }
}

async function checkDnsConfig() {
  log("==================================================");
  log(`🌐 DNS Configuration Checker for ${DOMAIN}`);
  log("==================================================");
  log();

  const apexARecords = await safeResolve4(DOMAIN);
  if (apexARecords.length === 0) {
    fail(`No A record found for ${DOMAIN}`);
    info(`Expected apex A includes ${EXPECTED_APEX_A}`);
  } else if (apexARecords.includes(EXPECTED_APEX_A)) {
    pass(`A record includes expected Vercel IP (${EXPECTED_APEX_A})`);
  } else {
    warn(`A record found (${apexARecords.join(", ")}) but missing expected ${EXPECTED_APEX_A}`);
  }

  const txtRecords = await safeResolveTxt(`_vercel.${DOMAIN}`);
  if (txtRecords.length === 0) {
    warn(`No _vercel TXT record found for ${DOMAIN}`);
    info("If domain verification is required, add vc-domain-verify=... record from Vercel dashboard");
  } else if (txtRecords.some((t) => t.startsWith("vc-domain-verify="))) {
    pass("_vercel TXT verification record detected");
  } else {
    warn(`_vercel TXT found, but unexpected format: ${txtRecords.join(" | ")}`);
  }

  const wwwCname = await safeResolveCname(`www.${DOMAIN}`);
  if (wwwCname.length === 0) {
    warn(`No CNAME for www.${DOMAIN} (optional but recommended)`);
  } else if (wwwCname.some((c) => c.includes("vercel-dns.com"))) {
    pass(`www.${DOMAIN} CNAME points to Vercel DNS`);
  } else {
    warn(`www.${DOMAIN} CNAME found but not clearly Vercel: ${wwwCname.join(", ")}`);
  }
}

(async function main() {
  try {
    if (runAll || runVercelOnly) {
      checkVercelConfig();
      log();
    }

    if (runAll || runDnsOnly) {
      await checkDnsConfig();
      log();
    }

    log("==================================================");
    log("Summary");
    log("==================================================");
    log(`${colors.green}✓ Passed:${colors.reset} ${passCount}`);
    log(`${colors.yellow}⚠ Warnings:${colors.reset} ${warnCount}`);
    log(`${colors.red}✗ Failed:${colors.reset} ${failCount}`);
    log();

    if (failCount > 0) {
      log(`${colors.red}Preflight checks failed.${colors.reset}`);
      process.exit(1);
    }

    log(`${colors.green}Preflight checks completed.${colors.reset}`);
  } catch (error) {
    fail(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
})();
