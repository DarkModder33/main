# Merge Vercel Projects Into One Production Stack

This runbook consolidates these projects into one source of truth:
- `tradehaxai-assistant-*` (old)
- `main-*` / `web-*` (current)

Target state:
- One Vercel project serving `www.tradehax.net` as canonical business hub
- `tradehax.net` + `tradehaxai.tech` + `www.tradehaxai.tech` attached to same project
- AI app available at `https://www.tradehax.net/ai-hub`
- Legacy hosts redirect to canonical target

## 1) Pick Canonical Project (recommended: `main-*` / current `web-*`)
Use the project already deploying commit `4a79af2+` and passing app health checks.

## 2) Attach Domains to Canonical Project
In Vercel dashboard, open canonical project -> Settings -> Domains:
1. Add `www.tradehax.net`
2. Add `tradehax.net`
3. Add `tradehaxai.tech`
4. Add `www.tradehaxai.tech`
5. Add `vallcallya.vercel.app` (optional legacy alias)

Update DNS as prompted by Vercel until all are `Valid`.

## 3) Remove Domains from Old Projects
For each old project (`tradehaxai-assistant-*`, any stale project):
- Settings -> Domains -> Remove attached domains now moved above.

## 4) Copy Environment Variables to Canonical Project (Production)
Required minimum:
- `OPENAI_API_KEY`
- `HF_API_TOKEN` (or `HUGGINGFACE_API_KEY`)
- `TRADEHAX_ODIN_OPEN_MODE`
- `TRADEHAX_ODIN_KEY`
- `POLYGON_API_KEY`

Also copy auth/session keys if used by the app:
- `NEXTAUTH_SECRET`
- `JWT_SECRET`

## 5) Deploy Canonical Project
From repo root:

```powershell
cd C:\tradez\main\web
npm install
npm run build
npm run deploy
```

## 6) Verify Endpoints

```powershell
Invoke-WebRequest -Uri https://www.tradehax.net -UseBasicParsing | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -Uri https://www.tradehax.net/ai-hub -UseBasicParsing | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -Uri https://www.tradehax.net/api/ai/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected:
- Main site 200
- `/ai-hub` 200
- `/api/ai/health` shows at least one provider available (not demo-only)

## 7) Verify Chat Quality
In `/ai-hub` test prompts:
- `analyze $AAPL`
- `analyze $NVDA`
- `deploy parabolic on BTC risk 4`

Expected:
- Distinct responses per ticker
- Right panel `Provider Path` not stuck on `DEMO`

## 8) Cleanup
After 24h stable traffic:
- Archive old Vercel projects
- Keep one deployment pipeline on `main`
- Keep this canonical map:
  - `www.tradehax.net` (primary)
  - `tradehax.net` (alias)
  - `tradehaxai.tech` -> redirect to `/ai-hub`

## Notes
- Redirects are already configured in `web/vercel.json` to force canonical routing after domains are attached to one project.
- If responses still generic, provider keys are missing in the canonical project Production env.

