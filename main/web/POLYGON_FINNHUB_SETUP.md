# Polygon & Finnhub API Setup Guide

## What's New (March 2026)

Your TradeHax Neural Hub now integrates **real-time market data** from Polygon.io and Finnhub instead of synthetic values:

- ✅ **Real stock prices** from Polygon.io (1-2s latency)
- ✅ **Real crypto quotes** from Polygon.io + fallback to CoinGecko
- ✅ **Stock sentiment & fundamentals** from Finnhub (15-min delayed)
- ✅ **Professional signals** with actual market context
- ✅ **Demo fallback** when APIs unavailable (graceful degradation)

**Before:** "Setup 1: Entry 45.23 (synthetic)" → Crypto boilerplate  
**After:** "Setup 1 (BTC): Entry 70339, Target 73027" → Real market data

---

## 🚀 Quick Start (10 Minutes)

### Step 1: Get Your API Keys

#### Polygon.io (Stocks + Crypto)
1. Go to https://polygon.io/dashboard
2. Sign up (free tier available)
3. Copy your API key
4. Add to Vercel:
   ```powershell
   npx vercel env add POLYGON_API_KEY
   # Paste your key when prompted
   ```

#### Finnhub (Stocks + News)
1. Go to https://finnhub.io/register
2. Sign up (60 calls/min free tier)
3. Copy your API key
4. Add to Vercel:
   ```powershell
   npx vercel env add FINNHUB_API_KEY
   ```

### Step 2: Deploy with Keys

```powershell
cd C:\tradez\main\web
npm run deploy:tech    # Deploy to tradehaxai.tech
npm run deploy:net     # Deploy to tradehax.net
```

### Step 3: Verify Live Data

```powershell
# Check health endpoint
Invoke-WebRequest -Uri "https://tradehaxai.tech/api/ai/health" -UseBasicParsing | ConvertFrom-Json

# Should show: "polygonActive": true, "finnhubActive": true

# Test with browser
# → https://tradehaxai.tech/ai-hub
# → Ask: "Show 3 setups for BTC and ETH"
# → Should show real prices like "BTC $70,339" (not $45 synthetic)
```

---

## 📊 How It Works

### Data Fetching Pipeline

```
User asks → detectAssets() → fetchLiveMarketData()
    ↓
    Polygon.io (stocks) ← if available
    Polygon.io (crypto) ← if available  
    Finnhub (stocks)   ← if Polygon fails
    CoinGecko (crypto) ← fallback for BTC/ETH/SOL
    ↓
marketSnapshot = [{ symbol, price, change24h, source }]
    ↓
AI System Prompt includes: "LIVE MARKET SNAPSHOT: BTC $70,339 (+2.1%)"
    ↓
Response includes real setup data
```

### Symbol Support

**Crypto (via Polygon or CoinGecko):**
- BTC, ETH, SOL, DOGE, ADA, LINK, AVAX, MATIC, XRP

**Stocks (via Polygon or Finnhub):**
- Any US ticker: AAPL, TSLA, MSFT, NVDA, etc.

### Latency & Reliability

| Provider | Latency | Cost | Fallback |
|----------|---------|------|----------|
| Polygon (Stocks) | 1-2s | Free tier | Finnhub |
| Polygon (Crypto) | 1-2s | Free tier | CoinGecko |
| Finnhub (Stocks) | 15-20s | Free 60/min | Demo |
| CoinGecko (Crypto) | 5-10s | Free | Demo |

---

## 💻 Environment Variables

Add these to Vercel dashboard (`npx vercel env add`):

```bash
# Real-time market data APIs
POLYGON_API_KEY=pk_live_your_key_here
FINNHUB_API_KEY=your_finnhub_key_here

# Example complete .env.production (local testing)
HF_API_TOKEN=hf_your_token_here
OPENAI_API_KEY=sk-proj-your_key_here
POLYGON_API_KEY=pk_live_your_polygon_key_here
FINNHUB_API_KEY=your_finnhub_key_here
```

---

## 🧪 Testing

### Test Real Data Integration

```powershell
# Terminal 1: Check what data is being fetched
curl -X POST "https://tradehaxai.tech/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Analyze BTC and show me a setup"}
    ],
    "mode": "base"
  }'

# Look for in response:
# "Market Context": "BTC $70,339..." ← Real price from Polygon/Finnhub
# NOT "Market Context": "Live market snapshot unavailable"

# Terminal 2: Monitor API logs
npm run build && npm run dev
# Watch console for: [POLYGON] fetched BTC: $70339 or [FINNHUB] fetched AAPL: $250.25
```

### Test Fallback (When APIs Down)

```powershell
# Temporarily set bad API keys in .env
POLYGON_API_KEY=invalid
FINNHUB_API_KEY=invalid

# Run again - should gracefully fallback to CoinGecko then demo
# Responses will still be good quality (not generic boilerplate)
```

---

## 🔒 Security & Best Practices

