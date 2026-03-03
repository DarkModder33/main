const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const STRICT_MODE = process.argv.includes("--strict");

const REQUIRED_DOCS = [
  "README.md",
  "docs/SITE_OPTIMIZATION_AUDIT_PLAN.md",
  "docs/LEGACY_FOUNDATION_GUARDRAILS.md",
  "docs/ROUTE_OWNERSHIP.md",
];

const ALIAS_REDIRECTS = [
  { file: "app/ai/page.tsx", target: "/ai-hub" },
  { file: "app/portal/page.tsx", target: "/login" },
  { file: "app/music/page.tsx", target: "/music/lessons" },
];

const SHELL_IMPORT_ALLOWLIST = new Set([
  "components/shamrock/ShamrockHeader.tsx",
  "components/shamrock/ShamrockFooter.tsx",
]);

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function walkFiles(startDir, predicate, acc = []) {
  if (!fs.existsSync(startDir)) {
    return acc;
  }

  const entries = fs.readdirSync(startDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git", "archive", "tradehax-fresh", "tradehax-repo"].includes(entry.name)) {
        continue;
      }
      walkFiles(fullPath, predicate, acc);
      continue;
    }

    if (predicate(fullPath)) {
      acc.push(fullPath);
    }
  }

  return acc;
}

function readFile(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return "";
  return fs.readFileSync(fullPath, "utf8");
}

function lineCount(content) {
  if (!content) return 0;
  return content.split(/\r?\n/).length;
}

function hasRedirectTarget(content, target) {
  const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`redirect\\(\\s*["']${escapedTarget}["']\\s*\\)`);
  return pattern.test(content);
}

function checkDocs() {
  return REQUIRED_DOCS.filter((relativePath) => !fs.existsSync(path.join(ROOT, relativePath)));
}

function checkAliasRedirects() {
  const issues = [];
  for (const redirectSpec of ALIAS_REDIRECTS) {
    const content = readFile(redirectSpec.file);
    if (!content) {
      issues.push(`${redirectSpec.file} is missing (expected redirect to ${redirectSpec.target})`);
      continue;
    }

    if (!hasRedirectTarget(content, redirectSpec.target)) {
      issues.push(`${redirectSpec.file} does not redirect to ${redirectSpec.target}`);
    }
  }
  return issues;
}

function checkDuplicateShellImports() {
  const appFiles = walkFiles(
    path.join(ROOT, "app"),
    (fullPath) => /\.(ts|tsx)$/.test(fullPath),
  );

  const violations = [];
  for (const fullPath of appFiles) {
    const rel = toPosix(path.relative(ROOT, fullPath));
    if (SHELL_IMPORT_ALLOWLIST.has(rel)) continue;

    const content = fs.readFileSync(fullPath, "utf8");
    const importsShamrockHeader = content.includes("ShamrockHeader");
    const importsShamrockFooter = content.includes("ShamrockFooter");

    if (importsShamrockHeader || importsShamrockFooter) {
      violations.push(rel);
    }
  }

  return violations;
}

function checkLargeFiles() {
  const targets = ["app", "components", "lib"];
  const files = targets.flatMap((folder) =>
    walkFiles(path.join(ROOT, folder), (fullPath) => /\.(ts|tsx|js|jsx)$/.test(fullPath)),
  );

  const oversized = [];
  for (const fullPath of files) {
    const content = fs.readFileSync(fullPath, "utf8");
    const lines = lineCount(content);
    if (lines > 500) {
      oversized.push({
        file: toPosix(path.relative(ROOT, fullPath)),
        lines,
      });
    }
  }

  oversized.sort((a, b) => b.lines - a.lines);
  return oversized;
}

function reportList(title, items, isError) {
  if (!items.length) return;
  const prefix = isError ? "ERROR" : "WARN";
  console.log(`\n[${prefix}] ${title}`);
  for (const item of items) {
    if (typeof item === "string") {
      console.log(`- ${item}`);
    } else {
      console.log(`- ${item.file} (${item.lines} lines)`);
    }
  }
}

function main() {
  console.log("Running TradeHax legacy guardrails check...");

  const missingDocs = checkDocs();
  const aliasIssues = checkAliasRedirects();
  const shellViolations = checkDuplicateShellImports();
  const oversizedFiles = checkLargeFiles();

  reportList("Missing required legacy docs", missingDocs, true);
  reportList("Alias redirect violations", aliasIssues, true);
  reportList("Duplicate shell imports found in app routes", shellViolations, true);
  reportList("Files above 500 LOC (decomposition candidates)", oversizedFiles, false);

  const hardFailures = missingDocs.length + aliasIssues.length + shellViolations.length;
  const strictFailures = STRICT_MODE ? oversizedFiles.length : 0;

  console.log("\nLegacy guardrails summary:");
  console.log(`- hard failures: ${hardFailures}`);
  console.log(`- oversize warnings: ${oversizedFiles.length}`);
  console.log(`- strict mode: ${STRICT_MODE ? "enabled" : "disabled"}`);

  if (hardFailures > 0 || strictFailures > 0) {
    process.exit(1);
  }

  console.log("Legacy guardrails passed.");
}

main();
