# TradeHax Route Ownership Matrix

## Purpose

This matrix defines who owns each canonical route family, what business outcome it serves, and when it should be revised or sunset.

## Ownership Model

- Owner values are role-based so stewardship survives team/person changes.
- Each route group has one primary KPI and a sunset/review trigger.
- Alias routes must redirect to canonical routes and inherit the same owner.

## Canonical Route Matrix

| Route Family | Canonical Routes | Owner | Business Goal | Primary KPI | Review / Sunset Trigger |
| --- | --- | --- | --- | --- | --- |
| AI Workspace | `/ai-hub` | AI Product Steward | Unified AI execution surface | AI hub session completion rate | Review if completion drops 20%+ over 2 release cycles |
| Intelligence | `/intelligence`, `/intelligence/*` | Quant Intelligence Steward | Signal interpretation and operator workflows | Weekly active intelligence users | Review if WAU or alert engagement declines 15%+ |
| Trading | `/trading` | Trading Systems Steward | Bot management and strategy execution | Bot activation CTR | Review if activation funnel stalls for 2 sprints |
| Services | `/services`, `/schedule` | Service Operations Steward | Bookings and paid service conversions | Booking conversion rate | Sunset/rework if conversion under target for 2 months |
| Billing | `/pricing`, `/billing`, `/admin/monetization/*` | Revenue Operations Steward | Plan selection and account monetization | Paid conversion + MRR growth | Review if paid conversion falls below baseline |
| Education | `/investor-academy`, `/music/lessons` | Education Program Steward | Learning progression and retention | Module completion + lesson booking rate | Review if completion retention drops 15%+ |
| Community/Content | `/blog`, `/blog/*`, `/music/showcase`, `/music/scholarships` | Community Growth Steward | Trust, reach, and audience growth | Return visitor rate + newsletter capture | Review if returning users trend down for 2 cycles |
| Web3/Game | `/crypto-project`, `/games`, `/game` | Web3 Experience Steward | Engagement loops and reward utility | Gameplay session depth + return rate | Rework if engagement depth degrades 20%+ |
| Platform/Admin | `/admin/*`, `/dev-hub`, `/preview` | Platform Reliability Steward | Operational safety and diagnostics | Admin panel availability + error budget | Review on any repeated incident class |

## Active Alias Redirects

- `/ai` → `/ai-hub`
- `/portal` → `/login`
- `/music` → `/music/lessons`

## Governance Rules

1. New top-level route requires: owner, KPI, business goal, and review trigger.
2. Route changes must update this file in the same PR.
3. Removing a route requires migration path + redirect plan.
4. KPI definitions should match analytics event names in implementation docs.

## Quarterly Stewardship Checklist

1. Verify canonical route map still matches product IA.
2. Confirm aliases still redirect correctly.
3. Check KPI trend health by route family.
4. Close or escalate stale route groups with no measurable outcome.
