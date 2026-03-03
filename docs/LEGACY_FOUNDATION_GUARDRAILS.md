# TradeHax Legacy Foundation Guardrails

## Purpose

This document defines non-negotiable architecture and product rules so TradeHax remains maintainable, trustworthy, and generationally transferable.

## 1) Product North Star

TradeHax must remain clear around three pillars:

1. **AI + Trading Intelligence**
2. **Service Conversion and Client Delivery**
3. **Education / Music / Community Growth**

Every new route, feature, and CTA must map to one pillar.

## 2) Shell + Navigation Rules (Hard Rules)

1. **Single global shell** in [app/layout.tsx](app/layout.tsx).
2. Route pages must not render duplicate top-level headers/footers unless placed in an explicit custom layout group.
3. Navigation links must come from one source-of-truth config (planned: `lib/navigation.ts`).
4. No “menu on top of menu” behavior on any page.

## 3) Route Governance

1. Canonical route required for each product capability.
2. Alias routes must redirect to canonical routes.
3. New top-level route must include:
   - owner
   - business goal
   - primary KPI
   - sunset criteria

## 4) Code Health Standards

1. No UI component should exceed 500 LOC without decomposition plan.
2. Complex pages must separate:
   - container/page orchestration
   - feature sections
   - hooks/state
   - pure display components
3. All shared primitives live under [components/ui](components/ui).
4. Monolith hotspots must be tracked quarterly and split proactively.

## 5) Operational Clarity

1. Keep active source in one canonical workspace tree.
2. Archive old snapshots under a controlled docs/archive policy.
3. Avoid parallel “fresh/repo/main” working copies in active workflow unless explicitly documented.

## 6) Documentation Contract

At all times, the following must be current:

- [README.md](README.md) — onboarding + quickstart
- [docs/SITE_OPTIMIZATION_AUDIT_PLAN.md](docs/SITE_OPTIMIZATION_AUDIT_PLAN.md) — cleanup roadmap
- [docs/LEGACY_FOUNDATION_GUARDRAILS.md](docs/LEGACY_FOUNDATION_GUARDRAILS.md) — long-term standards

## 7) Release Checklist (Legacy-safe)

Before each release:

1. Validate no duplicate shell rendering on touched pages.
2. Confirm route canonicalization for new entrypoints.
3. Confirm top 3 business funnels still have clear CTA path.
4. Verify no new large monolith files were introduced.
5. Update docs if architecture or flow changed.
6. Run `npm run legacy:check` (or `npm run legacy:check:strict` for full enforcement).

## 8) Stewardship Model

To preserve digital legacy quality:

- Assign code owners by pillar.
- Use quarterly architecture reviews.
- Track a “clutter debt” backlog and burn it down every sprint.
- Prefer reversible, documented changes over ad-hoc rewrites.

This is the living contract for building TradeHax as a durable digital familial legacy.
