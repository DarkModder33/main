# TradeHax Site Optimization Audit + Execution Plan

## 1) Audit Summary (What is causing clutter)

### A. Shell duplication (major UX clutter source)
- Global shell already renders top nav/footer and utility overlays in [app/layout.tsx](app/layout.tsx).
- Many pages also render local page shells (`ShamrockHeader` + `ShamrockFooter`), creating stacked navigation and inconsistent hierarchy.
- High-impact examples:
  - [app/ai-hub/page.tsx](app/ai-hub/page.tsx)
  - [app/intelligence/page.tsx](app/intelligence/page.tsx)
  - plus many other route pages with repeated shell wrappers.

### B. Information architecture is fragmented
- Route taxonomy includes overlapping hubs and parallel paths:
  - `ai`, `ai-hub`, `dev-hub`, `dashboard`, `trading`, `intelligence`, `portal`, `games`, `game`, etc.
- This increases decision fatigue and weakens conversion flow.

### C. Component complexity hotspots
Largest files indicate concentration of logic and UI in monoliths:
- ~161 KB: [components/landing/AINeuralHub.tsx](components/landing/AINeuralHub.tsx)
- ~95 KB: [components/ai/HFChatComponent.tsx](components/ai/HFChatComponent.tsx)
- ~77 KB: [app/game/GamePageClient.tsx](app/game/GamePageClient.tsx)
- ~63 KB: [lib/investor-academy/store.ts](lib/investor-academy/store.ts)

### D. Navigation definitions are distributed
- Navigation behavior is spread across:
  - [app/layout.tsx](app/layout.tsx) (`global-top-nav`)
  - [components/shamrock/ShamrockHeader.tsx](components/shamrock/ShamrockHeader.tsx)
  - [components/ui/MobileMenu.tsx](components/ui/MobileMenu.tsx)
  - [components/dashboard/Navbar.tsx](components/dashboard/Navbar.tsx)
- This causes inconsistent menus and drift over time.

### E. Repository hygiene / operational clutter
Local workspace has large parallel directories that can confuse active development:
- `tradehax-fresh` (~2 GB local)
- `archive`
- `main`, `tradehax`, `tradehax-repo`

## 2) Site Intent Model (what the site should optimize for)

Define and enforce 3 primary intents:
1. **Trading Intelligence + AI Execution** (core growth engine)
2. **Service Conversion** (book/quote/paid service actions)
3. **Music/Education** (secondary vertical)

Everything in nav, home sections, and CTAs should map to one of these intents.

## 3) Target Architecture

### Shell policy
- **One global shell only** in [app/layout.tsx](app/layout.tsx).
- Page-level shells only when a route uses a dedicated, isolated layout group.

### Route policy
- Keep one primary AI route: `/ai-hub`.
- Keep one primary trading intelligence route: `/intelligence`.
- Route aliases should redirect to canonical pages.

### Navigation policy
- Single source of truth for nav config (`lib/navigation.ts` target).
- Global desktop/mobile/nav components consume shared config.

### Component policy
- Hard cap: no UI file > 500 LOC without decomposition plan.
- Extract hooks + feature subcomponents for monolith files.

## 4) Phased Cleanup Plan

## Phase 0 (1-2 days): Stabilize + baseline
- Freeze new feature additions except critical fixes.
- Capture baseline metrics:
  - Lighthouse (home, ai-hub, intelligence)
  - route count
  - bundle size
  - top conversion events
- Output: `docs/BASELINE_METRICS.md`

## Phase 1 (2-4 days): Remove stacked UI shells
- Audit all pages importing `ShamrockHeader/ShamrockFooter`.
- Remove local shells where global shell already applies.
- Keep one exception list for truly custom-layout routes.
- Output: single consistent nav/footer behavior.

## Phase 2 (3-5 days): Information architecture consolidation
- Canonical route map:
  - AI: `/ai-hub`
  - Intelligence: `/intelligence`
  - Services: `/services` + `/schedule`
- Convert overlapping pages to redirects or merge content sections.
- Simplify top nav to 5-7 primary items.
- Output: reduced cognitive load + clearer conversion paths.

## Phase 3 (5-8 days): Decompose monolith components
- Split [components/landing/AINeuralHub.tsx](components/landing/AINeuralHub.tsx) into:
  - `features`, `sections`, `hooks`, `view-model`
- Continue decomposition of [components/ai/HFChatComponent.tsx](components/ai/HFChatComponent.tsx):
  - chat feed, composer, side rail, session manager
- Game and academy modules: isolate feature bundles and lazy-load boundaries.
- Output: smaller files, easier maintenance, fewer regressions.

## Phase 4 (2-3 days): Repo/documentation hygiene
- Move old runbooks and legacy docs to `/docs/archive`.
- Keep one operator entrypoint:
  - `README.md` (quickstart)
  - `docs/ARCHITECTURE.md` (source of truth)
  - `docs/OPERATIONS.md` (deploy/runbook)
- Clean workspace-only directories from active dev workflow.
- Output: reduced noise for contributors and faster onboarding.

## 5) Prioritized Execution Backlog (first 10 tickets)

1. Create shell exception map (which routes may own custom shell).
2. Remove duplicate shells from AI + Intelligence pages first.
3. Introduce centralized nav config and refactor global nav consumers.
4. Canonicalize AI and Intelligence routes with redirects.
5. Flatten top nav taxonomy to intent-based IA.
6. Extract `HFChat` side rail into dedicated component.
7. Extract `HFChat` session manager state into hook.
8. Break `AINeuralHub` into sections and lazy chunk boundaries.
9. Add route ownership matrix (`docs/ROUTE_OWNERSHIP.md`).
10. Archive obsolete deployment/docs clutter.

## 6) Success Metrics (must be measured)

- **UX clarity:**
  - Fewer nav items clicked before conversion
  - Lower bounce from home and ai-hub
- **Performance:**
  - LCP/INP improvements on home + ai-hub
  - Lower JS transfer on first load
- **Maintainability:**
  - Reduce files > 500 LOC
  - Reduce duplicate shell imports across route pages
- **Business:**
  - Increased `schedule` / `pricing` / `ai-hub` conversion CTR

## 7) Immediate Next Sprint Recommendation (7 days)

- Days 1-2: Phase 0 + Phase 1 on AI/Intelligence routes
- Days 3-4: Phase 2 canonical route and nav simplification
- Days 5-7: Begin Phase 3 decomposition of AI monoliths

If executed in this order, clutter drops quickly while preserving momentum toward revenue and trading-intelligence goals.
