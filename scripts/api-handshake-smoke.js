#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = process.cwd();
const apiRoot = path.join(workspaceRoot, "app", "api");
const baseUrl = (process.env.API_BASE_URL || "https://main-six-dun.vercel.app").replace(/\/$/, "");

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

function parseMethods(content) {
  const methods = [];
  for (const method of ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"]) {
    const pattern = new RegExp(`export\\s+(async\\s+)?function\\s+${method}\\s*\\(`);
    if (pattern.test(content)) {
      methods.push(method);
    }
  }
  return methods;
}

async function requestStatus(url, method) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "content-type": "application/json",
      },
      body: method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE"
        ? JSON.stringify({ ping: "handshake" })
        : undefined,
    });
    return response.status;
  } catch {
    return 0;
  }
}

function isReachableStatus(status) {
  if (status === 0) return false;
  if (status === 404) return false;
  return true;
}

async function main() {
  if (!fs.existsSync(apiRoot)) {
    console.error("No app/api directory found.");
    process.exit(1);
  }

  const routeFiles = walkFiles(
    apiRoot,
    (filePath) => filePath.endsWith("route.ts") || filePath.endsWith("route.js"),
  );

  const results = [];
  for (const routeFile of routeFiles) {
    const content = fs.readFileSync(routeFile, "utf8");
    const apiPath = toApiPath(routeFile);
    const methods = parseMethods(content);

    const tests = new Set(["OPTIONS"]);
    if (methods.includes("GET")) {
      tests.add("GET");
    }

    for (const method of tests) {
      const url = `${baseUrl}${apiPath}`;
      const status = await requestStatus(url, method);
      results.push({ apiPath, method, status });
    }
  }

  const failed = results.filter((result) => !isReachableStatus(result.status));

  console.log(`Base URL: ${baseUrl}`);
  console.log(`Handshake checks: ${results.length}`);
  console.log(`Failed checks: ${failed.length}`);

  if (failed.length > 0) {
    console.log("\nFailed:");
    for (const row of failed.slice(0, 120)) {
      console.log(`- ${row.method} ${row.apiPath} => ${row.status}`);
    }
    process.exit(1);
  }

  console.log("\nAPI handshake smoke check passed.");
}

main();
