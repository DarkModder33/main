# Secure Environment Variable Setup Guide

## ⚠️ NEVER commit `.env` with live credentials to Git

This guide shows how to safely configure APIs for local dev and production.

---

## Local Development Setup

### 1. Create `.env.local` (NOT in Git)
```bash
# .env.local — LOCAL ONLY, add to .gitignore
cp .env.example .env.local
```

### 2. Fill in your local secrets in `.env.local`
Only you see this file—it stays on your machine.

```
# Copy your actual API keys from the production guide below
HF_API_TOKEN=hf_xxxxxxxx...
OPENAI_API_KEY=sk-proj-xxxxxxx...
# etc.
```

### 3. Test locally
```bash
npm run dev
# Open http://localhost:5173
```

---

## Production Setup (Vercel)

### Step 1: Set Environment Variables in Vercel Dashboard

**GUI Method (Recommended):**
1. Go to https://vercel.com/dashboard/tradehax-ai-assistant
2. Click **Settings** → **Environment Variables**
3. Add each secret from the `.env.example` template
4. Select **Production** scope
5. Save

**CLI Method (Alternative):**
```bash
npx vercel env add HF_API_TOKEN
# Paste your token when prompted
# Select: Production
```

### Step 2: Verify Secrets are Set
```bash
npx vercel env ls
```

### Step 3: Deploy
```bash
npm run deploy:tech
# Vercel will inject env vars at build time
```

---

## API Keys You'll Need

| Service | Purpose | How to Get |
|---------|---------|-----------|
| **Hugging Face** | LLM inference (free) | https://huggingface.co/settings/tokens |
| **OpenAI** | GPT-4 fallback | https://platform.openai.com/api-keys |
| **Groq** | Fast LLM alternative | https://console.groq.com/keys |
| **Anthropic** | Claude API | https://console.anthropic.com/ |
| **Finnhub** | Stock/crypto data | https://finnhub.io/dashboard |
| **Supabase** | Database | https://supabase.com/dashboard |
| **Solana RPC** | Blockchain | https://helius.dev (free tier) |

---

## `.env.example` (Safe to Commit)

Keep this in the repo with **placeholder values only**:

```env
# Example values — REPLACE with your actual keys

NODE_ENV=production
HF_API_TOKEN=hf_YOUR_TOKEN_HERE
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
GROQ_API_KEY=gsk_YOUR_KEY_HERE
FINNHUB_API_KEY=your_token_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Troubleshooting

**Q: Vercel deploy fails with "undefined" API key**
- A: Environment variables not set in Vercel. Run `npx vercel env ls` and add missing keys.

**Q: Local dev works but production doesn't**
- A: `.env.local` doesn't auto-load in Vercel. Use Vercel dashboard instead.

**Q: I accidentally committed secrets**
- A: Rotate all keys immediately. Use `git-filter-repo` to remove from history.
  ```bash
  git filter-repo --path .env.local --invert-paths
  ```

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] No raw API keys in any committed files
- [ ] Secrets set in Vercel dashboard (not in code)
- [ ] Using different keys for dev/prod (optional but recommended)
- [ ] Keys rotated if ever leaked
- [ ] Rate limiting enabled on APIs

---

## Next Steps

1. **Create `.env.local`** with your actual API keys
2. **Test locally** with `npm run dev`
3. **Set keys in Vercel** dashboard
4. **Deploy** with `npm run deploy:tech`

Questions? Check Vercel docs: https://vercel.com/docs/environment-variables

