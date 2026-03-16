// Script to sync .env.local to Vercel project environment variables
// Usage: node scripts/sync-env-to-vercel.js <project-name> [--prod]

const fs = require('fs');
const { execSync } = require('child_process');

const ENV_PATH = '.env.local';
const PROJECT = process.argv[2];
const IS_PROD = process.argv.includes('--prod');

if (!PROJECT) {
  console.error('Usage: node scripts/sync-env-to-vercel.js <project-name> [--prod]');
  process.exit(1);
}

const env = fs.readFileSync(ENV_PATH, 'utf-8')
  .split('\n')
  .filter(line => line && !line.startsWith('#'))
  .map(line => line.split('='))
  .filter(([k, v]) => k && v)
  .map(([k, v]) => [k.trim(), v.trim().replace(/^"|"$/g, '')]);

for (const [key, value] of env) {
  const cmd = `vercel env add ${key} ${IS_PROD ? 'production' : 'preview'} --yes --project ${PROJECT}`;
  try {
    execSync(`echo "${value}" | ${cmd}`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to set ${key}:`, e.message);
  }
}

console.log('Environment variables sync complete.');