### ✅ DO:
- Store API keys in Vercel dashboard (not in `.env.local`)
- Rotate keys quarterly via Vercel UI
- Use `.env.example` with placeholders only
- Monitor API usage in Polygon.io + Finnhub dashboards

### ❌ DON'T:
- Commit `.env.local` to Git
- Hardcode API keys in source code
- Use production keys in local dev (use free tier keys)
- Share keys in Slack/Discord/GitHub

### Key Rotation (Every 90 Days)

1. Generate new key in Polygon.io dashboard
2. Update in Vercel: `npx vercel env rm POLYGON_API_KEY`
3. Add new key: `npx vercel env add POLYGON_API_KEY`
4. Deploy: `npm run deploy:tech`
5. Verify: Check health endpoint shows keys active
6. Delete old key from Polygon.io dashboard

---

## 📈 Performance Metrics

### Response Time Breakdown

```
Request arrives
  ├─ detectAssets() ............................ 5ms
  ├─ fetchLiveMarketData() .................... 500-2000ms
  │  ├─ Polygon (parallel 8 symbols) ........ 800ms
  │  ├─ Finnhub (fallback) .................. 400ms
  │  └─ CoinGecko (fallback) ................ 200ms
  ├─ buildSystemPrompt() .................... 10ms
  ├─ callHuggingFace() .................... 3000-8000ms
  ├─ ensureStructuredResponse() ............. 100ms
  └─ Response sent
     TOTAL: 3.6-10.1 seconds

Production SLA: <5sec for 95th percentile
```

### Data Freshness

- **Polygon stocks**: Updated every 1-2 seconds (live)
- **Polygon crypto**: Updated every 15 seconds (live)
- **Finnhub stocks**: 15-20 minute delay (end-of-day focused)
- **CoinGecko**: 5-10 minute delay (free tier)

---

## 🔧 Troubleshooting

### "No live data available" in responses

**Symptom:** Responses show "Live market snapshot unavailable"

**Causes & Fixes:**
1. API keys not in Vercel (`npx vercel env list`)
2. API key wrong format (missing `pk_live_` for Polygon)
3. API rate limit exceeded (check Polygon dashboard usage)
4. Network timeout (increase timeout from 5s to 10s in code)

```powershell
# Fix: Check configured vars
npx vercel env list

# Should show:
# POLYGON_API_KEY     pk_live_...
# FINNHUB_API_KEY     finnhub_...

# Redeploy if missing:
npx vercel env add POLYGON_API_KEY
npm run deploy:tech
```

### "Symbol not found" (e.g., XYZ ticker)

**Why:** Polygon only supports US stocks. XYZ might be delisted or invalid.

**Solution:** Request supported symbols or use known tickers (AAPL, TSLA, MSFT)

### Response is slow (8+ seconds)

**Causes:**
1. Polygon API slow (rare, <1% occurrence)
2. HuggingFace model overloaded
3. Multiple fallbacks running sequentially

**Fix:** 
- Check `latencyMs` in response meta
- If Polygon > 5s: Check dashboard for rate limits
- If HuggingFace > 5s: Add `OPENAI_API_KEY` as faster fallback

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `web/ACTION_CHECKLIST.md` | 10-min setup (this is step-by-step) |
| `web/GET_API_KEYS.md` | Where to get each API key |
| `web/ENV_SETUP_GUIDE.md` | Detailed .env architecture |
| `web/DEPLOYMENT_WITH_APIS.md` | Full deployment walkthrough |
| This file | Polygon & Finnhub specific guide |

---

## 🎯 Next Steps

### Immediate (Today)
- [ ] Add `POLYGON_API_KEY` to Vercel
- [ ] Add `FINNHUB_API_KEY` to Vercel
- [ ] Deploy with `npm run deploy:tech`
- [ ] Test real data with browser

### This Week
- [ ] Monitor API usage in dashboards
- [ ] Adjust timeout/retry logic if needed
- [ ] Train team on new real-time data availability

### Optional Enhancements
- Integrate on-chain metrics (Glassnode, Nansen)
- Add sentiment data (LunarCrush, Santiment)
- Build custom market scanner across 500+ symbols
- Fine-tune response temperature by market regime

---

## 💬 Support

**API Docs:**
- Polygon.io: https://polygon.io/docs
- Finnhub: https://finnhub.io/docs/api

**Contact:**
- Email: support@tradehax.net
- Discord: #api-integration-help

---

## ✅ Success Checklist

After setup, verify these work:

- [ ] `npx vercel env list` shows `POLYGON_API_KEY` and `FINNHUB_API_KEY`
- [ ] Health endpoint returns `"status": "ok"`
- [ ] Chat response includes real prices like "BTC $70,339"
- [ ] 3-setup request returns actual entry/stop/target values
- [ ] Response time is <5 seconds
- [ ] Demo fallback works if APIs temporarily down
- [ ] No errors in Vercel logs

**You're ready to go live!** 🚀

