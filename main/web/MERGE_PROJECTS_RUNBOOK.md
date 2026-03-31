# Production Domain Architecture Runbook (Dual-Project)

Keep two Vercel projects by design:
- **Business Hub Project** -> `tradehax.net`, `www.tradehax.net`
- **AI App Project** -> `tradehaxai.tech`, `www.tradehaxai.tech`

Target state:
- `tradehax.net` remains the umbrella business site (services, guitar, booking)
- `tradehaxai.tech` remains dedicated to ODIN/AI chatbot
- AI site includes a clear gateway back to business hub (`https://www.tradehax.net`)

## 1) Domain Ownership

### Business Hub Project
Attach only:
1. `www.tradehax.net` (primary)
2. `tradehax.net` (alias)

### AI App Project
Attach only:
1. `tradehaxai.tech` (primary)
2. `www.tradehaxai.tech` (alias)

Remove cross-attached domains from the opposite project.

## 2) Environment Variables (AI App Project, Production)
Required minimum:
- `OPENAI_API_KEY`
- `HF_API_TOKEN` (or `HUGGINGFACE_API_KEY`)
- `TRADEHAX_ODIN_OPEN_MODE`
- `TRADEHAX_ODIN_KEY`
- `POLYGON_API_KEY`

If auth/session features are used on AI app:
- `NEXTAUTH_SECRET`
- `JWT_SECRET`

## 3) Business Hub CTA to AI App
Add a prominent link/button on `tradehax.net`:
- Label: **Launch ODIN App**
- URL: `https://tradehaxai.tech/ai-hub`

## 4) AI App Gateway Back to Business Hub
Keep a visible gateway on `tradehaxai.tech`:
- Label: **Back to TradeHax Business Hub**
- URL: `https://www.tradehax.net`

## 5) Deploy AI App Project

```powershell
cd C:\tradez\main\web
npm install
npm run build
npm run deploy
```

## 6) Verify Endpoints

```powershell
Invoke-WebRequest -Uri https://www.tradehax.net -UseBasicParsing | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -Uri https://tradehaxai.tech -UseBasicParsing | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -Uri https://tradehaxai.tech/api/ai/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected:
- `www.tradehax.net` returns 200 and shows business pages
- `tradehaxai.tech` returns 200 and shows AI app
- `tradehaxai.tech/api/ai/health` reports at least one provider available (not demo-only)

## 7) Verify Chat Quality
On `https://tradehaxai.tech/ai-hub` test:
- `analyze $AAPL`
- `analyze $NVDA`
- `deploy parabolic on BTC risk 4`

Expected:
- Distinct responses by ticker
- Smart monitor `Provider Path` not stuck on `DEMO`

## 8) Operational Notes
- Do **not** merge domains into one project unless explicitly needed.
- Keep deployment pipelines separate for safer rollbacks.
- If responses are generic, provider keys are missing in AI project Production env.
