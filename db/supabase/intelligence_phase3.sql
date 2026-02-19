-- TradeHax Intelligence Phase 3 schema
-- Run this in Supabase SQL editor before enabling TRADEHAX_INTELLIGENCE_STORAGE=supabase

create table if not exists public.tradehax_watchlist_items (
  id text primary key,
  "userId" text not null,
  symbol text not null,
  "assetType" text not null check ("assetType" in ('equity', 'crypto')),
  "minFlowPremiumUsd" numeric null,
  "minDarkPoolNotionalUsd" numeric null,
  "minCryptoNotionalUsd" numeric null,
  "minUnusualScore" numeric null,
  "minConfidence" numeric null,
  notes text null,
  active boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create unique index if not exists tradehax_watchlist_items_user_symbol_asset_idx
  on public.tradehax_watchlist_items ("userId", symbol, "assetType");

create index if not exists tradehax_watchlist_items_user_updated_idx
  on public.tradehax_watchlist_items ("userId", "updatedAt" desc);

create table if not exists public.tradehax_intelligence_alerts (
  id text primary key,
  "userId" text not null,
  symbol text not null,
  "assetType" text not null check ("assetType" in ('equity', 'crypto')),
  source text not null check (source in ('flow', 'dark_pool', 'crypto', 'news')),
  severity text not null check (severity in ('info', 'watch', 'urgent')),
  title text not null,
  summary text not null,
  "triggeredAt" timestamptz not null default now(),
  route text not null,
  "referenceId" text null,
  "deliveredToDiscordAt" timestamptz null
);

create index if not exists tradehax_intelligence_alerts_user_triggered_idx
  on public.tradehax_intelligence_alerts ("userId", "triggeredAt" desc);

create index if not exists tradehax_intelligence_alerts_user_source_ref_idx
  on public.tradehax_intelligence_alerts ("userId", source, coalesce("referenceId", ''), "triggeredAt" desc);

-- Optional: enable row level security if exposing direct client access later.
-- alter table public.tradehax_watchlist_items enable row level security;
-- alter table public.tradehax_intelligence_alerts enable row level security;
