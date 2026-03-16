#!/usr/bin/env node
/**
 * Automated Endpoint Health Check Script
 * Checks all critical endpoints for connectivity and reports status
 */
const fetch = require('node-fetch');
const endpoints = [
  { name: 'Hugging Face', url: process.env.HF_INFERENCE_API_ENDPOINT || 'https://api-inference.huggingface.co/models', token: process.env.NEXT_PUBLIC_HF_API_TOKEN },
  { name: 'OpenAI', url: 'https://api.openai.com/v1', token: process.env.OPENAI_API_KEY },
  { name: 'Supabase', url: process.env.VITE_SUPABASE_URL, token: process.env.VITE_SUPABASE_ANON_KEY },
  { name: 'TradeHax AI Chat', url: process.env.TRADEHAX_API_CHAT || 'http://localhost:3000/api/ai/chat' },
  { name: 'Crypto Data', url: process.env.TRADEHAX_API_CRYPTO || 'http://localhost:3000/api/data/crypto' },
  { name: 'Unusual Signals', url: process.env.TRADEHAX_API_UNUSUAL || 'http://localhost:3000/api/signals/unusual' },
];

const stripeEndpoint = {
  name: 'Stripe',
  url: 'https://api.stripe.com/v1/accounts/' + (process.env.STRIPE_ACCOUNT_ID || ''),
  token: process.env.STRIPE_API_KEY
};
endpoints.push(stripeEndpoint);

async function checkEndpoint(ep) {
  if (!ep.url) return { name: ep.name, status: 'missing url' };
  try {
    const headers = ep.token ? { Authorization: `Bearer ${ep.token}` } : {};
    const res = await fetch(ep.url, { headers });
    return { name: ep.name, status: res.ok ? 'connected' : `error ${res.status}` };
  } catch (err) {
    return { name: ep.name, status: 'error', error: err.message };
  }
}

async function runHealthChecks() {
  const results = await Promise.all(endpoints.map(checkEndpoint));
  console.table(results);
}

runHealthChecks();
 * TradeHax Endpoint Health Check
 * Checks all critical endpoints: Stripe, AI Chat, Crypto Data, Unusual Signals, etc.
 * Extend as needed for new endpoints.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });
const https = require('https');
const http = require('http');

function checkHttps({ hostname, path, headers = {}, timeout = 10000 }) {
  return new Promise((resolve) => {
    const options = { hostname, path, headers, timeout, method: 'GET' };
    const req = https.request(options, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode < 400 });
    });
    req.on('error', (e) => resolve({ status: 0, ok: false, error: e.message }));
    req.end();
  });
}

async function main() {
  const results = [];

  // Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = await checkHttps({
      hostname: 'api.stripe.com',
      path: '/v1/charges',
      headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    });
    results.push({ name: 'Stripe', ...stripe });
  } else {
    results.push({ name: 'Stripe', ok: false, error: 'STRIPE_SECRET_KEY not set' });
  }

  // TradeHax AI Chat (example endpoint)
  if (process.env.TRADEHAX_AI_CHAT_URL) {
    const url = new URL(process.env.TRADEHAX_AI_CHAT_URL);
    const ai = await checkHttps({ hostname: url.hostname, path: url.pathname });
    results.push({ name: 'TradeHax AI Chat', ...ai });
  } else {
    results.push({ name: 'TradeHax AI Chat', ok: false, error: 'TRADEHAX_AI_CHAT_URL not set' });
  }

  // Crypto Data (example endpoint)
  if (process.env.CRYPTO_DATA_URL) {
    const url = new URL(process.env.CRYPTO_DATA_URL);
    const crypto = await checkHttps({ hostname: url.hostname, path: url.pathname });
    results.push({ name: 'Crypto Data', ...crypto });
  } else {
    results.push({ name: 'Crypto Data', ok: false, error: 'CRYPTO_DATA_URL not set' });
  }

  // Unusual Signals (example endpoint)
  if (process.env.UNUSUAL_SIGNALS_URL) {
    const url = new URL(process.env.UNUSUAL_SIGNALS_URL);
    const signals = await checkHttps({ hostname: url.hostname, path: url.pathname });
    results.push({ name: 'Unusual Signals', ...signals });
  } else {
    results.push({ name: 'Unusual Signals', ok: false, error: 'UNUSUAL_SIGNALS_URL not set' });
  }

  // Output results
  for (const r of results) {
    if (r.ok) {
      console.log(`\x1b[32m[OK]\x1b[0m ${r.name}`);
    } else {
      console.log(`\x1b[31m[FAIL]\x1b[0m ${r.name}: ${r.error || 'Status ' + r.status}`);
    }
  }

  // Exit with error if any failed
  if (results.some(r => !r.ok)) process.exit(1);
}

main();

