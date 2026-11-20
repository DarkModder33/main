# TradeHax AI — Development Handoff & Continuity Log

**Repository**: [DarkModder33/main](https://github.com/DarkModder33/main)  
**Primary Domains**: https://tradehax.net · https://tradehaxai.tech  
**Last Updated**: 2026-11-20  
**Purpose**: Accurate, detailed context so any GPT-class model (or human) can continue development without re-discovering the architecture, constraints, or history.

---

## 1. Project Identity

TradeHax is an AI-enhanced Web3 trading platform and local service business site. It combines:

- Public-facing marketing and service pages
- Solana wallet integration
- Investor education (Investor Academy)
- AI trading tools, neural simulations, and custom model routing
- Monetization (credits, subscriptions, affiliate)
- Admin surfaces for AI behavior, social publishing, and deployment controls
- Social media automation (X, Instagram, TikTok, YouTube, etc.)

This is **not** a simple marketing site. It has deep AI/LLM pipelines, Hugging Face fine-tuning workflows, RAG ingestion, canary model routing, and multiple deployment targets.

---

## 2. Current Technical Stack (as of late 2026)

| Layer              | Version / Choice                          |
|--------------------|-------------------------------------------|
| Framework          | Next.js 16.2.3 (App Router)               |
| React              | 19                                        |
| Language           | TypeScript                                |
| Styling            | Tailwind CSS 3 + custom design system     |
| Auth               | next-auth                                 |
| Payments           | Stripe                                    |
| Blockchain         | Solana (ethers + wallet adapters)         |
| AI SDK             | Vercel AI SDK (`ai`, `@ai-sdk/react`)     |
| LLM Backend        | Hugging Face Inference + custom fine-tunes|
| Vector Memory      | Upstash Vector (optional)                 |
| Analytics          | Vercel Analytics + Google Analytics       |
| Error Tracking     | Sentry                                    |
| Hosting (primary)  | Vercel                                    |
| Hosting (alt)      | Namecheap VPS / cPanel (scripts exist)    |

Key dependencies also include Phaser (games), Three.js, Plotly, Socket.io, and Zod for validation.

---

## 3. Repository Layout (High-Level)

```
app/                  # Next.js App Router
  api/                # API routes (account, admin, AI, claim, social, etc.)
  admin/              # Admin pages (AI behavior, monetization, social wizard, investor academy)
  ai-hub/             # AI analytics and hub UI
  ai/                 # Main AI interface
  account/            # User account
  about/, services/, etc.
components/           # Shared UI (landing, monetization, shamrock header/footer, ui)
lib/                  # Core utilities, AI routing, Solana helpers, etc.
scripts/              # Large set of operational scripts (deploy, LLM, social, quality gates)
public/               # Static assets
.github/              # Workflows, Copilot agents/skills, issue templates
.env.example          # Full environment template (very important — read it)
package.json          # Scripts are the operational source of truth
```

There are also many top-level `.md` operational docs (deployment, DNS, LLM plans, runbooks). Prefer those over inventing new processes.

---

## 4. Critical Environment & Configuration

Always start from `.env.example`. Major categories:

- **Solana**: `NEXT_PUBLIC_SOLANA_NETWORK`, `NEXT_PUBLIC_SOLANA_RPC`
- **Hugging Face / Custom Models**: `HF_API_TOKEN`, model IDs, canary rollout percentages, LoRA settings
- **Intelligence Providers**: Unusual Whales, Polygon, Finnhub, Bloomberg (keys + endpoints)
- **Discord**: Multiple webhooks by tier + thread routing
- **Vector / RAG**: Upstash, HF dataset intelligence flags
- **Admin / Security**: Admin keys, rate limiting, consent flags
- **Vercel**: Tokens, project IDs, deploy hooks
- **Feature Flags**: Web3 auth, payments, analytics

Never commit real secrets. Use Vercel environment variables for production.

---

## 5. Development & Quality Scripts (package.json)

These are the preferred way to run things. Do not invent parallel workflows.

| Command                        | Purpose                                      |
|--------------------------------|----------------------------------------------|
| `npm run dev`                  | Local Next.js dev server                     |
| `npm run pipeline:local`       | Lint + type-check + link check + build       |
| `npm run pipeline:quality`     | Lint + type-check                            |
| `npm run check:links`          | Internal link validation                     |
| `npm run deploy:one-click`     | Full production deploy pipeline              |
| `npm run dev:aggressive`       | High-intensity quality + LLM readiness loop  |
| `npm run ai:env:doctor`        | AI environment readiness check               |
| `npm run hivemind:doctor`      | Hivemind / training readiness                |
| `npm run social:check`         | Social API credential status                 |
| `npm run llm:*`                | Dataset prep, validation, fine-tune workflow |
| `npm run launch:readiness`     | Pre-launch checks                            |

There is also an aggressive CI proof gate (`.github/workflows/aggressive-proof-gate.yml`).

---

## 6. Deployment Reality

Two supported paths exist. Pick one and stay consistent:

1. **Vercel** (preferred for most features)  
   - Uses GitHub Actions + Vercel project  
   - Domain wiring via Vercel  
   - See `VERCEL_DOMAIN_SETUP.md` and troubleshooting docs

2. **Namecheap VPS / cPanel**  
   - Custom scripts (`start:cpanel`, deploy scripts)  
   - More manual

**Important**: A commit landing on `main` does **not** automatically mean production is updated. The selected deploy path must complete successfully.

---

## 7. AI / LLM Architecture (Current State)

- Multiple model roles: general, stock, crypto, Kalshi
- Canary rollout system with promotion/rollback streaks
- RAG ingestion from local docs + Hugging Face datasets
- Hivemind / personalization trajectory tracking
- Fine-tuning pipeline for Mistral-style models (LoRA)
- Behavior logging and benchmark governance
- Admin UI for AI behavior tuning

When modifying AI routes or routing logic, preserve the canary and governance flags unless the change is explicitly about them.

---

## 8. Conventions for Future AI Contributors

1. **Read before writing**: Check existing docs (deployment guides, `IDE_AUTOMATION_WORKFLOW.md`, `AI_LLM_INTEGRATION.md`).
2. **Prefer existing scripts** over new one-off commands.
3. **Do not invent new environment variables** without adding them to `.env.example` and documenting them.
4. **Keep TypeScript strict**. Run `npm run type-check` and `npm run lint` before considering work done.
5. **Internal links matter**. Run `npm run check:links` after structural changes.
6. **AI features are multi-layered**. Changes to prompts, routing, or model IDs can affect canary logic, benchmarks, and personalization. Test with `ai:env:doctor` and relevant hivemind scripts.
7. **Secrets stay out of the repo**. Use Vercel env or local `.env.local`.
8. **Deployment is not automatic**. Confirm the active path (Vercel vs Namecheap) before claiming a change is live.

---

## 9. Known Gaps & Recommended Next Steps

- Full automated test coverage is still light (`npm run test` exists but coverage is incomplete).
- Some social providers and intelligence vendor adapters are scaffolded but may need real keys and end-to-end verification.
- Namecheap path is secondary; prefer Vercel unless there is a specific reason.
- Custom fine-tuned models require the Hugging Face pipeline to be run and model IDs updated.
- Investor Academy and some admin surfaces appear partially built — verify completeness before expanding.

---

## 10. Related Repositories

- **tradehax-intel**: Separate Next.js multi-timeframe market intelligence dashboard (static export, GitHub Pages). Different codebase; do not mix the two.
- **tradehaxai-assistant**: Smaller Python/Next prototype (older).

Primary continued development should stay in **this repository** (`DarkModder33/main`) unless explicitly directed otherwise.

---

## 11. How to Use This Document

When starting a new session with any GPT model:

1. Point the model at this file (`DEVELOPMENT.md` or the README).
2. State the specific goal (feature, bug, deploy, AI routing change, etc.).
3. Ask the model to respect the existing scripts, env patterns, and deployment paths.
4. Require a verification step (`pipeline:local` or relevant doctor script) before considering the change complete.

This log is intended to reduce context loss across model sessions and keep the TradeHax platform evolving consistently.

---

*Generated for continuity of development on the TradeHax AI platform.*
