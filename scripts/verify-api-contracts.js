#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = process.cwd();
const apiRoot = path.join(workspaceRoot, "app", "api");
const sourceRoots = ["app", "components", "lib", "src"]
  .map((dir) => path.join(workspaceRoot, dir))
  .filter((dir) => fs.existsSync(dir));

const methodNames = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);

function walkFiles(dir, predicate, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, predicate, acc);
      continue;
    }
    if (predicate(fullPath)) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function toApiPath(routeFilePath) {
  const relative = path.relative(apiRoot, routeFilePath).replace(/\\/g, "/");
  return `/api/${relative.replace(/\/route\.ts$/, "").replace(/\/route\.js$/, "")}`;
}

function parseRouteMethods(fileContent) {
  const supported = new Set();
  for (const method of methodNames) {
    const pattern = new RegExp(`export\\s+(async\\s+)?function\\s+${method}\\s*\\(`);
    if (pattern.test(fileContent)) {
      supported.add(method);
    }
  }
  return supported;
}

function getStaticApiCalls(filePath, fileContent) {
  const contentWithoutComments = fileContent
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

  const calls = [];

  const fetchRegex = /fetch\(\s*(["'`])(?<url>\/api[^"'`$]*)\1\s*(?:,\s*(?<opts>\{[\s\S]*?\}))?\s*\)/g;
  let match;
  while ((match = fetchRegex.exec(contentWithoutComments)) !== null) {
    const url = match.groups?.url;
    const opts = match.groups?.opts || "";
    const methodMatch = opts.match(/method\s*:\s*(["'`])(?<method>[A-Za-z]+)\1/);
    const method = (methodMatch?.groups?.method || "GET").toUpperCase();
    calls.push({ filePath, url, method });
  }

  const templateRegex = /fetch\(\s*`(?<url>\/api[^`]*\$\{[^`]*`)/g;
  while ((match = templateRegex.exec(contentWithoutComments)) !== null) {
    calls.push({ filePath, url: match.groups?.url || "", method: "DYNAMIC" });
  }

  return calls;
}

function normalizeApiUrl(url) {
  if (!url.startsWith("/api")) {
    return url;
  }
  return url.split("?")[0].split("#")[0];
}

function main() {
  if (!fs.existsSync(apiRoot)) {
    console.error("No app/api directory found.");
    process.exit(1);
  }

  const routeFiles = walkFiles(
    apiRoot,
    (filePath) => filePath.endsWith("route.ts") || filePath.endsWith("route.js"),
  );

  const routeMap = new Map();
  for (const routeFile of routeFiles) {
    const content = fs.readFileSync(routeFile, "utf8");
    const apiPath = toApiPath(routeFile);
    routeMap.set(apiPath, {
      file: path.relative(workspaceRoot, routeFile).replace(/\\/g, "/"),
      methods: parseRouteMethods(content),
    });
  }

  const sourceFiles = sourceRoots.flatMap((root) =>
    walkFiles(root, (filePath) => sourceExtensions.has(path.extname(filePath))),
  );

  const calls = [];
  for (const filePath of sourceFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    calls.push(...getStaticApiCalls(path.relative(workspaceRoot, filePath).replace(/\\/g, "/"), content));
  }

  const errors = [];
  const warnings = [];

  for (const call of calls) {
    if (call.method === "DYNAMIC") {
      warnings.push(`dynamic endpoint in ${call.filePath}: ${call.url}`);
      continue;
    }

    const normalizedUrl = normalizeApiUrl(call.url);
    const route = routeMap.get(normalizedUrl);
    if (!route) {
      errors.push(`missing route for ${call.method} ${call.url} (normalized: ${normalizedUrl}) (referenced in ${call.filePath})`);
      continue;
    }

    if (!route.methods.has(call.method)) {
      warnings.push(
        `method mismatch for ${call.method} ${call.url} (normalized: ${normalizedUrl}) (supported: ${Array.from(route.methods).join(", ") || "none"
        }) referenced in ${call.filePath}`,
      );
    }
  }

  console.log(`API routes discovered: ${routeMap.size}`);
  console.log(`Frontend/backend API calls discovered: ${calls.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Errors: ${errors.length}`);

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of warnings.slice(0, 80)) {
      console.log(`- ${warning}`);
    }
  }

  if (errors.length > 0) {
    console.log("\nErrors:");
    for (const error of errors.slice(0, 120)) {
      console.log(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("\nAPI contract check passed.");
}

main();
