#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const dns = require("node:dns").promises;
const https = require("node:https");

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

function headRequest(url, redirectsRemaining = 3) {
  return new Promise((resolve) => {
    const request = https.request(
      url,
      {
        method: "HEAD",
        timeout: 5000,
      },
      (response) => {
        const status = Number(response.statusCode || 0);
        const location = response.headers.location;

        if (
          location &&
          redirectsRemaining > 0 &&
          status >= 300 &&
          status < 400
        ) {
          const nextUrl = new URL(location, url).toString();
          response.resume();
          resolve(headRequest(nextUrl, redirectsRemaining - 1));
          return;
        }

        response.resume();
        resolve({
          ok: status >= 200 && status < 500,
          status,
          headers: response.headers,
          url,
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("timeout"));
    });

    request.on("error", () => {
      resolve({ ok: false, status: 0, headers: {}, url });
    });

    request.end();
  });
}

async function checkDnsConfig() {
  log("==================================================");
  log(`🌐 DNS Configuration Checker for ${DOMAIN}`);
  log("==================================================");
  log();

  const apexARecords = await safeResolve4(DOMAIN);
  const apexTxtRecords = await safeResolveTxt(`_vercel.${DOMAIN}`);
  const wwwCname = await safeResolveCname(`www.${DOMAIN}`);

  const apexHead = await headRequest(`https://${DOMAIN}/`);
  const wwwHead = await headRequest(`https://www.${DOMAIN}/`);
  const apexReachable = apexHead.ok;
  const wwwReachable = wwwHead.ok;
  const apexVercelId = apexHead.headers?.["x-vercel-id"];
  const wwwVercelId = wwwHead.headers?.["x-vercel-id"];

  if (apexARecords.includes(EXPECTED_APEX_A)) {
    pass(`A record includes expected Vercel IP (${EXPECTED_APEX_A})`);
  } else if (apexARecords.length > 0) {
    warn(`A record found (${apexARecords.join(", ")}) but missing expected ${EXPECTED_APEX_A}`);
  } else if (apexReachable) {
    pass(
      `No direct apex A record found via DNS lookup, but ${DOMAIN} is reachable over HTTPS${
        apexVercelId ? " with Vercel response headers" : ""
      }`,
    );
    info(
      "This is valid for some managed DNS/ALIAS configurations where A lookup does not expose the flattened target.",
    );
  } else {
    fail(`No usable apex DNS routing detected for ${DOMAIN} (A record missing and HTTPS probe failed)`);
    info(`Expected apex A includes ${EXPECTED_APEX_A}`);
  }

  if (apexTxtRecords.length === 0) {
    warn(`No _vercel TXT record found for ${DOMAIN}`);
    info("If domain verification is required, add vc-domain-verify=... record from Vercel dashboard");
  } else if (apexTxtRecords.some((t) => t.startsWith("vc-domain-verify="))) {
    pass("_vercel TXT verification record detected");
  } else {
    warn(`_vercel TXT found, but unexpected format: ${apexTxtRecords.join(" | ")}`);
  }

  if (wwwCname.length === 0) {
    if (wwwReachable) {
      pass(
        `www.${DOMAIN} is reachable over HTTPS${
          wwwVercelId ? " with Vercel response headers" : ""
        } (CNAME not required in this DNS setup)`,
      );
    } else {
      warn(`No CNAME for www.${DOMAIN} and HTTPS probe failed (optional but recommended)`);
    }
  } else if (wwwCname.some((c) => c.includes("vercel-dns.com"))) {
    pass(`www.${DOMAIN} CNAME points to Vercel DNS`);
  } else {
    warn(`www.${DOMAIN} CNAME found but not clearly Vercel: ${wwwCname.join(", ")}`);
  }

  if (apexReachable) {
    pass(`${DOMAIN} HTTPS check succeeded (status ${apexHead.status || "unknown"})`);
  } else {
    fail(`${DOMAIN} HTTPS check failed`);
  }

  if (wwwReachable) {
    pass(`www.${DOMAIN} HTTPS check succeeded (status ${wwwHead.status || "unknown"})`);
  } else {
    warn(`www.${DOMAIN} HTTPS check failed`);
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
