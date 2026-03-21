# Quick Reference: Getting API Keys

Use this guide to get the credentials you provided and set them up securely.

---

## 1️⃣ Hugging Face (FREE — required)

**What it is:** Free LLM API (Llama 3.3 70B)  
**Cost:** Free, no credit card  
**How to get:**
1. Go to https://huggingface.co/settings/tokens
2. Create new token → name: `tradehax-prod`
3. Select **Read** permission
4. Copy the token → paste into `HF_API_TOKEN`

**Fallback models to try:**
- `meta-llama/Llama-3.3-70B-Instruct` (best, free)
- `mistralai/Mistral-7B-Instruct`
- `meta-llama/Meta-Llama-3-8B-Instruct`

---

## 2️⃣ OpenAI (Optional fallback)

**What it is:** GPT-4 backup when HF is slow  
**Cost:** ~$0.005 per 1k tokens  
**How to get:**
1. Go to https://platform.openai.com/api-keys
2. Click **Create new secret key**
3. Name it: `tradehax-prod`
4. Copy → paste into `OPENAI_API_KEY`

**⚠️ WARNING:** Store this securely, it's your billing account.

---

## 3️⃣ Supabase (Database — optional)

**What it is:** PostgreSQL + auth + real-time  
**Cost:** Free tier includes 500MB  
**How to get:**
1. Go to https://supabase.com/dashboard
2. Create project → name: `tradehax-prod`
3. Copy connection URL → `SUPABASE_URL`
4. Copy anon key → `SUPABASE_ANON_KEY`
5. Copy service role key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 4️⃣ Finnhub (Market data — optional)

**What it is:** Stock, crypto, forex data  
**Cost:** Free tier (15 min delay)  
**How to get:**
1. Go to https://finnhub.io/register
2. Sign up with email
3. Copy API key → `FINNHUB_API_KEY`

---

## 5️⃣ Polygon.io (Real-time market data — optional)

**What it is:** Live stock/crypto feeds  
**Cost:** Free tier (1-2s delay)  
**How to get:**
1. Go to https://polygon.io/dashboard
2. Sign up (free tier)
3. Copy API key → `POLYGON_API_KEY`

---

## Setup Steps (Windows)

### Option A: Use the Setup Script (Recommended)
```powershell
cd C:\tradez\main\web
.\scripts\setup-vercel-env.ps1
```

### Option B: Manual Vercel CLI
```powershell
npx vercel login

# Add each key one by one
npx vercel env add HF_API_TOKEN
# Paste your token when prompted
# Select: Production

npx vercel env add OPENAI_API_KEY
# ... repeat for other keys
```

### Option C: GUI (Vercel Dashboard)
1. Go to https://vercel.com/dashboard/tradehax-ai-assistant
2. Click **Settings** → **Environment Variables**
3. Add each key from this guide
4. Select **Production** scope

---

## Verify Setup

```powershell
# List all set variables
npx vercel env ls

# Should show:
# ✅ HF_API_TOKEN (Production)
# ✅ OPENAI_API_KEY (Production)
# etc.
```

---

## Deploy & Test

```powershell
# Rebuild and deploy with new env vars
npm run deploy:tech

# Wait 2-3 minutes, then test the API
curl https://tradehaxai.tech/api/ai/health
```

Expected response:
```json
{
  "status": "ok",
  "providers": {
    "huggingface": true,
    "openai": true
  }
}
```

---

## Troubleshooting

### Problem: "Provider unreachable"
- ✅ Check HF_API_TOKEN is set: `npx vercel env ls`
- ✅ Verify token has **Read** permission on HF dashboard
- ✅ Check quota not exceeded: https://huggingface.co/settings/billing

### Problem: "OpenAI key invalid"
- ✅ Check OPENAI_API_KEY format starts with `sk-proj-`
- ✅ Verify not expired: https://platform.openai.com/api-keys
- ✅ Ensure billing is set up (even free trial tier requires card)

### Problem: "Environment variables not loading"
- ✅ Rerun: `npm run deploy:tech`
- ✅ Check: `npx vercel env ls` shows your keys
- ✅ Wait 1-2 min for Vercel build cache to clear

---

## Security Checklist

- [ ] Never paste live keys in Slack/email/GitHub
- [ ] Set keys in Vercel, NOT in code
- [ ] Rotate HF/OpenAI keys quarterly
- [ ] Use separate keys for prod/staging (optional)
- [ ] Enable API key restrictions if available

---

## Support

- Vercel env vars: https://vercel.com/docs/environment-variables
- HF API docs: https://huggingface.co/docs/hub/api
- OpenAI API docs: https://platform.openai.com/docs/api-reference

