import { event } from "@/lib/analytics";

export type ServiceConversionId =
  | "open_schedule"
  | "open_pricing"
  | "open_crypto_project"
  | "open_dashboard"
  | "open_game"
  | "open_portfolio"
  | "book_repair_quote"
  | "book_guitar_lesson"
  | "book_web3_consult"
  | "book_trading_consult"
  | "book_social_media_consult"
  | "book_it_management_consult"
  | "book_app_development_consult"
  | "book_database_consult"
  | "book_ecommerce_consult"
  | "email_contact";

type FunnelStage = "awareness" | "consideration" | "intent";

interface ConversionMeta {
  action: string;
  label: string;
  value: number;
  stage: FunnelStage;
}

export const SERVICE_CONVERSION_EVENTS: Record<ServiceConversionId, ConversionMeta> = {
  open_schedule: {
    action: "open_schedule",
    label: "schedule_route",
    value: 2,
    stage: "consideration",
  },
  open_pricing: {
    action: "open_pricing",
    label: "pricing_route",
    value: 2,
    stage: "consideration",
  },
  open_crypto_project: {
    action: "open_crypto_project",
    label: "crypto_route",
    value: 2,
    stage: "consideration",
  },
  open_dashboard: {
    action: "open_dashboard",
    label: "dashboard_route",
    value: 1,
    stage: "awareness",
  },
  open_game: {
    action: "open_game",
    label: "game_route",
    value: 1,
    stage: "awareness",
  },
  open_portfolio: {
    action: "open_portfolio",
    label: "portfolio_route",
    value: 2,
    stage: "consideration",
  },
  book_repair_quote: {
    action: "book_repair_quote",
    label: "repair_quote",
    value: 8,
    stage: "intent",
  },
  book_guitar_lesson: {
    action: "book_guitar_lesson",
    label: "guitar_booking",
    value: 8,
    stage: "intent",
  },
  book_web3_consult: {
    action: "book_web3_consult",
    label: "web3_consult",
    value: 10,
    stage: "intent",
  },
  book_trading_consult: {
    action: "book_trading_consult",
    label: "trading_consult",
    value: 9,
    stage: "intent",
  },
  book_social_media_consult: {
    action: "book_social_media_consult",
    label: "social_media_consult",
    value: 7,
    stage: "intent",
  },
  book_it_management_consult: {
    action: "book_it_management_consult",
    label: "it_management_consult",
    value: 8,
    stage: "intent",
  },
  book_app_development_consult: {
    action: "book_app_development_consult",
    label: "app_development_consult",
    value: 9,
    stage: "intent",
  },
  book_database_consult: {
    action: "book_database_consult",
    label: "database_consult",
    value: 8,
    stage: "intent",
  },
  book_ecommerce_consult: {
    action: "book_ecommerce_consult",
    label: "ecommerce_consult",
    value: 8,
    stage: "intent",
  },
  email_contact: {
    action: "email_contact",
    label: "support_email",
    value: 7,
    stage: "intent",
  },
};

export function trackServiceConversion(id: ServiceConversionId, surface: string) {
  const conversion = SERVICE_CONVERSION_EVENTS[id];

  event({
    action: conversion.action,
    category: "service_conversion",
    label: `${conversion.label}:${surface}:${conversion.stage}`,
    value: conversion.value,
  });

  if (typeof window !== "undefined" && window.gtag && conversion.stage === "intent") {
    window.gtag("event", "generate_lead", {
      currency: "USD",
      value: conversion.value,
      event_category: "service_conversion",
      event_label: `${conversion.label}:${surface}`,
    });
  }
}
