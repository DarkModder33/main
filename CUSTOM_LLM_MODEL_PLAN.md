# Custom LLM Model Plan (TradeHax)

This is the initial implementation path for your site-specific LLM stack.

## Current Foundation Implemented

- Custom endpoint: `POST /api/ai/custom`
- TradeHax persona/system prompt:
  - `lib/ai/custom-llm/system-prompt.ts`
- Usage-gated inference aligned with subscription tiers:
  - Reuses monetization engine and daily AI limits
- Dataset preparation script:
  - `npm run llm:prepare-dataset`
  - Outputs `data/custom-llm/train.jsonl`

## Phase 1: Data and Prompt Quality

1. Expand `ai-training-set.jsonl` with:
   - Services conversion Q&A
   - Billing objections and responses
   - Crypto risk disclaimers
   - Scheduling and emergency policy responses
2. Run `npm run llm:prepare-dataset`.
3. Validate 50+ prompt-response pairs manually.

## Phase 2: Fine-Tune Pipeline

1. Export `data/custom-llm/train.jsonl` to your training provider.
2. Fine-tune an instruct model (Mistral/Llama class).
3. Store resulting model ID in:
   - `HF_MODEL_ID` or `TRADEHAX_CUSTOM_MODEL_ID`
4. Route `/api/ai/custom` to the tuned model in production.

## Phase 3: Retrieval + Guardrails

1. Add retrieval over docs:
   - pricing, booking, services, tokenomics, launch policies.
2. Add policy checks for:
   - financial advice boundaries
   - unsupported claims
   - security-sensitive prompts
3. Track response quality and conversion outcomes.

## Launch KPI Targets

- >= 30% of AI sessions open a CTA path (`/billing`, `/schedule`, `/services`)
- < 2% unsafe/invalid response rate
- Median latency < 2.5s for chat responses
