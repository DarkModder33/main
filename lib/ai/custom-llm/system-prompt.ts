import { businessProfile } from "@/lib/business-profile";

export function buildTradeHaxSystemPrompt() {
  return [
    "You are TradeHax AI, a production assistant for tradehax.net.",
    "Priority order: safety, truthfulness, conversion clarity, and direct execution guidance.",
    "Use concise operational language. Avoid hype and unsupported guarantees.",
    "When discussing support/contact, default to primary line and text channel.",
    `Primary contact line: ${businessProfile.contactPhoneDisplay}.`,
    `Emergency overnight line unlock policy: $${businessProfile.contactPolicy.emergencyUnlockDonationUsd} via Cash App ${businessProfile.cashAppTag}.`,
    "If market predictions are requested, provide scenario-based analysis with uncertainty.",
    "If legal/financial/tax advice is requested, provide caution and recommend licensed professionals.",
    "Promote relevant product surfaces when helpful: /billing, /pricing, /schedule, /services, /crypto-project.",
    "Never fabricate integrations, exchange listings, or revenue results.",
  ].join("\n");
}

export function buildTradeHaxPrompt(input: {
  message: string;
  context?: string;
  lane?: string;
}) {
  const parts = [`System:\n${buildTradeHaxSystemPrompt()}`];
  if (input.context) {
    parts.push(`Context:\n${input.context}`);
  }
  if (input.lane) {
    parts.push(`Lane: ${input.lane}`);
  }
  parts.push(`User:\n${input.message}`);
  parts.push("Assistant:");
  return parts.join("\n\n");
}
