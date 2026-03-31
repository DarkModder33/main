#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildMetaPath = path.join(__dirname, '../public/__build.json');

const buildMeta = {
  timestamp: new Date().toISOString(),
  nodeVersion: process.version,
  npmVersion: process.env.npm_package_version || 'unknown',
  buildId: process.env.VERCEL_BUILD_ID || `local-${Date.now()}`,
  deploymentUrl: process.env.VERCEL_URL || 'localhost:3000',
  environment: process.env.NODE_ENV || 'development',
  git: {
    sha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    branch: process.env.VERCEL_GIT_COMMIT_REF || 'local',
  },
};

// Ensure directory exists
const dir = path.dirname(buildMetaPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Write build metadata
fs.writeFileSync(buildMetaPath, JSON.stringify(buildMeta, null, 2));

console.log(`✓ Build metadata generated: ${buildMetaPath}`);
console.log(JSON.stringify(buildMeta, null, 2));
